export interface LlmCallContext {
  accountId: number;
  userId: number;
  taskName: string;
  workflowId?: number;
}

export interface LlmObjectResult<T> {
  object: T;
  usage: { inputTokens: number; outputTokens: number };
}
