/**
 * Application Constants
 * T178: Extract magic numbers to named constants for better maintainability
 */

// Data Collection
export const MANDATORY_FIELDS_COUNT = 11;
export const CAMPOS_OBRIGATORIOS = [
  'objeto_contratacao',
  'descricao_detalhada',
  'justificativa_necessidade',
  'orgao_contratante',
  'setor_requisitante',
  'modalidade_licitacao',
  'valor_estimado',
  'prazo_execucao',
  'prazo_unidade',
  'requisitos_tecnicos',
  'criterios_sustentabilidade',
] as const;

// Document Sections
export const DOCUMENT_SECTIONS_COUNT = 9;
export const SECOES_ETP = [
  '1_definicao_objeto',
  '2_justificativa',
  '3_especificacoes',
  '4_estimativa_custos',
  '5_gestao_fiscalizacao',
  '6_obrigacoes_contratante',
  '7_obrigacoes_contratada',
  '8_criterios_aceitacao',
  '9_sancoes',
] as const;

// Frontend Debounce
export const DEBOUNCE_MS = 2000; // 2 seconds for auto-save
export const CHAT_RESPONSE_TIMEOUT_MS = 3000; // 3 seconds max for chat response

// Performance Thresholds
export const SLOW_REQUEST_THRESHOLD_MS = 3000; // Warn if request takes >3s
export const GENERATION_TIMEOUT_MS = 180000; // 3 minutes max for document generation

// Validation Thresholds
export const MIN_COMPLIANCE_PERCENTAGE = 80; // Minimum 80% compliance
export const CRITICAL_ERROR_BLOCKS_GENERATION = true;

// Rate Limiting
export const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window
export const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

// File Upload
export const MAX_UPLOAD_SIZE_MB = 10;
export const ALLOWED_DOCUMENT_FORMATS = ['docx', 'pdf'] as const;

// Legal Values (Lei 14.133/21)
export const LIMITE_DISPENSA = 50000; // R$ 50.000,00
export const LIMITE_INEXIGIBILIDADE = Infinity;
export const PRAZO_MINIMO_DIAS = 30;

// Redis Cache TTL
export const CACHE_TTL_PROJETOS = 300; // 5 minutes
export const CACHE_TTL_DOCUMENTOS = 300; // 5 minutes
export const SESSION_TTL = 3600; // 1 hour

// Concurrent Users
export const MAX_CONCURRENT_USERS = 10;
export const MAX_WEBSOCKET_CONNECTIONS = 50;

// Input Validation
export const MAX_INPUT_LENGTH = 10000; // Max characters in single input
export const MAX_JSON_ARRAY_SIZE = 100; // Max array items in JSON validation

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// API Endpoints
export const API_VERSION = 'v1';
export const API_PREFIX = 'api';

// Environment
export const DEFAULT_PORT = 3001;
export const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

// Claude API
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
export const CLAUDE_MAX_TOKENS = 4096;
export const CLAUDE_TEMPERATURE = 0.7;
