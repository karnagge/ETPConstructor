import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Custom Logger Service
 * Provides structured logging with different log levels
 * T174: Error logging with proper formatting
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.printMessage('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage('ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.printMessage('WARN', message, context);
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      this.printMessage('DEBUG', message, context);
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      this.printMessage('VERBOSE', message, context);
    }
  }

  private printMessage(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;

    const logEntry = {
      timestamp,
      level,
      context: ctx,
      message: messageStr,
      ...(trace && { trace }),
    };

    const coloredLevel = this.colorize(level, level.padEnd(7));
    const coloredContext = this.colorize('CONTEXT', ctx);

    console.log(
      `${timestamp} [${coloredLevel}] ${coloredContext} ${messageStr}`,
    );

    if (trace) {
      console.log(`  ${trace}`);
    }

    // In production, you would also write to file or external service
    if (process.env.NODE_ENV === 'production' && level === 'ERROR') {
      // TODO: Send to external logging service (Sentry, CloudWatch, etc)
      this.writeToErrorLog(logEntry);
    }
  }

  private colorize(level: string, text: string): string {
    const colors: Record<string, string> = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m', // Yellow
      LOG: '\x1b[32m', // Green
      DEBUG: '\x1b[36m', // Cyan
      VERBOSE: '\x1b[35m', // Magenta
      CONTEXT: '\x1b[33m', // Yellow
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    return `${color}${text}${reset}`;
  }

  private writeToErrorLog(logEntry: any) {
    // Simple file logging for production errors
    // In real production, use Winston, Pino, or external service
    const fs = require('fs');
    const path = require('path');
    
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}
