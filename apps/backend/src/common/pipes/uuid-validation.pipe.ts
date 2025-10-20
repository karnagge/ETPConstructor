import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

/**
 * Pipe para validar UUIDs em parâmetros de rota e query
 * Previne injection attacks validando formato UUID v4
 * 
 * @example
 * ```typescript
 * @Get(':uuid')
 * findOne(@Param('uuid', UuidValidationPipe) uuid: string) {
 *   return this.service.findOne(uuid);
 * }
 * ```
 */
@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('UUID é obrigatório');
    }

    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(
        `UUID inválido: "${value}". Esperado formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
      );
    }

    return value;
  }
}
