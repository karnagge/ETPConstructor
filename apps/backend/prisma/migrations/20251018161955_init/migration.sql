-- CreateEnum
CREATE TYPE "StatusDocumento" AS ENUM ('RASCUNHO', 'EM_GERACAO', 'CONCLUIDO', 'ARQUIVADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#3b82f6',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'ETP',
    "status" "StatusDocumento" NOT NULL DEFAULT 'RASCUNHO',
    "dados_coletados" JSONB NOT NULL DEFAULT '{}',
    "conteudo_secoes" JSONB NOT NULL DEFAULT '{}',
    "caminho_docx" TEXT,
    "caminho_pdf" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "concluido_em" TIMESTAMP(3),
    "usuario_id" TEXT NOT NULL,
    "projeto_id" TEXT,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versoes_documento" (
    "id" TEXT NOT NULL,
    "numero_versao" INTEGER NOT NULL,
    "conteudo_secoes" JSONB NOT NULL,
    "alteracoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documento_id" TEXT NOT NULL,

    CONSTRAINT "versoes_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validacoes_legais" (
    "id" TEXT NOT NULL,
    "secao_id" TEXT NOT NULL,
    "regra" TEXT NOT NULL,
    "valido" BOOLEAN NOT NULL,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documento_id" TEXT NOT NULL,

    CONSTRAINT "validacoes_legais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projetos_uuid_key" ON "projetos"("uuid");

-- CreateIndex
CREATE INDEX "projetos_usuario_id_idx" ON "projetos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_uuid_key" ON "documentos"("uuid");

-- CreateIndex
CREATE INDEX "documentos_usuario_id_idx" ON "documentos"("usuario_id");

-- CreateIndex
CREATE INDEX "documentos_projeto_id_idx" ON "documentos"("projeto_id");

-- CreateIndex
CREATE INDEX "documentos_status_idx" ON "documentos"("status");

-- CreateIndex
CREATE INDEX "versoes_documento_documento_id_idx" ON "versoes_documento"("documento_id");

-- CreateIndex
CREATE UNIQUE INDEX "versoes_documento_documento_id_numero_versao_key" ON "versoes_documento"("documento_id", "numero_versao");

-- CreateIndex
CREATE INDEX "validacoes_legais_documento_id_secao_id_idx" ON "validacoes_legais"("documento_id", "secao_id");

-- CreateIndex
CREATE INDEX "validacoes_legais_documento_id_valido_idx" ON "validacoes_legais"("documento_id", "valido");

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versoes_documento" ADD CONSTRAINT "versoes_documento_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validacoes_legais" ADD CONSTRAINT "validacoes_legais_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
