import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),

  // Anthropic API
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),

  // Server
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Frontend URL for CORS
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // File storage
  UPLOADS_DIR: z.string().default('./uploads'),
  DOCUMENTS_DIR: z.string().default('./uploads/documents'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      throw new Error(
        `❌ Environment validation failed. Missing or invalid variables: ${missingVars}`,
      );
    }
    throw error;
  }
}
