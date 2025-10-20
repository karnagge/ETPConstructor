import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AgenteColetorConversacionalService } from '../agentes/agente-coletor-conversacional.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeracaoService } from '../geracao/geracao.service';
import { ValidacaoLegalService } from '../validacao/validacao-legal.service';
import {
  sanitizePromptInput,
  isInputSafe,
} from '../common/utils/input-sanitizer';

/**
 * ChatGateway
 * WebSocket gateway for real-time chat communication
 * Handles all socket events for data collection conversation
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly agenteColetorService: AgenteColetorConversacionalService,
    private readonly prisma: PrismaService,
    private readonly geracaoService: GeracaoService,
    private readonly validacaoLegal: ValidacaoLegalService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[ChatGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[ChatGateway] Client disconnected: ${client.id}`);
  }

  /**
   * T034: entrar_documento - Client joins document room
   */
  @SubscribeMessage('entrar_documento')
  async handleEntrarDocumento(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string },
  ) {
    try {
      const { documentoId } = data;

      // Join room specific to this document
      const roomName = `doc-${documentoId}`;
      client.join(roomName);

      // Load or initialize session
      let session = await this.chatService.carregarSessao(documentoId);
      if (!session) {
        await this.chatService.inicializarSessao(documentoId, client.id);
        session = await this.chatService.carregarSessao(documentoId);
      }

      // Load document from database
      const documento = await this.prisma.documento.findUnique({
        where: { uuid: documentoId },
      });

      if (!documento) {
        client.emit('erro', { message: 'Documento não encontrado' });
        return;
      }

      // Send session data to client
      client.emit('sessao_carregada', {
        documentoId,
        mensagens: session.mensagens || [],
        dadosColetados: documento.dadosColetados,
        progresso: this.chatService.calcularProgresso(documento.dadosColetados),
      });

      console.log(`[ChatGateway] Client ${client.id} joined room ${roomName}`);
    } catch (error) {
      console.error('[ChatGateway] Error in entrar_documento:', error);
      client.emit('erro', { message: 'Erro ao entrar no documento' });
    }
  }

  /**
   * T035: iniciar_coleta - Start conversation with welcome message
   */
  @SubscribeMessage('iniciar_coleta')
  async handleIniciarColeta(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string },
  ) {
    try {
      const { documentoId } = data;
      const roomName = `doc-${documentoId}`;

      // Generate welcome message
      const mensagemBemVindo = this.agenteColetorService.gerarMensagemBemVindo();

      // Save to session
      await this.chatService.adicionarMensagem(
        documentoId,
        'assistant',
        mensagemBemVindo,
      );

      // Emit to room
      this.server.to(roomName).emit('mensagem_assistente', {
        content: mensagemBemVindo,
        timestamp: new Date().toISOString(),
      });

      console.log(`[ChatGateway] Coleta iniciada para documento ${documentoId}`);
    } catch (error) {
      console.error('[ChatGateway] Error in iniciar_coleta:', error);
      client.emit('erro', { message: 'Erro ao iniciar coleta' });
    }
  }

  /**
   * T036: enviar_mensagem - Process user message and update data
   */
  @SubscribeMessage('enviar_mensagem')
  async handleEnviarMensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string; mensagem: string },
  ) {
    try {
      const { documentoId, mensagem } = data;
      const roomName = `doc-${documentoId}`;

      // T186: Validate and sanitize user input to prevent prompt injection
      if (!isInputSafe(mensagem)) {
        client.emit('erro', {
          message: 'Entrada contém caracteres não permitidos',
        });
        return;
      }

      const mensagemSanitizada = sanitizePromptInput(mensagem);

      if (!mensagemSanitizada || mensagemSanitizada.length === 0) {
        client.emit('erro', { message: 'Mensagem vazia após sanitização' });
        return;
      }

      // Save user message to session (original for display, sanitized for processing)
      await this.chatService.adicionarMensagem(
        documentoId,
        'user',
        mensagemSanitizada,
      );

      // Load current document data
      const documento = await this.prisma.documento.findUnique({
        where: { uuid: documentoId },
      });

      if (!documento) {
        client.emit('erro', { message: 'Documento não encontrado' });
        return;
      }

      // Process message with agent (using sanitized input)
      const resposta = await this.agenteColetorService.processarMensagem(
        mensagemSanitizada,
        documento.dadosColetados,
      );

      // Update document if field was collected
      if (resposta.campo_coletado && resposta.valor_coletado !== null) {
        const dadosAtualizados = {
          ...(documento.dadosColetados as object),
          [resposta.campo_coletado]: resposta.valor_coletado,
        };

        await this.prisma.documento.update({
          where: { uuid: documentoId },
          data: { dadosColetados: dadosAtualizados },
        });

        // T038: Emit campo_coletado event
        this.server.to(roomName).emit('campo_coletado', {
          campo: resposta.campo_coletado,
          valor: resposta.valor_coletado,
          timestamp: new Date().toISOString(),
        });

        // T039: Emit progresso_coleta event
        const progresso = this.chatService.calcularProgresso(dadosAtualizados);
        const camposFaltantes = this.chatService.getCamposFaltantes(dadosAtualizados);

        this.server.to(roomName).emit('progresso_coleta', {
          progresso,
          camposColetados: 11 - camposFaltantes.length,
          camposFaltantes,
          timestamp: new Date().toISOString(),
        });
      }

      // Save assistant message to session
      await this.chatService.adicionarMensagem(
        documentoId,
        'assistant',
        resposta.mensagem,
      );

      // Emit assistant response
      this.server.to(roomName).emit('mensagem_assistente', {
        content: resposta.mensagem,
        timestamp: new Date().toISOString(),
      });

      console.log(`[ChatGateway] Mensagem processada para documento ${documentoId}`);
    } catch (error) {
      console.error('[ChatGateway] Error in enviar_mensagem:', error);
      client.emit('erro', { message: 'Erro ao processar mensagem' });
    }
  }

  /**
   * T087: gerar_documento - Start document generation with multi-agent orchestration
   */
  @SubscribeMessage('gerar_documento')
  async handleGerarDocumento(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string },
  ) {
    try {
      const { documentoId } = data;
      const roomName = `doc-${documentoId}`;

      console.log(`[ChatGateway] Starting generation for documento ${documentoId}`);

      // Load document
      const documento = await this.prisma.documento.findUnique({
        where: { uuid: documentoId },
      });

      if (!documento) {
        client.emit('erro', { message: 'Documento não encontrado' });
        return;
      }

      // T085: Validate prerequisites
      const isCompleto = this.chatService.isColetaCompleta(
        documento.dadosColetados,
      );

      if (!isCompleto) {
        client.emit('erro', {
          message: 'Coleta incompleta. Complete todos os campos antes de gerar.',
        });
        return;
      }

      // Check critical legal errors
      const hasCriticalErrors = await this.validacaoLegal.hasCriticalErrors(
        documento.id,
      );

      if (hasCriticalErrors) {
        client.emit('erro', {
          message:
            'Documento possui erros críticos de validação. Corrija-os antes de gerar.',
        });
        return;
      }

      // T088: Emit geracao_iniciada
      this.server.to(roomName).emit('geracao_iniciada', {
        documentoId,
        timestamp: new Date().toISOString(),
      });

      // Generate document with progress callbacks
      const resultado = await this.geracaoService.gerarDocumento(
        documento.id,
        (phase: string, percentage: number) => {
          // T069: Emit progresso_geracao
          this.server.to(roomName).emit('progresso_geracao', {
            fase: phase,
            percentual: percentage,
            timestamp: new Date().toISOString(),
          });

          // T070: Emit secao_gerada when section completes
          if (percentage === 30 || percentage === 60 || percentage === 80) {
            const secaoId = this.getSecaoIdForPercentage(percentage);
            this.server.to(roomName).emit('secao_gerada', {
              secaoId,
              timestamp: new Date().toISOString(),
            });
          }
        },
      );

      // T089: Emit geracao_completa
      this.server.to(roomName).emit('geracao_completa', {
        documentoId,
        caminhoDocx: resultado.caminhoDocx,
        tempoGeracao: resultado.tempoGeracao,
        secoesGeradas: resultado.secoesGeradas,
        erros: resultado.erros,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[ChatGateway] Generation complete for documento ${documentoId} in ${resultado.tempoGeracao}s`,
      );
    } catch (error) {
      console.error('[ChatGateway] Error in gerar_documento:', error);
      
      const roomName = `doc-${data.documentoId}`;
      this.server.to(roomName).emit('geracao_erro', {
        message: error instanceof Error ? error.message : 'Erro ao gerar documento',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * T076: validacao_completa - Perform legal validation and emit results
   */
  @SubscribeMessage('validar_documento')
  async handleValidarDocumento(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentoId: string },
  ) {
    try {
      const { documentoId } = data;
      const roomName = `doc-${documentoId}`;

      console.log(`[ChatGateway] Validating documento ${documentoId}`);

      // Load document
      const documento = await this.prisma.documento.findUnique({
        where: { uuid: documentoId },
      });

      if (!documento) {
        client.emit('erro', { message: 'Documento não encontrado' });
        return;
      }

      // Execute validation
      const resultado = await this.validacaoLegal.validarDados(
        documento.id,
        documento.dadosColetados,
      );

      // Emit validation complete event
      this.server.to(roomName).emit('validacao_completa', {
        percentual_conformidade: resultado.percentual_conformidade,
        total_regras: resultado.total_regras,
        regras_validas: resultado.regras_validas,
        erros_criticos: resultado.erros_criticos,
        alertas: resultado.alertas,
        bloqueio_geracao: resultado.bloqueio_geracao,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[ChatGateway] Validation complete for documento ${documentoId}: ${resultado.percentual_conformidade}%`,
      );
    } catch (error) {
      console.error('[ChatGateway] Error in validar_documento:', error);
      client.emit('erro', { message: 'Erro ao validar documento' });
    }
  }

  /**
   * T131: editar_secao - Handle section editing with debounce (2 seconds)
   * This is called from client after debounce on editor onChange
   */
  @SubscribeMessage('editar_secao')
  async handleEditarSecao(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      documentoId: string;
      secaoId: string;
      conteudo: any;
    },
  ) {
    try {
      const { documentoId, secaoId, conteudo } = data;

      console.log(
        `[ChatGateway] Editing section ${secaoId} for documento ${documentoId}`,
      );

      // Load current document
      const documento = await this.prisma.documento.findUnique({
        where: { uuid: documentoId },
      });

      if (!documento) {
        client.emit('erro', { message: 'Documento não encontrado' });
        return;
      }

      // Update conteudoSecoes with new section content
      const conteudoSecoes = (documento.conteudoSecoes as any) || {};
      conteudoSecoes[secaoId] = {
        ...(conteudoSecoes[secaoId] || {}),
        conteudo,
        atualizadoEm: new Date().toISOString(),
      };

      // Update document in database (this will trigger version creation via DocumentosService)
      const updated = await this.prisma.documento.update({
        where: { uuid: documentoId },
        data: {
          conteudoSecoes,
          atualizadoEm: new Date(),
        },
        include: {
          versoes: {
            orderBy: { numeroVersao: 'desc' },
            take: 1,
          },
        },
      });

      // Get latest version number
      const numeroVersao = updated.versoes[0]?.numeroVersao || 1;

      // Emit secao_salva event to all clients in room
      const roomName = `doc-${documentoId}`;
      this.server.to(roomName).emit('secao_salva', {
        secaoId,
        numeroVersao,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[ChatGateway] Section ${secaoId} saved successfully (version ${numeroVersao})`,
      );
    } catch (error) {
      console.error('[ChatGateway] Error in editar_secao:', error);
      client.emit('erro', { message: 'Erro ao salvar seção' });
    }
  }

  /**
   * Helper to map percentage to section ID
   */
  private getSecaoIdForPercentage(percentage: number): string {
    const mapping: { [key: number]: string } = {
      30: '1_definicao_objeto',
      60: '3_especificacoes',
      80: '5_gestao_fiscalizacao',
    };
    return mapping[percentage] || 'unknown';
  }
}
