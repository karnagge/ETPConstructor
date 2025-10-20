import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useCallback, useState } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { socketService } from '../../services/socket.service';

/**
 * T135: DocumentEditor component using TipTap
 * WYSIWYG editor for document sections with auto-save
 */
interface DocumentEditorProps {
  documentoId: string;
  secaoId: string;
  initialContent?: any;
  onSave?: (content: any) => void;
}

export function DocumentEditor({
  documentoId,
  secaoId,
  initialContent,
  onSave,
}: DocumentEditorProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // T136: Configure TipTap extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: initialContent?.html || '<p>Digite o conteúdo da seção...</p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] max-w-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // T139: Debounce onChange (handled by debouncedSave)
      debouncedSave(editor.getHTML());
    },
  });

  // T139: Implement onChange debounce (2 seconds)
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (content: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleSave(content);
        }, 2000); // 2 second debounce
      };
    })(),
    [documentoId, secaoId],
  );

  // T139: Emit 'editar_secao' socket event
  const handleSave = async (content: string) => {
    try {
      setIsSaving(true);

      const conteudo = {
        html: content,
        text: editor?.getText() || '',
        json: editor?.getJSON() || {},
      };

      // Emit socket event
      socketService.emit('editar_secao', {
        documentoId,
        secaoId,
        conteudo,
      });

      // Call optional callback
      onSave?.(conteudo);
    } catch (error) {
      console.error('[DocumentEditor] Error saving:', error);
    }
  };

  // T140: Listen for 'secao_salva' event
  useEffect(() => {
    const handleSecaoSalva = (data: {
      secaoId: string;
      numeroVersao: number;
      timestamp: string;
    }) => {
      if (data.secaoId === secaoId) {
        setLastSaved(new Date(data.timestamp));
        setIsSaving(false);
        console.log(
          `[DocumentEditor] Section ${secaoId} saved as version ${data.numeroVersao}`,
        );
      }
    };

    socketService.on('secao_salva', handleSecaoSalva);

    return () => {
      socketService.off('secao_salva', handleSecaoSalva);
    };
  }, [secaoId]);

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent?.html) {
      editor.commands.setContent(initialContent.html);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return <div className="p-4 text-neutral-500">Carregando editor...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white border border-neutral-200 rounded-lg">
      {/* T137: EditorToolbar */}
      <EditorToolbar editor={editor} />

      {/* T140: "Salvo às HH:MM" badge */}
      <div className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          Seção: <span className="font-medium">{secaoId.replace(/_/g, ' ')}</span>
        </div>
        <div className="text-sm">
          {isSaving ? (
            <span className="text-blue-500">Salvando...</span>
          ) : lastSaved ? (
            <span className="text-green-600">
              Salvo às {lastSaved.toLocaleTimeString('pt-BR')}
            </span>
          ) : (
            <span className="text-neutral-400">Não salvo</span>
          )}
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
