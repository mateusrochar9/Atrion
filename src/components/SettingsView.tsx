import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Database,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsView() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoding, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<null | 'email' | 'password' | 'plan'>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profile);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalLoading(true);
    const formData = new FormData(e.currentTarget);
    const newEmail = formData.get('email') as string;

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Email de confirmação enviado para o novo endereço!" });
      setTimeout(() => setModalType(null), 2000);
    }
    setModalLoading(false);
  };

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalLoading(true);
    const formData = new FormData(e.currentTarget);
    const current = formData.get('current_password') as string;
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (password !== confirm) {
      setMessage({ type: 'error', text: "As senhas não coincidem." });
      setModalLoading(false);
      return;
    }

    // Verificar senha atual reautenticando
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: current,
    });

    if (authError) {
      setMessage({ type: 'error', text: "Senha atual incorreta." });
      setModalLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Senha atualizada com sucesso!" });
      setTimeout(() => setModalType(null), 2000);
    }
    setModalLoading(false);
  };

  const updatePlan = async (plan: string) => {
    setModalLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', session.user.id);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setProfile({ ...profile, plan });
      setMessage({ type: 'success', text: `Plano alterado para ${plan}!` });
      setTimeout(() => setModalType(null), 2000);
    }
    setModalLoading(false);
  };

  const sections = [
    {
      title: "Conta",
      items: [
        { icon: User, label: "Perfil", detail: session?.user?.email || "Carregando...", action: () => { setModalType('email'); setMessage(null); } },
        { icon: CreditCard, label: "Plano", detail: profile?.plan || "Carregando...", action: () => { setModalType('plan'); setMessage(null); } },
        { icon: Shield, label: "Segurança", detail: "Senha e Autenticação", action: () => { setModalType('password'); setMessage(null); } },
      ]
    },
    {
      title: "Aplicativo",
      items: [
        { icon: Bell, label: "Notificações", detail: "Push e Email", action: () => {} },
        { icon: Monitor, label: "Aparência", detail: "Modo Escuro (Ativo)", action: () => {} },
        { icon: Database, label: "Dados e Backup", detail: "Exportar dados", action: () => {} },
      ]
    }
  ];

  if (isLoding) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4ADE80] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 relative">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-white/40">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Perfil Header */}
        <div className="md:col-span-3 bg-white/[0.03] border border-white/10 rounded-[40px] p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#4ADE80] to-emerald-600 flex items-center justify-center text-black text-3xl font-bold">
            {session?.user?.email?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{session?.user?.email?.split('@')[0]}</h3>
            <p className="text-white/40">{session?.user?.email}</p>
            <div className="mt-2 flex gap-2">
              <span className="px-3 py-1 bg-[#4ADE80]/10 text-[#4ADE80] text-[10px] font-bold uppercase rounded-full border border-[#4ADE80]/20">
                Plano {profile?.plan || 'Enterprise'}
              </span>
              <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-bold uppercase rounded-full border border-white/10">
                Admin
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all flex items-center gap-2 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>

        {/* Sections */}
        <div className="md:col-span-2 space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 ml-2">{section.title}</h4>
              <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden">
                {section.items.map((item, i) => (
                  <button 
                    key={item.label}
                    onClick={item.action}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-all text-left group",
                      i !== section.items.length - 1 && "border-b border-white/5"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#4ADE80]/20 transition-colors">
                      <item.icon className="w-5 h-5 text-white/40 group-hover:text-[#4ADE80] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-white/40">{item.detail}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#4ADE80]/10 to-transparent border border-[#4ADE80]/20 rounded-[32px] p-6 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#4ADE80]" />
              Sua Assinatura
            </h4>
            <p className="text-sm text-white/60 leading-relaxed">
              Você está utilizando o plano {profile?.plan || 'Enterprise'}. Acesso total a todas as IAs e extratores.
            </p>
            <button 
              onClick={() => setModalType('plan')}
              className="w-full py-3 bg-[#4ADE80] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition-transform"
            >
              Gerenciar Assinatura
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 space-y-4">
            <h4 className="font-bold">Informações</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center justify-between text-sm text-white/40 hover:text-white transition-colors">
                Termos de Uso
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="#" className="flex items-center justify-between text-sm text-white/40 hover:text-white transition-colors">
                Privacidade
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                Atrion v2.0.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setModalType(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>

              {modalType === 'email' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Editar Email</h3>
                    <p className="text-sm text-white/40">Altere o endereço de email da sua conta.</p>
                  </div>
                  <form onSubmit={updateEmail} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-white/20 ml-2">Novo Email</label>
                      <input 
                        name="email"
                        type="email" 
                        required
                        defaultValue={session?.user?.email}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-[#4ADE80] outline-none transition-all"
                      />
                    </div>
                    {message && (
                      <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1",
                        message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                      </div>
                    )}
                    <button 
                      disabled={modalLoading}
                      className="w-full py-4 bg-[#4ADE80] text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
                    </button>
                  </form>
                </div>
              )}

              {modalType === 'password' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Alterar Senha</h3>
                    <p className="text-sm text-white/40">Defina uma nova senha para sua conta.</p>
                  </div>
                  <form onSubmit={updatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-white/20 ml-2">Senha Atual</label>
                      <input 
                        name="current_password"
                        type="password" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-[#4ADE80] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-white/20 ml-2">Nova Senha</label>
                      <input 
                        name="password"
                        type="password" 
                        required
                        minLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-[#4ADE80] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-white/20 ml-2">Confirmar Senha</label>
                      <input 
                        name="confirm"
                        type="password" 
                        required
                        minLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-[#4ADE80] outline-none transition-all"
                      />
                    </div>
                    {message && (
                      <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1",
                        message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                      </div>
                    )}
                    <button 
                      disabled={modalLoading}
                      className="w-full py-4 bg-[#4ADE80] text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Atualizar Senha"}
                    </button>
                  </form>
                </div>
              )}

              {modalType === 'plan' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Gerenciar Plano</h3>
                    <p className="text-sm text-white/40">Escolha o plano ideal para seu negócio.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {['Free', 'Pro', 'Enterprise'].map((p) => (
                      <button 
                        key={p}
                        onClick={() => updatePlan(p)}
                        className={cn(
                          "w-full flex items-center justify-between p-5 rounded-3xl border transition-all group",
                          profile?.plan === p 
                            ? "bg-[#4ADE80]/10 border-[#4ADE80]/50" 
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="text-left">
                          <p className="font-bold">{p}</p>
                          <p className="text-xs text-white/40">
                            {p === 'Free' ? 'Padrão' : p === 'Pro' ? 'Avançado' : 'Completo'}
                          </p>
                        </div>
                        {profile?.plan === p ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/10 group-hover:border-[#4ADE80]/50 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                  {message && (
                    <div className={cn(
                      "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1",
                      message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {message.text}
                    </div>
                  )}
                  {modalLoading && (
                    <div className="flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-[#4ADE80]" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
