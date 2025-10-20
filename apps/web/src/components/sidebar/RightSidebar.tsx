import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CompliancePanel } from '../compliance/CompliancePanel';
import { cn } from '@/lib/utils';
import { useDocumentsStore } from '@/stores/documents.store';

/**
 * RightSidebar - Collapsible compliance panel
 * T159: Collapsible sidebar with compliance information
 * T163: Fetches validations from API
 * T165-T166: Real-time updates via socket events
 */
export function RightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [resumo, setResumo] = useState<any>(null);
  const activeDocumento = useDocumentsStore((state) => state.activeDocumento);
  const fetchValidacoes = useDocumentsStore((state) => state.fetchValidacoes);

  useEffect(() => {
    if (activeDocumento?.uuid) {
      // Load validations when document changes
      loadValidations();
    }
  }, [activeDocumento?.uuid]);

  const loadValidations = async () => {
    if (!activeDocumento?.uuid) return;

    try {
      const data = await fetchValidacoes(activeDocumento.uuid);
      setResumo(data.resumo);
    } catch (error) {
      console.error('Error fetching validations:', error);
    }
  };

  // Listen to real-time validation events
  useEffect(() => {
    const handleValidationComplete = (data: any) => {
      if (data.documentoUuid === activeDocumento?.uuid) {
        setResumo(data.resumo);
      }
    };

    const handleAlertaSecao = (data: any) => {
      if (data.documentoUuid === activeDocumento?.uuid) {
        // Append real-time alert
        loadValidations(); // Reload to get fresh data
      }
    };

    // Subscribe to socket events
    // Note: socket service should be imported and used here
    // For now, this is a placeholder

    return () => {
      // Cleanup socket listeners
    };
  }, [activeDocumento?.uuid]);

  if (!activeDocumento) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative border-l border-gray-200 bg-gray-50 transition-all duration-300',
        isCollapsed ? 'w-12' : 'w-80',
      )}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
        title={isCollapsed ? 'Expandir painel' : 'Recolher painel'}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="h-full overflow-y-auto p-4">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Validação Legal
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Conformidade com legislação brasileira
            </p>
          </div>

          {resumo ? (
            <CompliancePanel
              percentualConformidade={resumo.percentual_conformidade || 0}
              totalRegras={resumo.total_regras || 0}
              regrasValidas={resumo.regras_validas || 0}
              errosCriticos={resumo.erros_criticos || []}
              alertas={resumo.alertas || []}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500">
                  Carregando validações...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed State - Show icon only */}
      {isCollapsed && (
        <div className="flex flex-col items-center justify-start pt-20 px-2 space-y-4">
          <div className="transform -rotate-90 whitespace-nowrap text-xs font-medium text-gray-600">
            Validação Legal
          </div>
        </div>
      )}
    </div>
  );
}
