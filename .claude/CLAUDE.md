# ETP Generator Project Context

## Domain
Brazilian public procurement ETPs (Estudos Técnicos Preliminares) compliant with:
- **Lei 8.666/93**: Old procurement law
- **Lei 14.133/21**: New procurement law (effective since 2023)
- **IN SEGES 05/2017**: ETP structure requirements
- **IN SEGES 65/2021**: Cost estimation guidelines

## Critical Requirements
1. **Legal Compliance First**: All validations must pass before document completion
2. **9 Mandatory Sections**: Document structure is fixed
3. **11 Mandatory Fields**: Data collection must be complete
4. **Real-Time Communication**: Progress updates via WebSocket (Socket.IO)

## Agent Specializations
1. **AgenteColetorConversacional**: Natural conversation for data collection
2. **AgenteValidadorLegal**: Validates compliance with Brazilian laws
3. **AgenteEspecificacoesTecnicas**: Generates technical specifications with ABNT norms
4. **AgenteEstimativaCustos**: Estimates costs with market research
5. **AgenteGestaoContratual**: Generates contract management clauses

## Technical Stack
- Backend: NestJS + Prisma + Socket.IO + Claude Agent SDK
- Frontend: Vite + React + Tailwind CSS + TipTap
- Database: PostgreSQL 15
- Cache: Redis 7
- AI: Claude Sonnet 4.5 (claude-sonnet-4-20250514)

## Project Structure
- apps/backend/src/agentes/ - AI agent implementations
- apps/backend/src/chat/ - WebSocket gateway
- apps/backend/src/documentos/ - REST API
- apps/web/src/components/ - React UI components
- packages/shared-types/ - Shared TypeScript interfaces
