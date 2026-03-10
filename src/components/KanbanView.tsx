import React from 'react';
import { MoreHorizontal, Plus, Calendar, DollarSign } from 'lucide-react';
import { Lead } from '../types';
import { cn } from '../lib/utils';

interface KanbanViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const COLUMNS = [
  { id: 'Novo', label: 'Novos Leads', color: 'bg-blue-500' },
  { id: 'Em Contato', label: 'Em Contato', color: 'bg-yellow-500' },
  { id: 'Qualificado', label: 'Qualificados', color: 'bg-purple-500' },
  { id: 'Fechado', label: 'Fechados', color: 'bg-[#4ADE80]' },
];

export default function KanbanView({ leads }: KanbanViewProps) {
  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", column.color)}></div>
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                {leads.filter(l => l.status === column.id).length}
              </span>
            </div>
            <button className="p-1 hover:bg-white/5 rounded-lg">
              <Plus className="w-4 h-4 text-white/40" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {leads
              .filter(lead => lead.status === column.id)
              .map((lead) => (
                <div 
                  key={lead.id}
                  className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl hover:border-[#4ADE80]/50 transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium group-hover:text-[#4ADE80] transition-colors">{lead.name}</h4>
                    <button className="p-1 hover:bg-white/5 rounded-lg">
                      <MoreHorizontal className="w-4 h-4 text-white/40" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <DollarSign className="w-3 h-3" />
                      R$ {lead.value.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.lastContact).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-[#1A1A1A] flex items-center justify-center text-[8px] font-bold">
                        JD
                      </div>
                    </div>
                    <span className="text-[10px] text-white/20">ID: #{lead.id}</span>
                  </div>
                </div>
              ))}
            
            <button className="w-full py-3 border-2 border-dashed border-white/5 rounded-2xl text-xs text-white/20 hover:border-white/10 hover:text-white/40 transition-all">
              + Adicionar Lead
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
