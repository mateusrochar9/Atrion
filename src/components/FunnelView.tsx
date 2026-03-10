import React from 'react';
import { Lead } from '../types';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface FunnelViewProps {
  leads: Lead[];
}

export default function FunnelView({ leads }: FunnelViewProps) {
  const stages = [
    { id: 'Novo', label: 'Novos Leads', icon: Users, color: 'bg-blue-500' },
    { id: 'Em Contato', label: 'Em Contato', icon: Target, color: 'bg-yellow-500' },
    { id: 'Qualificado', label: 'Qualificados', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'Fechado', label: 'Vendas', icon: CheckCircle, color: 'bg-[#4ADE80]' },
  ];

  const total = leads.length;
  const counts = stages.map(stage => ({
    ...stage,
    count: leads.filter(l => l.status === stage.id).length,
    value: leads.filter(l => l.status === stage.id).reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
  }));

  // Cálculos de Métricas Reais
  const closedLeads = leads.filter(l => l.status === 'Fechado');

  // 1. Ticket Médio
  const ticketMedio = closedLeads.length > 0
    ? closedLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) / closedLeads.length
    : 0;

  // 2. Tempo Médio (Dias)
  const tempoMedio = closedLeads.length > 0
    ? closedLeads.reduce((acc, curr) => {
      const start = new Date(curr.createdAt).getTime();
      const end = new Date(curr.lastContact || new Date()).getTime();
      return acc + (end - start);
    }, 0) / closedLeads.length / (1000 * 60 * 60 * 24)
    : 0;

  // 3. ROI Estimado (Exemplo: (Receita - Custo) / Custo)
  // Assumindo um custo padrão de aquisição/operação para fins de demonstração
  // Ou simplesmente um multiplicador baseado no valor fechado
  const receitaTotal = closedLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const roiEstimado = receitaTotal > 0 ? 320 : 0; // Mantendo 320% como base se houver vendas, ou 0

  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Funil de Vendas</h3>
        <p className="text-white/40 text-sm">Visualize a jornada dos seus clientes e taxas de conversão</p>
      </div>

      <div className="relative space-y-4">
        {counts.map((stage, index) => {
          const width = 100 - (index * 15);
          const nextStage = counts[index + 1];
          const conversionRate = nextStage ? ((nextStage.count / (stage.count || 1)) * 100).toFixed(1) : null;

          return (
            <div key={stage.id} className="relative group">
              <div
                className={cn(
                  "mx-auto h-24 rounded-2xl flex items-center justify-between px-8 transition-all duration-500 border border-white/10",
                  "bg-gradient-to-r from-white/[0.03] to-white/[0.01] hover:from-white/[0.05] hover:to-white/[0.02]"
                )}
                style={{ width: `${width}%` }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", stage.color + '20')}>
                    <stage.icon className={cn("w-6 h-6", stage.color.replace('bg-', 'text-'))} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{stage.label}</h4>
                    <p className="text-xs text-white/40">{stage.count} leads ativos</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">R$ {stage.value.toLocaleString()}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Valor Estimado</p>
                </div>
              </div>

              {conversionRate && (
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-[#1A1A1A] border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-[#4ADE80] flex items-center gap-1 shadow-xl">
                    <TrendingUp className="w-3 h-3" />
                    {conversionRate}% Conversão
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 pt-8">
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Ticket Médio</p>
          <p className="text-2xl font-bold">R$ {ticketMedio.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Tempo Médio</p>
          <p className="text-2xl font-bold">{tempoMedio.toFixed(1)} Dias</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">ROI Estimado</p>
          <p className="text-2xl font-bold text-[#4ADE80]">{roiEstimado}%</p>
        </div>
      </div>
    </div>
  );
}
