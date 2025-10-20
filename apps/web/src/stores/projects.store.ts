import { create } from 'zustand';

export interface Projeto {
  id: string;
  uuid: string;
  nome: string;
  descricao?: string;
  cor: string;
  criadoEm: string;
  documentos?: Array<{
    id: string;
    uuid: string;
    titulo: string;
    status: string;
    criadoEm: string;
    atualizadoEm: string;
  }>;
}

interface ProjetosState {
  projetos: Projeto[];
  expandedProjects: Set<string>;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProjetos: (usuarioId?: string) => Promise<void>;
  createProjeto: (data: {
    nome: string;
    descricao?: string;
    cor?: string;
    usuarioId: string;
  }) => Promise<Projeto>;
  updateProjeto: (
    uuid: string,
    data: { nome?: string; descricao?: string; cor?: string }
  ) => Promise<Projeto>;
  deleteProjeto: (uuid: string) => Promise<void>;
  toggleExpanded: (uuid: string) => void;
  clearError: () => void;
}

export const useProjetosStore = create<ProjetosState>((set) => ({
  projetos: [],
  expandedProjects: new Set<string>(),
  loading: false,
  error: null,

  fetchProjetos: async (usuarioId?: string) => {
    set({ loading: true, error: null });
    try {
      const queryParams = usuarioId ? `?usuarioId=${usuarioId}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projetos${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar projetos');
      }

      const projetos = await response.json();
      set({ projetos, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      });
    }
  },

  createProjeto: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projetos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar projeto');
      }

      const projeto = await response.json();
      set((state) => ({
        projetos: [projeto, ...state.projetos],
        loading: false,
      }));

      return projeto;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      });
      throw error;
    }
  },

  updateProjeto: async (uuid, data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projetos/${uuid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar projeto');
      }

      const updatedProjeto = await response.json();
      set((state) => ({
        projetos: state.projetos.map((p) =>
          p.uuid === uuid ? updatedProjeto : p
        ),
        loading: false,
      }));

      return updatedProjeto;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      });
      throw error;
    }
  },

  deleteProjeto: async (uuid) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projetos/${uuid}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar projeto');
      }

      set((state) => ({
        projetos: state.projetos.filter((p) => p.uuid !== uuid),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      });
      throw error;
    }
  },

  toggleExpanded: (uuid: string) => {
    set((state) => {
      const newExpanded = new Set(state.expandedProjects);
      if (newExpanded.has(uuid)) {
        newExpanded.delete(uuid);
      } else {
        newExpanded.add(uuid);
      }
      return { expandedProjects: newExpanded };
    });
  },

  clearError: () => set({ error: null }),
}));
