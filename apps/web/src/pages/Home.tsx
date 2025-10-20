import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { RightSidebar } from '../components/sidebar/RightSidebar';
import { useDocumentsStore } from '../stores/documents.store';
import { useProjetosStore } from '../stores/projects.store';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';

/**
 * T059: Home page component
 * Main ETP workspace with chat interface for active document
 */
export function Home() {
  const {
    documentos,
    activeDocumento,
    isLoading,
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
    // TODO: Get real user ID from auth context
    const mockUserId = '00000000-0000-0000-0000-000000000001';
    fetchDocumentos({ usuarioId: mockUserId });
    fetchProjetos(mockUserId);
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
      // TODO: Get real user ID from auth context
      const mockUserId = '00000000-0000-0000-0000-000000000001';

      const documento = await createDocumento({
        titulo: newETPTitle,
        tipo: 'ETP',
        usuarioId: mockUserId,
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
      {/* Left Sidebar - Document List */}
      <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold text-neutral-900">
            ETP Constructor
          </h1>
          <p className="text-sm text-neutral-500">
            Geração Automatizada de ETPs
          </p>
        </div>

        {/* T060: Novo ETP button */}
        <div className="p-4">
          <button
            onClick={() => setShowNewETPModal(true)}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Novo ETP
          </button>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-neutral-500">Carregando...</p>
          ) : documentos.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Nenhum documento ainda. Crie seu primeiro ETP!
            </p>
          ) : (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <button
                  key={doc.uuid}
                  onClick={() => setActiveDocumento(doc)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeDocumento?.uuid === doc.uuid
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-neutral-50 border-2 border-transparent hover:bg-neutral-100'
                  }`}
                >
                  <p className="font-medium text-sm text-neutral-900 truncate">
                    {doc.titulo}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(doc.atualizadoEm).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === 'CONCLUIDO'
                          ? 'bg-green-100 text-green-700'
                          : doc.status === 'EM_GERACAO'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

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
              <Select
                id="projeto"
                value={selectedProjetoId}
                onChange={(e) => setSelectedProjetoId(e.target.value)}
              >
                <option value="">Sem projeto</option>
                {projetos.map((projeto) => (
                  <option key={projeto.uuid} value={projeto.id}>
                    {projeto.nome}
                  </option>
                ))}
              </Select>
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
