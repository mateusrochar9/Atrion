import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, MessageSquare, Layout, Wifi, WifiOff, QrCode, Hash, Trash2, ChevronRight, Info, MessageCircle } from 'lucide-react';
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
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [pairingCode, setPairingCode] = useState('');

  const selectedInstance = instances.find(i => i.id === selectedInstanceId);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async (selectFirst = true) => {
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
      const fetchedInstances = data || [];
      setInstances(fetchedInstances);
      
      if (selectFirst && fetchedInstances.length > 0 && !selectedInstanceId) {
        setSelectedInstanceId(fetchedInstances[0].id);
      }
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
      setSelectedInstanceId(data.id);
      setIsCreatingNew(false);
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
      
      setInstances(prev => {
        const filtered = prev.filter(i => i.id !== id);
        if (selectedInstanceId === id) {
          setSelectedInstanceId(filtered[0]?.id || null);
        }
        return filtered;
      });
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading && instances.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1A1A1A] rounded-[40px]">
        <Loader2 className="w-8 h-8 text-[#4ADE80] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-8 animate-in fade-in duration-500">
      {/* Dynamic Sidebar - Instâncias */}
      <aside className="w-72 flex flex-col gap-2 shrink-0">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Instâncias WhatsApp</h3>
          <p className="text-xs text-white/40">Gerencie suas conexões e APIs.</p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedInstanceId(null);
          }}
          className={cn(
            "group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden mb-2",
            isCreatingNew
              ? "bg-[#4ADE80] text-black shadow-[0_0_20px_rgba(74,222,128,0.2)] font-bold"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isCreatingNew ? "bg-black/10" : "bg-white/5"
          )}>
            <Plus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[13px]">Nova Instância</p>
          </div>
          <ChevronRight className={cn("w-4 h-4 transition-transform", isCreatingNew ? "translate-x-0" : "translate-x-8")} />
        </button>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
          {instances.map((instance) => {
            const isSelected = selectedInstanceId === instance.id;
            const cfg = statusConfig[instance.status];
            
            return (
              <button
                key={instance.id}
                onClick={() => {
                  setSelectedInstanceId(instance.id);
                  setIsCreatingNew(false);
                }}
                className={cn(
                  "group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 text-left relative overflow-hidden",
                  isSelected
                    ? "bg-white/10 text-white shadow-lg border border-white/10"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                  isSelected ? "bg-[#4ADE80]/20 text-[#4ADE80]" : "bg-white/5"
                )}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{instance.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    <p className="text-[10px] uppercase tracking-wider opacity-60">
                      {cfg.label}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col bg-black/20 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl relative">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ADE80]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px]" />
        </div>

        {isCreatingNew ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in slide-in-from-right-4 duration-500 relative z-10">
            <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent" />
               <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-[#4ADE80]">Nova Instância</h3>
                  <p className="text-xs text-white/40 mt-1">Defina um nome para identificação</p>
                </div>
                <button onClick={() => setIsCreatingNew(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none placeholder:text-white/10 text-white"
                    placeholder="Ex: Comercial 01, Suporte..."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsCreatingNew(false)} disabled={isCreating}
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
        ) : selectedInstance ? (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500 relative z-10">
            <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4ADE80]/10 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#4ADE80]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedInstance.name}</h4>
                  <p className="text-sm text-white/40">
                    {selectedInstance.phone_number || 'Nenhum número conectado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold', statusConfig[selectedInstance.status].bg, statusConfig[selectedInstance.status].color)}>
                    <span className={cn('w-2 h-2 rounded-full', statusConfig[selectedInstance.status].dot)} />
                    {statusConfig[selectedInstance.status].label}
                  </div>
              </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
              {/* Stats/Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-[#4ADE80]/30 transition-colors group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-[#4ADE80]" />
                    </div>
                    <h5 className="font-bold text-white">QR Code</h5>
                  </div>
                  <p className="text-xs text-white/40 mb-6 leading-relaxed">Conecte seu dispositivo escaneando o código QR gerado pela API.</p>
                  <button 
                    onClick={() => setActiveModal({ type: 'qr', instanceId: selectedInstance.id, instanceName: selectedInstance.name })}
                    className="w-full py-3 bg-[#4ADE80]/10 text-[#4ADE80] font-bold rounded-xl hover:bg-[#4ADE80] hover:text-black transition-all text-xs"
                  >
                    ABRIR QR CODE
                  </button>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-blue-500/30 transition-colors group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-blue-400" />
                    </div>
                    <h5 className="font-bold text-white">Pareamento</h5>
                  </div>
                  <p className="text-xs text-white/40 mb-6 leading-relaxed">Conecte via código de pareamento usando o seu número de telefone.</p>
                  <button 
                    onClick={() => setActiveModal({ type: 'pairing', instanceId: selectedInstance.id, instanceName: selectedInstance.name })}
                    className="w-full py-3 bg-blue-500/10 text-blue-400 font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all text-xs"
                  >
                    GERAR CÓDIGO
                  </button>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-red-500/30 transition-colors group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <h5 className="font-bold text-white">Excluir</h5>
                  </div>
                  <p className="text-xs text-white/40 mb-6 leading-relaxed">Remover permanentemente esta instância e todas as suas sessões.</p>
                  <button 
                    onClick={() => handleDeleteInstance(selectedInstance.id)}
                    disabled={deletingId === selectedInstance.id}
                    className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs disabled:opacity-50"
                  >
                    {deletingId === selectedInstance.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'EXCLUIR INSTÂNCIA'}
                  </button>
                </div>
              </div>

              {/* Details Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                <div className="flex items-center gap-2 text-white/60 mb-6">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-semibold">Detalhes da Instância</span>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Data de Criação</label>
                    <p className="text-white font-medium mt-1">{new Date(selectedInstance.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">ID da Instância</label>
                    <p className="text-white font-mono text-xs mt-1 opacity-60">{selectedInstance.id}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Última Atualização</label>
                    <p className="text-white font-medium mt-1">{new Date(selectedInstance.updated_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Plataforma</label>
                    <p className="text-white font-medium mt-1 flex items-center gap-2">
                       <MessageCircle className="w-4 h-4 text-[#4ADE80]" />
                       WUZAPI Integrated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700 relative z-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500">
                <MessageSquare className="w-10 h-10 text-[#4ADE80]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#4ADE80] flex items-center justify-center text-black border-4 border-[#1A1A1A]">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm px-8">
              <h3 className="text-2xl font-bold text-white">Inicie sua Integração</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Selecione uma instância na barra lateral ou crie uma nova para começar a automatizar seus atendimentos.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-8 py-4 bg-[#4ADE80] text-black rounded-2xl font-bold text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.2)] flex items-center gap-3"
            >
              <Layout className="w-5 h-5" />
              CRIAR PRIMEIRA INSTÂNCIA
            </button>
          </div>
        )}
      </main>

      {/* Modals Transientes (QR e Pareamento) */}
      {activeModal?.type === 'qr' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#4ADE80]">QR Code</h3>
                <p className="text-xs text-white/40 mt-1">{activeModal.instanceName}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
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

      {activeModal?.type === 'pairing' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-blue-400">Código de Pareamento</h3>
                <p className="text-xs text-white/40 mt-1">{activeModal.instanceName}</p>
              </div>
              <button onClick={() => { setActiveModal(null); setPairingCode(''); }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-white/10 text-white"
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
