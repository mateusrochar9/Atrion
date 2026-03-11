import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, MessageSquare, Layout, Wifi, WifiOff, QrCode, Hash, Trash2 } from 'lucide-react';
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

type ActiveModal = { type: 'qr' | 'pairing'; instanceId: string; instanceName: string } | null;

const statusConfig = {
  connected: {
    label: 'Conectado',
    color: 'text-[#4ADE80]',
    bg: 'bg-[#4ADE80]/10',
    dot: 'bg-[#4ADE80]',
  },
  connecting: {
    label: 'Conectando...',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    dot: 'bg-yellow-400 animate-pulse',
  },
  disconnected: {
    label: 'Desconectado',
    color: 'text-white/40',
    bg: 'bg-white/5',
    dot: 'bg-white/20',
  },
};

export default function WhatsAppView() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [pairingCode, setPairingCode] = useState('');

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
        .insert({ user_id: user.id, name: instanceName.trim(), status: 'disconnected' })
        .select()
        .single();

      if (error) throw error;
      setInstances(prev => [data, ...prev]);
      setIsCreateModalOpen(false);
      setInstanceName('');
    } catch (error: any) {
      alert('Erro ao criar instância: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('whatsapp_instances').delete().eq('id', id);
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ADE80]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Instâncias WhatsApp</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {instances.length === 0 ? 'Nenhuma instância criada' : `${instances.length} instância${instances.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4ADE80] text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Nova Instância
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-8">
        {instances.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500">
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
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-4 bg-[#4ADE80] text-black rounded-2xl font-bold text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.2)] flex items-center gap-3"
            >
              <Layout className="w-5 h-5" />
              CRIAR NOVA INSTÂNCIA
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {instances.map((instance) => {
              const cfg = statusConfig[instance.status];
              return (
                <div key={instance.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col gap-4">
                  {/* Top section */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4ADE80]/20 to-emerald-600/10 border border-[#4ADE80]/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#4ADE80]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{instance.name}</h3>
                      <p className="text-xs text-white/30 mt-0.5">
                        {instance.phone_number || 'Nenhum número conectado'}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit', cfg.bg, cfg.color)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
                    {/* QR Code */}
                    <button
                      onClick={() => setActiveModal({ type: 'qr', instanceId: instance.id, instanceName: instance.name })}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#4ADE80]/10 hover:border-[#4ADE80]/30 border border-transparent transition-all group"
                    >
                      <QrCode className="w-4 h-4 text-white/40 group-hover:text-[#4ADE80] transition-colors" />
                      <span className="text-[10px] text-white/40 group-hover:text-[#4ADE80] transition-colors font-medium leading-none">QR Code</span>
                    </button>

                    {/* Pairing Code */}
                    <button
                      onClick={() => setActiveModal({ type: 'pairing', instanceId: instance.id, instanceName: instance.name })}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all group"
                    >
                      <Hash className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors" />
                      <span className="text-[10px] text-white/40 group-hover:text-blue-400 transition-colors font-medium leading-none">Pareamento</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteInstance(instance.id)}
                      disabled={deletingId === instance.id}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group"
                    >
                      {deletingId === instance.id
                        ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                        : <Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />}
                      <span className="text-[10px] text-white/40 group-hover:text-red-400 transition-colors font-medium leading-none">Deletar</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-white/20 -mt-2">
                    Criada em {new Date(instance.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Criar Instância */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#4ADE80]">Nova Instância</h3>
                <p className="text-xs text-white/40 mt-1">Defina um nome para identificação</p>
              </div>
              <button onClick={() => !isCreating && setIsCreateModalOpen(false)} disabled={isCreating} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <form onSubmit={handleCreateInstance} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome da Instância</label>
                <input
                  autoFocus required
                  value={instanceName}
                  onChange={e => setInstanceName(e.target.value)}
                  disabled={isCreating}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none placeholder:text-white/10"
                  placeholder="Ex: Comercial 01, Suporte..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}
                  className="flex-1 py-4 bg-white/5 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-all">
                  CANCELAR
                </button>
                <button type="submit" disabled={isCreating || !instanceName.trim()}
                  className="flex-[2] py-4 bg-[#4ADE80] text-black font-bold rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100">
                  {isCreating ? <><Loader2 className="w-5 h-5 animate-spin" />CRIANDO...</> : 'CRIAR INSTÂNCIA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {activeModal?.type === 'qr' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#4ADE80]">QR Code</h3>
                <p className="text-xs text-white/40 mt-1">{activeModal.instanceName}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            {/* QR Code placeholder — integrará com API futura */}
            <div className="bg-white rounded-2xl p-4 flex items-center justify-center mb-4">
              <div className="w-48 h-48 border-4 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-300">
                <QrCode className="w-12 h-12" />
                <p className="text-xs text-center text-gray-400 font-medium">Integre sua API<br />para exibir o QR</p>
              </div>
            </div>
            <p className="text-xs text-white/30 text-center">
              Escaneie o QR Code com o WhatsApp no seu celular para conectar esta instância.
            </p>
          </div>
        </div>
      )}

      {/* Modal Código de Pareamento */}
      {activeModal?.type === 'pairing' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-blue-400">Código de Pareamento</h3>
                <p className="text-xs text-white/40 mt-1">{activeModal.instanceName}</p>
              </div>
              <button onClick={() => { setActiveModal(null); setPairingCode(''); }} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Número de telefone</label>
                <input
                  autoFocus
                  value={pairingCode}
                  onChange={e => setPairingCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-white/10"
                  placeholder="5511999999999"
                />
                <p className="text-[10px] text-white/30 ml-1">Digite o número com DDD e código do país (sem +)</p>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-xs text-blue-300/70 leading-relaxed">
                  📱 Abra o WhatsApp → Aparelhos conectados → Conectar aparelho → Conectar com número de telefone.
                </p>
              </div>

              <button
                className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  // Integrar com API no futuro
                  alert('Integre com sua API para gerar o código de pareamento para: ' + pairingCode);
                }}
              >
                <Hash className="w-5 h-5" />
                GERAR CÓDIGO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
