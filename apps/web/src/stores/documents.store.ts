import { create } from 'zustand';
import { apiService } from '../services/api.service';

interface Documento {
  id: string;
  uuid: string;
  titulo: string;
  tipo: string;
  status: 'RASCUNHO' | 'EM_GERACAO' | 'CONCLUIDO' | 'ARQUIVADO';
  dadosColetados: any;
  conteudoSecoes: any;
  caminhoDocx?: string;
  caminhoPdf?: string;
  criadoEm: string;
  atualizadoEm: string;
  concluidoEm?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  projeto?: {
    id: string;
    uuid: string;
    nome: string;
    cor: string;
  };
}

interface Section {
  id: string;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentPhase: string;
  sections: Section[];
  error: string | null;
  startedAt?: Date;
  completedAt?: Date;
}

interface DocumentsState {
  documentos: Documento[];
  activeDocumento: Documento | null;
  isLoading: boolean;
  error: string | null;

  // T095: Generation state
  generation: GenerationState;

  // Actions
  fetchDocumentos: (filters?: {
    usuarioId?: string;
    projetoId?: string;
    status?: string;
  }) => Promise<void>;
  fetchDocumento: (uuid: string) => Promise<void>;
  createDocumento: (data: {
    titulo: string;
    tipo?: string;
    usuarioId: string;
    projetoId?: string;
  }) => Promise<Documento>;
  updateDocumento: (
    uuid: string,
    data: Partial<Documento>,
  ) => Promise<void>;
  setActiveDocumento: (documento: Documento | null) => void;
  clearError: () => void;

  // T095: Generation actions (socket event handlers)
  onGenerationStarted: (data: { documentoId: string }) => void;
  onGenerationProgress: (data: { percent: number; phase: string }) => void;
  onSectionGenerated: (data: { secaoId: string; conteudo: any }) => void;
  onGenerationComplete: (data: {
    documentoId: string;
    caminhoDocx: string;
    tempoGeracao: number;
  }) => void;
  onGenerationError: (data: { error: string }) => void;
  resetGeneration: () => void;
}

/**
 * T057: Documents Zustand store
 * Manages documento list and active document
 */
