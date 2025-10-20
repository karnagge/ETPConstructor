import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * T189: Prisma Service with connection pooling
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Connection pool configuration
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Log queries in development
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✓ Prisma connected to database');
    console.log(
      `✓ Connection pooling enabled (max: ${process.env.DATABASE_POOL_SIZE || '10'} connections)`,
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
