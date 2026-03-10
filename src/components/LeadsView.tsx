import React, { useState } from 'react';
import { MoreVertical, Mail, Phone, Calendar, Filter, Download, Plus, X, Loader2 } from 'lucide-react';
import { Lead } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface LeadsViewProps {
  leads: Lead[];
  onUpdate: () => void;
}

export default function LeadsView({ leads, onUpdate }: LeadsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    value: ''
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          value: parseFloat(formData.value) || 0,
          status: 'Novo'
        });

      if (error) throw error;
      
      setFormData({ name: '', email: '', phone: '', value: '' });
      setIsModalOpen(false);
      onUpdate();
    } catch (error: any) {
      alert('Erro ao adicionar lead: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error: any) {
      alert('Erro ao excluir lead: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[#4ADE80] text-black rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      {/* Modal - Simplificado para agilidade */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4ADE80]">Adicionar Novo Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/40 uppercase ml-1">Nome Completo</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/40 uppercase ml-1">E-mail</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/40 uppercase ml-1">Telefone</label>
                  <input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none"
                    placeholder="+55 11 ..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/40 uppercase ml-1">Valor Estimado (R$)</label>
                <input 
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80]/50 outline-none"
                  placeholder="0,00"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#4ADE80] text-black font-bold rounded-xl mt-4 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 "
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CRIAR LEAD'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider">Último Contato</th>
              <th className="px-6 py-4 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-white/20 text-sm">
                  Nenhum lead encontrado. Comece adicionando o primeiro!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-800 flex items-center justify-center font-semibold">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-white/40">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-white/40">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      lead.status === 'Novo' && "bg-blue-500/10 text-blue-500",
                      lead.status === 'Em Contato' && "bg-yellow-500/10 text-yellow-500",
                      lead.status === 'Qualificado' && "bg-purple-500/10 text-purple-500",
                      lead.status === 'Fechado' && "bg-[#4ADE80]/10 text-[#4ADE80]",
                      lead.status === 'Perdido' && "bg-red-500/10 text-red-500",
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">R$ {lead.value.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="w-4 h-4" />
                      {new Date(lead.lastContact).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteLead(lead.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/20 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
