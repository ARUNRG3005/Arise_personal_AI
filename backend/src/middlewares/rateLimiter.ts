import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // More restrictive limits for expensive AI completions
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI query limit reached for this IP, please try again shortly.',
  },
});
