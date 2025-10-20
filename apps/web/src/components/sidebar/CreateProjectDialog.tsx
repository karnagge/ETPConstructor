import { useState, ReactNode } from 'react';
import { useProjetosStore } from '../../stores/projects.store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface CreateProjectDialogProps {
  children: ReactNode;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createProjeto } = useProjetosStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (nome.length < 3) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      // TODO: Get actual usuarioId from auth context
      const usuarioId = '00000000-0000-0000-0000-000000000000';
      await createProjeto({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        cor,
        usuarioId,
      });

      // Reset form and close dialog
      setNome('');
      setDescricao('');
      setCor('#3b82f6');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
            <DialogDescription>
              Crie um projeto para organizar seus ETPs relacionados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="nome">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Ex: Licitações TI 2025"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={100}
                autoFocus
              />
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                placeholder="Breve descrição do projeto"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Cor */}
            <div className="grid gap-2">
              <Label>Cor do Projeto</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((presetCor) => (
                  <button
                    key={presetCor}
                    type="button"
                    onClick={() => setCor(presetCor)}
                    className="h-8 w-8 rounded-md border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: presetCor,
                      borderColor: cor === presetCor ? '#000' : 'transparent',
                    }}
                    aria-label={`Cor ${presetCor}`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nome.trim()}>
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
