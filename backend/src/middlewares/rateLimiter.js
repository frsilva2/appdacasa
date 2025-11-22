import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requisições por janela
  message: {
    success: false,
    message: 'Muitas requisições deste IP. Por favor, tente novamente mais tarde.',
  },
  standardHeaders: true, // Retorna info no header `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Não aplicar rate limiting em health check
    return req.path === '/health';
  },
});

// Rate limiter mais restritivo para autenticação
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login
  message: {
    success: false,
    message: 'Muitas tentativas de login. Por favor, aguarde 15 minutos e tente novamente.',
  },
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});
