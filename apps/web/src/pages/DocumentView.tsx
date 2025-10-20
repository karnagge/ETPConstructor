import { useEffect, useState } from 'react';
import { DocumentEditor } from '../components/editor/DocumentEditor';
import { SectionSelector } from '../components/editor/SectionSelector';
import { VersionHistory } from '../components/editor/VersionHistory';
import { Button } from '../components/ui/button';
import { History, Download, ArrowLeft } from 'lucide-react';
import { useDocumentsStore } from '../stores/documents.store';
import { socketService } from '../services/socket.service';

/**
 * T141: DocumentView page
 * Split view with section selector and TipTap editor
 */
interface DocumentViewProps {
  documentoId: string;
}

export function DocumentView({ documentoId }: DocumentViewProps) {
  const [activeSection, setActiveSection] = useState('1_definicao_objeto');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const { activeDocumento, fetchDocumento } = useDocumentsStore();

  useEffect(() => {
    if (documentoId) {
      // Fetch document data
      fetchDocumento(documentoId);

      // Connect to document room via socket
      socketService.emit('entrar_documento', { documentoId });
    }
  }, [documentoId, fetchDocumento]);

  // T142: Load conteudoSecoes[secaoId] into TipTap editor when section selected
  const getSectionContent = () => {
    if (!activeDocumento?.conteudoSecoes) return null;

    const conteudoSecoes = activeDocumento.conteudoSecoes as any;
    return conteudoSecoes[activeSection]?.conteudo || null;
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleDownload = () => {
    if (!documentoId) return;
    // Trigger download
    window.open(
      `${import.meta.env.VITE_API_URL}/documentos/${documentoId}/download/docx`,
      '_blank',
    );
  };

  // T149: Reload documento after version restoration
  const handleVersionRestore = (numeroVersao: number) => {
    console.log(`[DocumentView] Version ${numeroVersao} restored, reloading...`);
    if (documentoId) {
      fetchDocumento(documentoId);
    }
  };

  if (!activeDocumento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Carregando documento...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                {activeDocumento.titulo}
              </h1>
              <p className="text-sm text-neutral-500">
                {activeDocumento.tipo} • Status: {activeDocumento.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* T146: "Ver versões" button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
            >
              <History className="h-4 w-4 mr-2" />
              Ver versões
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar DOCX
            </Button>
          </div>
        </div>
      </header>

      {/* Main content: Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section selector */}
        <SectionSelector
          sections={[
            { id: '1_definicao_objeto', titulo: 'Definição do Objeto', numero: '1' },
            {
              id: '2_justificativa',
              titulo: 'Justificativa da Contratação',
              numero: '2',
            },
            {
              id: '3_especificacoes',
              titulo: 'Especificações Técnicas',
              numero: '3',
            },
            {
              id: '4_estimativa_custos',
              titulo: 'Estimativa de Custos',
              numero: '4',
            },
            {
              id: '5_gestao_fiscalizacao',
              titulo: 'Gestão e Fiscalização',
              numero: '5',
            },
            {
              id: '6_obrigacoes_contratante',
              titulo: 'Obrigações do Contratante',
              numero: '6',
            },
            {
              id: '7_obrigacoes_contratada',
              titulo: 'Obrigações da Contratada',
              numero: '7',
            },
            {
              id: '8_criterios_aceitacao',
              titulo: 'Critérios de Aceitação',
              numero: '8',
            },
            { id: '9_sancoes', titulo: 'Sanções Administrativas', numero: '9' },
          ]}
          activeSection={activeSection}
          onSelectSection={handleSectionChange}
        />

        {/* Right: Document editor */}
        <div className="flex-1 p-6">
          {documentoId && (
            <DocumentEditor
              documentoId={documentoId}
              secaoId={activeSection}
              initialContent={getSectionContent()}
            />
          )}
        </div>
      </div>

      {/* Version History Modal (T143-T149) */}
      {showVersionHistory && documentoId && (
        <VersionHistory
          documentoId={documentoId}
          open={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={handleVersionRestore}
        />
      )}
    </div>
  );
}
