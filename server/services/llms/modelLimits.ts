import { LLM_CONSTS } from './consts';
import { RateLimiterConfig } from './llmRateLimiter';

const envOr = (key: string, fallback: number) =>
  Number(process.env[key] ?? fallback);

export const modelLimitConfig: Record<string, RateLimiterConfig> = {
  [LLM_CONSTS.MODELS.GPT_5_2]: {
    requestsPerMinute: 500,
    tokensPerMinute: 500_000,
  },
  [LLM_CONSTS.MODELS.GPT_5_MINI]: {
    requestsPerMinute: 500,
    tokensPerMinute: 500_000,
  },
  [LLM_CONSTS.MODELS.GPT_5_NANO]: {
    requestsPerMinute: 1000,
    tokensPerMinute: 100_000,
  },
  [LLM_CONSTS.MODELS.GPT_5_2_CODEX]: {
    requestsPerMinute: 500,
    tokensPerMinute: 500_000,
  },
};

export const defaultLimitConfig: RateLimiterConfig = {
  requestsPerMinute: envOr('OPENAI_DEFAULT_RPM', 500),
  tokensPerMinute: envOr('OPENAI_DEFAULT_TPM', 30_000),
};