export const useDocumentsStore = create<DocumentsState>((set) => ({
  documentos: [],
  activeDocumento: null,
  isLoading: false,
  error: null,

  // T095: Initial generation state
  generation: {
    isGenerating: false,
    progress: 0,
    currentPhase: '',
    sections: [
      { id: '1_definicao_objeto', title: '1. Definição do Objeto', status: 'pending' },
      { id: '2_justificativa', title: '2. Justificativa', status: 'pending' },
      { id: '3_especificacoes', title: '3. Especificações Técnicas', status: 'pending' },
      { id: '4_estimativa_custos', title: '4. Estimativa de Custos', status: 'pending' },
      { id: '5_gestao_fiscalizacao', title: '5. Gestão e Fiscalização', status: 'pending' },
      { id: '6_obrigacoes_contratante', title: '6. Obrigações do Contratante', status: 'pending' },
      { id: '7_obrigacoes_contratada', title: '7. Obrigações da Contratada', status: 'pending' },
      { id: '8_criterios_aceitacao', title: '8. Critérios de Aceitação', status: 'pending' },
      { id: '9_sancoes', title: '9. Sanções', status: 'pending' },
    ],
    error: null,
  },

  /**
   * T058: Fetch all documentos with filters
   */
  fetchDocumentos: async (filters) => {
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      if (filters?.usuarioId) queryParams.append('usuarioId', filters.usuarioId);
      if (filters?.projetoId) queryParams.append('projetoId', filters.projetoId);
      if (filters?.status) queryParams.append('status', filters.status);

      const query = queryParams.toString();
      const endpoint = query ? `/documentos?${query}` : '/documentos';

      const documentos = await apiService.get<Documento[]>(endpoint);
      set({ documentos, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao buscar documentos',
        isLoading: false,
      });
    }
  },

  /**
   * Fetch single documento by UUID
   */
  fetchDocumento: async (uuid) => {
    set({ isLoading: true, error: null });

    try {
      const documento = await apiService.get<Documento>(`/documentos/${uuid}`);
      set({ activeDocumento: documento, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao buscar documento',
        isLoading: false,
      });
    }
  },

  /**
   * T058: Create new documento
   */
  createDocumento: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const documento = await apiService.post<Documento>('/documentos', data);
      
      // Add to list
      set((state) => ({
        documentos: [documento, ...state.documentos],
        activeDocumento: documento,
        isLoading: false,
      }));

      return documento;
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar documento',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * T058: Update documento
   */
  updateDocumento: async (uuid, data) => {
    set({ isLoading: true, error: null });

    try {
      const updated = await apiService.patch<Documento>(
        `/documentos/${uuid}`,
        data,
      );

      // Update in list
      set((state) => ({
        documentos: state.documentos.map((doc) =>
          doc.uuid === uuid ? updated : doc,
        ),
        activeDocumento:
          state.activeDocumento?.uuid === uuid
            ? updated
            : state.activeDocumento,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao atualizar documento',
        isLoading: false,
      });
      throw error;
    }
  },

  setActiveDocumento: (documento) => {
    set({ activeDocumento: documento });
  },

  clearError: () => {
    set({ error: null });
  },

  /**
   * T095: Socket event handler - generation started
   */
  onGenerationStarted: (data) => {
    set((state) => ({
      generation: {
        ...state.generation,
        isGenerating: true,
        progress: 0,
        currentPhase: 'Iniciando',
        error: null,
        startedAt: new Date(),
        completedAt: undefined,
        sections: state.generation.sections.map((s) => ({
          ...s,
          status: 'pending',
        })),
      },
      // Update documento status
      activeDocumento: state.activeDocumento
        ? { ...state.activeDocumento, status: 'EM_GERACAO' }
        : state.activeDocumento,
    }));
  },

  /**
   * T095: Socket event handler - progress update
   */
  onGenerationProgress: (data) => {
    set((state) => ({
      generation: {
        ...state.generation,
        progress: data.percent,
        currentPhase: data.phase,
      },
    }));
  },

  /**
   * T095: Socket event handler - section generated
   */
  onSectionGenerated: (data) => {
    set((state) => ({
      generation: {
        ...state.generation,
        sections: state.generation.sections.map((s) =>
          s.id === data.secaoId
            ? { ...s, status: 'completed' as const }
            : s
        ),
      },
    }));
  },

  /**
   * T095: Socket event handler - generation complete
   */
  onGenerationComplete: (data) => {
    set((state) => ({
      generation: {
        ...state.generation,
        isGenerating: false,
        progress: 100,
        currentPhase: 'Concluído',
        completedAt: new Date(),
        sections: state.generation.sections.map((s) => ({
          ...s,
          status: 'completed',
        })),
      },
      // Update documento with file paths
      activeDocumento: state.activeDocumento
        ? {
            ...state.activeDocumento,
            status: 'CONCLUIDO',
            caminhoDocx: data.caminhoDocx,
            concluidoEm: new Date().toISOString(),
          }
        : state.activeDocumento,
    }));
  },

  /**
   * T095: Socket event handler - generation error
   */
  onGenerationError: (data) => {
    set((state) => ({
      generation: {
        ...state.generation,
        isGenerating: false,
        error: data.error,
      },
    }));
  },

  /**
   * T095: Reset generation state
   */
  resetGeneration: () => {
    set((state) => ({
      generation: {
        isGenerating: false,
        progress: 0,
        currentPhase: '',
        sections: state.generation.sections.map((s) => ({
          ...s,
          status: 'pending',
        })),
        error: null,
        startedAt: undefined,
        completedAt: undefined,
      },
    }));
  },
}));
