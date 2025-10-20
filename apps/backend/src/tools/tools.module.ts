import { Module } from '@nestjs/common';
import { HttpToolsService } from './http-tools.service';

/**
 * ToolsModule
 * Provides HTTP-based tools for AI agents
 */
@Module({
  providers: [HttpToolsService],
  exports: [HttpToolsService],
})
export class ToolsModule {}
