export const LLM_TASK_NAMES = {} as const;

export const LLM_CONSTS = {
  PROVIDERS: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
  },
  MODELS: {
    GPT_5_2_CODEX: 'gpt-5.2-codex',
    GPT_5_2: 'gpt-5.2',
    GPT_5_1_CODEX_MINI: 'gpt-5.1-codex-mini',
    GPT_5_MINI: 'gpt-5-mini',
    GPT_5_NANO: 'gpt-5-nano',
  },
  RESPONSE_TYPES: {
    OBJECT: 'object',
    ARRAY: 'array',
  },
} as const;

export type LLMProvider =
  (typeof LLM_CONSTS.PROVIDERS)[keyof typeof LLM_CONSTS.PROVIDERS];

type ModelName = (typeof LLM_CONSTS.MODELS)[keyof typeof LLM_CONSTS.MODELS];

// Prices in USD per 1 million tokens
export const MODEL_PRICING: Record<
  ModelName,
  { input: number; output: number }
> = {
  [LLM_CONSTS.MODELS.GPT_5_2_CODEX]: { input: 1.75, output: 14.0 },
  [LLM_CONSTS.MODELS.GPT_5_2]: { input: 1.75, output: 14.0 },
  [LLM_CONSTS.MODELS.GPT_5_1_CODEX_MINI]: { input: 0.25, output: 2.0 },
  [LLM_CONSTS.MODELS.GPT_5_MINI]: { input: 0.25, output: 2.0 },
  [LLM_CONSTS.MODELS.GPT_5_NANO]: { input: 0.05, output: 0.4 },
};

export function assertModelIsPriced(model: string): void {
  if (!(model in MODEL_PRICING)) {
    throw new Error(`Model '${model}' has no pricing entry in MODEL_PRICING`);
  }
}
