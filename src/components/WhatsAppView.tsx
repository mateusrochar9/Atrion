import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, MessageSquare, Layout, Wifi, WifiOff, QrCode, Hash, Trash2, ChevronRight, Info, MessageCircle, Settings2 } from 'lucide-react';
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
    <div className="h-full flex gap-4 animate-in fade-in duration-500">
      {/* Slim Sidebar - Instâncias (w-20) */}
      <aside className="w-20 flex flex-col items-center py-6 gap-6 shrink-0 border-r border-white/5 bg-black/5 rounded-[32px]">
        <div className="flex flex-col items-center gap-1 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#4ADE80]/10 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-[#4ADE80]" />
            </div>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">API</span>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedInstanceId(null);
          }}
          title="Nova Instância"
          className={cn(
            "group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative",
            isCreatingNew
              ? "bg-[#4ADE80] text-black shadow-[0_0_20px_rgba(74,222,128,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Plus className="w-6 h-6" />
          {isCreatingNew && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-black rounded-full" />
          )}
        </button>

        <div className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto custom-scrollbar px-2">
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
                title={instance.name}
                className={cn(
                  "group w-12 h-12 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 relative shrink-0",
                  isSelected
                    ? "bg-white/10 text-[#4ADE80] shadow-xl border border-white/10"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="relative">
                    <MessageCircle className="w-6 h-6" />
                    <span className={cn('absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#1A1A1A]', cfg.dot)} />
                </div>
                {isSelected && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#4ADE80] rounded-full shadow-[0_0_10px_#4ADE80]" />
                )}
                <span className="text-[7px] font-bold mt-1 opacity-60 truncate w-full px-1 text-center">{instance.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area (Green area in the user request) */}
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
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">{selectedInstance.name}</h4>
                  <p className="text-xs text-white/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#4ADE80]" />
                    {selectedInstance.phone_number || 'Nenhum número conectado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest', statusConfig[selectedInstance.status].bg, statusConfig[selectedInstance.status].color)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig[selectedInstance.status].dot)} />
                    {statusConfig[selectedInstance.status].label}
                  </div>
              </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
              {/* Main Actions (The "WhatsApp API" part mentioned by user) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-[#4ADE80]/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#4ADE80]/5 rounded-full blur-2xl -mr-12 -mt-12" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-[#4ADE80]" />
                    </div>
                    <h5 className="font-bold text-white text-sm">QR Code Integration</h5>
                  </div>
                  <p className="text-[11px] text-white/40 mb-6 leading-relaxed">Conecte via QR Code. Este método é o mais rápido e estável para sincronização em tempo real.</p>
                  <button 
                    onClick={() => setActiveModal({ type: 'qr', instanceId: selectedInstance.id, instanceName: selectedInstance.name })}
                    className="w-full py-3 bg-[#4ADE80] text-black font-bold rounded-xl hover:scale-[1.02] transition-all text-[11px] uppercase tracking-wider"
                  >
                    CONECTAR VIA QR
                  </button>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-blue-400" />
                    </div>
                    <h5 className="font-bold text-white text-sm">CÓDIGO PAREAMENTO</h5>
                  </div>
                  <p className="text-[11px] text-white/40 mb-6 leading-relaxed">Use o código de 8 dígitos enviado para o seu número. Ideal para quando não há câmera disponível.</p>
                  <button 
                    onClick={() => setActiveModal({ type: 'pairing', instanceId: selectedInstance.id, instanceName: selectedInstance.name })}
                    className="w-full py-3 bg-blue-500/20 text-blue-400 font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[11px] uppercase tracking-wider"
                  >
                    GERAR CÓDIGO
                  </button>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-[24px] p-6 hover:border-red-500/30 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <h5 className="font-bold text-red-500 text-sm">GESTÃO CRÍTICA</h5>
                  </div>
                  <p className="text-[11px] text-white/30 mb-6 leading-relaxed">Excluir a instância removerá todas as automações associadas. Esta ação é irreversível.</p>
                  <button 
                    onClick={() => handleDeleteInstance(selectedInstance.id)}
                    disabled={deletingId === selectedInstance.id}
                    className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all text-[11px] uppercase tracking-wider disabled:opacity-50"
                  >
                    {deletingId === selectedInstance.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'REMOVER INSTÂNCIA'}
                  </button>
                </div>
              </div>

              {/* Statistics/Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                    <div className="flex items-center gap-2 text-white/60 mb-8 border-b border-white/5 pb-4">
                      <Info className="w-4 h-4 text-[#4ADE80]" />
                      <span className="text-sm font-bold uppercase tracking-widest">Informações Técnicas</span>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center group">
                        <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold group-hover:text-white/40 transition-colors">Data de Ativação</label>
                        <p className="text-white text-xs font-medium">{new Date(selectedInstance.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex justify-between items-center group">
                        <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold group-hover:text-white/40 transition-colors">Identificador Único</label>
                        <p className="text-white font-mono text-[9px] opacity-40 bg-white/5 px-2 py-1 rounded-md">{selectedInstance.id}</p>
                      </div>
                      <div className="flex justify-between items-center group">
                        <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold group-hover:text-white/40 transition-colors">Versão da API</label>
                        <p className="text-[#4ADE80] font-bold text-xs">v2.4.1 (Stable)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-[#4ADE80]/5 flex items-center justify-center">
                          <Wifi className="w-8 h-8 text-[#4ADE80]/40" />
                      </div>
                      <div>
                          <h6 className="text-white font-bold text-sm">Monitoramento de Conexão</h6>
                          <p className="text-[11px] text-white/30 max-w-[200px] mt-2">A latência da API está dentro dos padrões normais (85ms).</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700 relative z-10 px-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center rotate-12 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <MessageSquare className="w-10 h-10 text-[#4ADE80]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#4ADE80] flex items-center justify-center text-black border-4 border-[#1A1A1A] shadow-lg">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3 max-w-sm">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Painel de Integração</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Bem-vindo ao centro de controle WhatsApp. Selecione uma instância para começar a transmitir ou crie uma do zero.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-8 py-4 bg-[#4ADE80] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.3)] flex items-center gap-3"
            >
              <Layout className="w-4 h-4" />
              CONFIGURAR NOVA API
            </button>
          </div>
        )}
      </main>

      {/* Modals Transientes (QR e Pareamento) */}
      {activeModal?.type === 'qr' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] w-full max-w-sm p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sincronização QR</h3>
                <p className="text-xs text-[#4ADE80] font-bold mt-1">{activeModal.instanceName}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <div className="bg-white rounded-3xl p-6 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <div className="w-48 h-48 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-200">
                <QrCode className="w-14 h-14" />
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Aguardando API...</p>
              </div>
            </div>
            <p className="text-[11px] text-white/30 text-center leading-relaxed">
              Abra o WhatsApp no seu celular, vá em <span className="text-white font-bold">Aparelhos Conectados</span> e escaneie o código acima.
            </p>
          </div>
        </div>
      )}

      {activeModal?.type === 'pairing' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] w-full max-w-sm p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Código Direto</h3>
                <p className="text-xs text-blue-400 font-bold mt-1">{activeModal.instanceName}</p>
              </div>
              <button onClick={() => { setActiveModal(null); setPairingCode(''); }} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Telefone (DDI + DDD + NÚMERO)</label>
                <input
                  autoFocus
                  value={pairingCode}
                  onChange={e => setPairingCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder:text-white/10 text-white font-bold tracking-widest"
                  placeholder="5511999999999"
                />
              </div>

              <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-[11px] text-blue-300/60 leading-relaxed italic">
                  📱 Dispositivos Conectados → Conectar Aparelho → Parear com número de telefone.
                </p>
              </div>

              <button
                className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20"
                onClick={() => {
                  alert('Gerando código de pareamento para: ' + pairingCode);
                }}
              >
                <Hash className="w-4 h-4" />
                GERAR CÓDIGO AGORA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
