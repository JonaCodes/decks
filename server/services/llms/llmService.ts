import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import type { ModelMessage } from 'ai';
import { z } from 'zod';
import { LlmRateLimiter, estimateTokens } from './llmRateLimiter';
import { modelLimitConfig, defaultLimitConfig } from './modelLimits';
import { LlmCallContext, LlmObjectResult } from './types';
import LlmTokenUsage from '../../models/llm_token_usage';
import {
  LLM_CONSTS,
  LLMProvider,
  MODEL_PRICING,
  assertModelIsPriced,
} from './consts';
import { getUsageStatus } from './usageStatusService';
import { BuilderMonthlyLimitExceededError } from './errors';
import logger from 'logger';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey:
    process.env.NODE_ENV === 'production'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.CLAUDE_LOCAL_API_KEY,
});

// TO CHECK: does this persist across requests? Not server resets, just ongoing request from same browser-server communication
const rateLimiters = new Map<string, LlmRateLimiter>();

const getRateLimiter = (model: string): LlmRateLimiter => {
  let limiter = rateLimiters.get(model);
  if (!limiter) {
    const config = modelLimitConfig[model] ?? defaultLimitConfig;
    limiter = new LlmRateLimiter(config);
    rateLimiters.set(model, limiter);
  }
  return limiter;
};

interface CallLLMParams<T> {
  context: LlmCallContext;
  provider: LLMProvider;
  model: string;
  systemPrompt: string;
  messages: ModelMessage[];
  outputSchema: z.ZodSchema<T>;
  temperature?: number;
}

async function assertUsageCapacity(userId: number): Promise<void> {
  const status = await getUsageStatus(userId);
  if (status.isMonthlyLimitExceeded) {
    throw new BuilderMonthlyLimitExceededError(status);
  }
}

export async function callLLM<T>({
  context,
  provider,
  model,
  systemPrompt,
  messages,
  outputSchema,
  temperature = 0.1,
}: CallLLMParams<T>): Promise<LlmObjectResult<T>> {
  assertModelIsPriced(model);
  await assertUsageCapacity(context.userId);

  const providerModel =
    provider === LLM_CONSTS.PROVIDERS.OPENAI ? openai(model) : anthropic(model);

  const limiter = getRateLimiter(model);

  const fullText =
    systemPrompt +
    messages
      .map((msg) => (typeof msg.content === 'string' ? msg.content : ''))
      .join('');
  // TODO: Add a centralized hard input-size guard here (chars/tokens) so every LLM entry point is protected consistently.
  const estimatedTokens = estimateTokens(fullText);

  await limiter.acquire(estimatedTokens);

  logger.info({ model, taskName: context.taskName }, 'Calling LLM');
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(
      { taskName: context.taskName, model, systemPrompt, messages },
      'LLM payload'
    );
  }
  try {
    const { output, usage } = await generateText({
      model: providerModel,
      system: systemPrompt,
      messages,
      output: Output.object({ schema: outputSchema }),
      temperature,
    });

    const actualTokens = usage?.totalTokens ?? estimatedTokens;
    const tokenDelta = estimatedTokens - actualTokens;

    limiter.adjustTokenDelta(tokenDelta);

    recordTokenUsage({
      context,
      model,
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
    }).catch((err) => {
      console.error('Failed to record token usage:', err);
    });

    return {
      object: output,
      usage: {
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
      },
    };
  } catch (error) {
    limiter.adjustTokenDelta(estimatedTokens);
    throw error;
  }
}

async function recordTokenUsage({
  context,
  model,
  inputTokens,
  outputTokens,
}: {
  context: LlmCallContext;
  model: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  const cost =
    (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;

  await LlmTokenUsage.create({
    accountId: context.accountId,
    userId: context.userId,
    workflowId: context.workflowId ?? null,
    taskName: context.taskName,
    model,
    inputTokens,
    outputTokens,
    cost,
  });
}
