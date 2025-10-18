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
import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AgenteColetorConversacionalService } from '../agentes/agente-coletor-conversacional.service';
import { PrismaService } from '../prisma/prisma.service';

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

      // Save user message to session
      await this.chatService.adicionarMensagem(documentoId, 'user', mensagem);

      // Load current document data
      const documento = await this.prisma.documento.findUnique({
        where: { uuid: documentoId },
      });

      if (!documento) {
        client.emit('erro', { message: 'Documento não encontrado' });
        return;
      }

      // Process message with agent
      const resposta = await this.agenteColetorService.processarMensagem(
        mensagem,
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
}
