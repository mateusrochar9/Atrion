import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, MessageSquare, Layout, Wifi, WifiOff, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface WhatsAppInstance {
  id: string;
  user_id: string;
  name: string;
  status: 'disconnected' | 'connecting' | 'connected';
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  connected: {
    label: 'Conectado',
    color: 'text-[#4ADE80]',
    bg: 'bg-[#4ADE80]/10',
    dot: 'bg-[#4ADE80]',
    Icon: Wifi,
  },
  connecting: {
    label: 'Conectando...',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    dot: 'bg-yellow-400',
    Icon: Loader2,
  },
  disconnected: {
    label: 'Desconectado',
    color: 'text-white/40',
    bg: 'bg-white/5',
    dot: 'bg-white/20',
    Icon: WifiOff,
  },
};

export default function WhatsAppView() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instanceName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert({
          user_id: user.id,
          name: instanceName.trim(),
          status: 'disconnected',
        })
        .select()
        .single();

      if (error) throw error;

      setInstances(prev => [data, ...prev]);
      setIsModalOpen(false);
      setInstanceName('');
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      alert('Erro ao criar instância: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInstances(prev => prev.filter(i => i.id !== id));
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1A1A1A] rounded-[40px]">
        <Loader2 className="w-8 h-8 text-[#4ADE80] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] rounded-[40px] border border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ADE80]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Instâncias WhatsApp</h2>
          <p className="text-xs text-white/40">
            {instances.length === 0
              ? 'Nenhuma instância criada'
              : `${instances.length} instância${instances.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4ADE80] text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Nova Instância
        </button>
      </div>

      {/* Instances Grid or Empty State */}
      <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-8">
        {instances.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500 cursor-default">
                <MessageSquare className="w-10 h-10 text-[#4ADE80]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#4ADE80] flex items-center justify-center text-black border-4 border-[#1A1A1A]">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-2xl font-bold text-white">Conecte seu WhatsApp</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Crie sua primeira instância para automatizar atendimentos e gerenciar leads com IA.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-[#4ADE80] text-black rounded-2xl font-bold text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.2)] flex items-center gap-3"
            >
              <Layout className="w-5 h-5" />
              CRIAR NOVA INSTÂNCIA
            </button>
          </div>
        ) : (
          /* Instances Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {instances.map((instance) => {
              const cfg = statusConfig[instance.status];
              const StatusIcon = cfg.Icon;
              return (
                <div
                  key={instance.id}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group relative"
                >
                  {/* Actions menu */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteInstance(instance.id)}
                      disabled={deletingId === instance.id}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-white/20 hover:text-red-400"
                    >
                      {deletingId === instance.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Instance icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4ADE80]/20 to-emerald-600/10 border border-[#4ADE80]/20 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-[#4ADE80]" />
                  </div>

                  <h3 className="font-semibold text-white text-sm mb-1 pr-8">{instance.name}</h3>
                  <p className="text-xs text-white/30 mb-4">
                    {instance.phone_number || 'Nenhum número conectado'}
                  </p>

                  {/* Status badge */}
                  <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot, instance.status === 'connecting' && 'animate-pulse')} />
                    {cfg.label}
                  </div>

                  {/* Created date */}
                  <p className="text-[10px] text-white/20 mt-3">
                    Criada em {new Date(instance.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#4ADE80]">Nova Instância</h3>
                <p className="text-xs text-white/40">Defina um nome para identificação</p>
              </div>
              <button
                onClick={() => !isCreating && setIsModalOpen(false)}
                disabled={isCreating}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <form onSubmit={handleCreateInstance} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                  Nome da Instância
                </label>
                <input
                  autoFocus
                  required
                  value={instanceName}
                  onChange={e => setInstanceName(e.target.value)}
                  disabled={isCreating}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none transition-all placeholder:text-white/10"
                  placeholder="Ex: Comercial 01, Suporte..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 py-4 bg-white/5 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !instanceName.trim()}
                  className="flex-[2] py-4 bg-[#4ADE80] text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      CRIANDO...
                    </>
                  ) : 'CRIAR INSTÂNCIA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
