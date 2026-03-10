import React, { useState } from 'react';
import { Plus, X, Loader2, MessageSquare, Layout } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WhatsAppView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instanceName.trim()) return;

    setIsCreating(true);
    // Simular criação de instância
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Criando instância:', instanceName);
    setIsModalOpen(false);
    setInstanceName('');
    setIsCreating(false);

    // Aqui você integraria com sua API de WhatsApp (ex: Evolution API)
    alert('Funcionalidade de criação de instância iniciada para: ' + instanceName);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#1A1A1A] rounded-[40px] border border-white/5 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ADE80]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 text-center space-y-8 max-w-lg px-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 mx-auto rotate-12 group hover:rotate-0 transition-transform duration-500">
            <MessageSquare className="w-10 h-10 text-[#4ADE80]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#4ADE80] flex items-center justify-center text-black border-4 border-[#1A1A1A]">
            <Plus className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Integração WhatsApp</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Conecte seu WhatsApp para automatizar atendimentos, gerenciar leads e escalar suas vendas com nossa IA.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative px-8 py-4 bg-[#4ADE80] text-black rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.2)] flex items-center gap-3 mx-auto"
        >
          <Layout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          CRIAR NOVA INSTÂNCIA
        </button>

        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-semibold">
          Seguro & Encriptado ponta-a-ponta
        </p>
      </div>

      {/* Modal de Criação de Instância */}
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
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                disabled={isCreating}
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <form onSubmit={handleCreateInstance} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome da Instância</label>
                <div className="relative">
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
