import React, { useState, useEffect } from 'react';
import {
  Bot,
  MessageSquare,
  LayoutDashboard,
  Users,
  Trello,
  Filter,
  Globe,
  Search,
  Bell,
  Settings,
  User,
  Plus,
  MoreVertical,
  Send,
  Phone,
  Video,
  Info,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Tab, Lead, Message } from './types';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import { Session } from '@supabase/supabase-js';

// Views
import AgentView from './components/AgentView';
import WhatsAppView from './components/WhatsAppView';
import DashboardView from './components/DashboardView';
import LeadsView from './components/LeadsView';
import KanbanView from './components/KanbanView';
import FunnelView from './components/FunnelView';
import ExtractorView from './components/ExtractorView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('whatsapp');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLeads(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLeads(session.user.id);
      else setLeads([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLeads = async (userId: string) => {
    setIsLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedLeads: Lead[] = (data || []).map(l => ({
        id: l.id,
        name: l.name,
        email: l.email || '',
        phone: l.phone || '',
        status: l.status as Lead['status'],
        value: Number(l.value),
        lastContact: l.last_contact,
        createdAt: l.created_at
      }));

      setLeads(mappedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'agente', label: 'Agente', icon: Bot },
    { id: 'whatsapp', label: 'Integração com WhatsApp', icon: MessageSquare },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'kanban', label: 'Kanban', icon: Trello },
    { id: 'funil', label: 'Funil de venda', icon: Filter },
    { id: 'extrator', label: 'Extrator IA', icon: Globe },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    if (isLoadingLeads && session) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#4ADE80] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'agente': return <AgentView />;
      case 'whatsapp': return <WhatsAppView />;
      case 'dashboard': return <DashboardView leads={leads} />;
      case 'leads': return <LeadsView leads={leads} onUpdate={() => session && fetchLeads(session.user.id)} />;
      case 'kanban': return <KanbanView leads={leads} setLeads={setLeads} />;
      case 'funil': return <FunnelView leads={leads} />;
      case 'extrator': return <ExtractorView />;
      case 'configuracoes': return <SettingsView />;
      default: return <WhatsAppView />;
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0F0F0F]">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-[#4ADE80] tracking-tight">Atrion</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id
                  ? "bg-[#4ADE80] text-black font-semibold shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-black" : "text-white/60 group-hover:text-white")} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div
            onClick={() => setActiveTab('configuracoes')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors group",
              activeTab === 'configuracoes' ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4ADE80] to-emerald-600 flex items-center justify-center text-black font-bold text-xs">
              {session.user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.email?.split('@')[0]}</p>
              <p className="text-xs text-white/40 truncate">Usuário</p>
            </div>
            <Settings className={cn("w-4 h-4 transition-colors", activeTab === 'configuracoes' ? "text-[#4ADE80]" : "text-white/40 group-hover:text-white")} />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-sm group"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#1A1A1A] rounded-tl-[40px] shadow-2xl overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5">
          <h2 className="text-lg font-semibold">
            {navItems.find(item => item.id === activeTab)?.label || activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-white/5 border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-[#4ADE80] w-64 transition-all"
              />
            </div>
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1A1A1A]"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
