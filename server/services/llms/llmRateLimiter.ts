/*
  Generic in‑memory sliding‑window limiter. Keeps request‑count and token‑count
  inside the caps you pass in. Public surface kept intentionally tiny so we can
  swap this class for a Redis‑backed implementation later without touching any
  call‑sites.

  This is for avoiding API Rate Limits
*/
export interface RateLimiterConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  safetyMargin?: number; // 0‑1; defaults to 0.9
}

type QueueEntry = {
  estimatedTokens: number;
  resolve: () => void;
};

export class LlmRateLimiter {
  private readonly requestCap: number;
  private readonly tokenCap: number;
  private readonly refillReqPerMs: number;
  private readonly refillTokPerMs: number;
  private lastRefillAt = Date.now();
  private reqBucket: number;
  private tokBucket: number;
  private queue: QueueEntry[] = [];

  constructor(cfg: RateLimiterConfig) {
    const margin = cfg.safetyMargin ?? 0.9;
    this.requestCap = Math.floor(cfg.requestsPerMinute * margin);
    this.tokenCap = Math.floor(cfg.tokensPerMinute * margin);
    this.refillReqPerMs = this.requestCap / 60_000;
    this.refillTokPerMs = this.tokenCap / 60_000;
    this.reqBucket = this.requestCap;
    this.tokBucket = this.tokenCap;
    // lightweight timer keeps buckets reasonably fresh between bursts
    setInterval(() => this.refill(), 200).unref();
  }

  async acquire(estimatedTokens: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.tryTake(estimatedTokens)) {
        resolve();
        return;
      }
      this.queue.push({ estimatedTokens, resolve });
    });
  }

  adjustTokenDelta(delta: number) {
    this.refill();
    this.tokBucket = Math.min(
      this.tokenCap,
      Math.max(0, this.tokBucket + delta)
    );
  }

  private tryTake(tokens: number): boolean {
    this.refill();
    if (this.reqBucket >= 1 && this.tokBucket >= tokens) {
      this.reqBucket -= 1;
      this.tokBucket -= tokens;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefillAt;
    if (elapsed <= 0) return;
    this.lastRefillAt = now;
    this.reqBucket = Math.min(
      this.requestCap,
      this.reqBucket + elapsed * this.refillReqPerMs
    );
    this.tokBucket = Math.min(
      this.tokenCap,
      this.tokBucket + elapsed * this.refillTokPerMs
    );

    // opportunistically drain the queue
    const pending = this.queue;
    this.queue = [];
    for (const entry of pending) {
      if (this.tryTake(entry.estimatedTokens)) {
        entry.resolve();
      } else {
        this.queue.push(entry);
      }
    }
  }
}

export const estimateTokens = (text: string): number => {
  // ≈4 characters per token – defensive estimate so we never under‑budget.
  return Math.ceil(text.length / 4);
};
