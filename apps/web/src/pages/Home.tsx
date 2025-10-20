import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { RightSidebar } from '../components/sidebar/RightSidebar';
import { LeftSidebar } from '../components/sidebar/LeftSidebar';
import { useDocumentsStore } from '../stores/documents.store';
import { useProjetosStore } from '../stores/projects.store';
import { Label } from '../components/ui/label';
import { DEFAULT_USUARIO_ID } from '../config/test-data';

/**
 * T059: Home page component
 * Main ETP workspace with chat interface for active document
 */
export function Home() {
  const {
    activeDocumento,
    fetchDocumentos,
    createDocumento,
    setActiveDocumento,
  } = useDocumentsStore();

  const { projetos, fetchProjetos } = useProjetosStore();

  const [showNewETPModal, setShowNewETPModal] = useState(false);
  const [newETPTitle, setNewETPTitle] = useState('');
  const [selectedProjetoId, setSelectedProjetoId] = useState<string>('');

  // Load documentos and projetos on mount
  useEffect(() => {
    // Use real user ID from seed data
    fetchDocumentos({ usuarioId: DEFAULT_USUARIO_ID });
    fetchProjetos(DEFAULT_USUARIO_ID);
  }, [fetchDocumentos, fetchProjetos]);

  /**
   * T060 + T122: Handle "Novo ETP" button click with optional project association
   */
  const handleCreateETP = async () => {
    if (!newETPTitle.trim()) {
      alert('Por favor, insira um título para o ETP');
      return;
    }

    try {
      // Use real user ID from seed data
      const documento = await createDocumento({
        titulo: newETPTitle,
        tipo: 'ETP',
        usuarioId: DEFAULT_USUARIO_ID,
        projetoId: selectedProjetoId || undefined, // T122: Associate with project if selected
      });

      setShowNewETPModal(false);
      setNewETPTitle('');
      setSelectedProjetoId('');
      setActiveDocumento(documento);
    } catch (error) {
      alert('Erro ao criar ETP');
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Left Sidebar - Project Tree + Document List */}
      <LeftSidebar
        className="w-64 border-r border-neutral-200 bg-white"
        onNewETP={() => setShowNewETPModal(true)}
      />

      {/* Main Content - Chat or Empty State */}
      <main className="flex-1 flex flex-col">
        {activeDocumento ? (
          <ChatWindow
            documentoId={activeDocumento.uuid}
            onColetaCompleta={() => {
              alert('Coleta completa! Dados prontos para gerar ETP.');
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Nenhum documento selecionado
              </h2>
              <p className="text-neutral-600">
                Selecione um ETP existente ou crie um novo
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Compliance Panel (T159) */}
      <RightSidebar />

      {/* New ETP Modal - T122: Added project selector */}
      {showNewETPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Criar Novo ETP
            </h3>
            
            {/* Title Input */}
            <div className="mb-4">
              <Label htmlFor="titulo" className="block mb-2">
                Título do ETP <span className="text-red-500">*</span>
              </Label>
              <input
                id="titulo"
                type="text"
                value={newETPTitle}
                onChange={(e) => setNewETPTitle(e.target.value)}
                placeholder="Ex: ETP - Contratação de Serviços de TI"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Project Selector - T122 */}
            <div className="mb-4">
              <Label htmlFor="projeto" className="block mb-2">
                Projeto (opcional)
              </Label>
              <select
                id="projeto"
                value={selectedProjetoId}
                onChange={(e) => setSelectedProjetoId(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sem projeto</option>
                {projetos.map((projeto) => (
                  <option key={projeto.uuid} value={projeto.uuid}>
                    {projeto.nome}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Associe este ETP a um projeto para melhor organização
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowNewETPModal(false);
                  setNewETPTitle('');
                  setSelectedProjetoId('');
                }}
                className="flex-1 py-2 px-4 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateETP}
                disabled={!newETPTitle.trim()}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
