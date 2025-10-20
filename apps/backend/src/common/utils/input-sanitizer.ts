/**
 * Utilitário para sanitizar entradas de usuário antes de enviar para AI agents
 * Previne prompt injection attacks removendo/escapando caracteres perigosos
 */

/**
 * Remove ou escapa caracteres potencialmente perigosos em prompts para AI
 * @param input - String de entrada do usuário
 * @returns String sanitizada segura para passar ao AI agent
 */
export function sanitizePromptInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove caracteres de controle (exceto newline, tab, carriage return)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limita newlines consecutivas (máximo 2)
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Remove espaços em branco excessivos
  sanitized = sanitized.replace(/[ \t]{5,}/g, '    ');

  // Remove tentativas óbvias de prompt injection
  const dangerousPatterns = [
    /ignore\s+(previous|all)\s+(instructions|prompts)/gi,
    /forget\s+(everything|all)\s+(?:you|we|i)\s+(?:told|said)/gi,
    /disregard\s+(?:previous|all)\s+(?:instructions|context)/gi,
    /new\s+instructions?:/gi,
    /system\s*:\s*/gi, // Prevent impersonation of system messages
    /<\|im_start\|>/gi, // ChatML markers
    /<\|im_end\|>/gi,
  ];

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '[REMOVED]');
  }

  // Limita tamanho total (max 10000 caracteres)
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000) + '... [truncado]';
  }

  return sanitized.trim();
}

/**
 * Sanitiza objeto JSON removendo campos perigosos ou valores muito grandes
 * @param data - Objeto de dados do usuário
 * @returns Objeto sanitizado
 */
export function sanitizeJSONData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.slice(0, 100).map((item) => sanitizeJSONData(item));
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Remove campos com nomes suspeitos
    if (
      key.startsWith('__') ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('token')
    ) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizePromptInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeJSONData(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Valida se entrada não contém tentativas óbvias de exploit
 * @param input - String de entrada
 * @returns true se seguro, false se detectado padrão perigoso
 */
export function isInputSafe(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true;
  }

  // Detecta tentativas de command injection
  const dangerousCommands = [
    /;\s*(?:rm|del|format|drop|truncate)/gi,
    /\$\(/g, // Shell command substitution
    /`[^`]+`/g, // Backtick command execution
    /<script>/gi, // XSS attempts (unlikely but check anyway)
    /javascript:/gi,
    /on(?:load|error|click)=/gi,
  ];

  for (const pattern of dangerousCommands) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
}
