import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * T175: HTTP Request Logger Middleware
 * Logs all incoming HTTP requests with method, path, status, and response time
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    console.log(`[HTTP] → ${method} ${originalUrl} | IP: ${ip}`);

    // Capture response
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      const statusColor = this.getStatusColor(statusCode);
      const resetColor = '\x1b[0m';

      console.log(
        `[HTTP] ← ${method} ${originalUrl} | ` +
          `Status: ${statusColor}${statusCode}${resetColor} | ` +
          `Time: ${responseTime}ms | ` +
          `User-Agent: ${userAgent.substring(0, 50)}`,
      );

      // Log slow requests
      if (responseTime > 3000) {
        console.warn(
          `[SLOW] ${method} ${originalUrl} took ${responseTime}ms`,
        );
      }

      // Log errors
      if (statusCode >= 400) {
        console.error(
          `[ERROR] ${method} ${originalUrl} returned ${statusCode}`,
        );
      }
    });

    next();
  }

  private getStatusColor(status: number): string {
    if (status >= 500) return '\x1b[31m'; // Red
    if (status >= 400) return '\x1b[33m'; // Yellow
    if (status >= 300) return '\x1b[36m'; // Cyan
    if (status >= 200) return '\x1b[32m'; // Green
    return '\x1b[37m'; // White
  }
}
