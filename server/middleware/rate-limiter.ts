import rateLimit from 'express-rate-limit';

// 100 requests per 15 minutes per IP (express-rate-limit gets the IP from the request)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
