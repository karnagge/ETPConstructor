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

interface DocumentsState {
  documentos: Documento[];
  activeDocumento: Documento | null;
  isLoading: boolean;
  error: string | null;

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
}));
