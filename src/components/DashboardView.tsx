import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, MessageSquare, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Lead } from '../types';

interface DashboardViewProps {
  leads: Lead[];
}

const data = [
  { name: 'Seg', leads: 40, sales: 24 },
  { name: 'Ter', leads: 30, sales: 13 },
  { name: 'Qua', leads: 20, sales: 98 },
  { name: 'Qui', leads: 27, sales: 39 },
  { name: 'Sex', leads: 18, sales: 48 },
  { name: 'Sab', leads: 23, sales: 38 },
  { name: 'Dom', leads: 34, sales: 43 },
];

const COLORS = ['#4ADE80', '#10B981', '#059669', '#047857'];

export default function DashboardView({ leads }: DashboardViewProps) {
  const totalLeads = leads.length;
  const totalValue = leads.reduce((acc, lead) => acc + (lead.value || 0), 0);
  const closedLeads = leads.filter(l => l.status === 'Fechado').length;
  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  const pieData = [
    { name: 'Novos', value: leads.filter(l => l.status === 'Novo').length },
    { name: 'Em Contato', value: leads.filter(l => l.status === 'Em Contato').length },
    { name: 'Qualificados', value: leads.filter(l => l.status === 'Qualificado').length },
    { name: 'Fechados', value: closedLeads },
  ].filter(d => d.value > 0);

  // Se não houver dados, mostrar dados de exemplo para o gráfico de pizza não ficar vazio
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Sem Dados', value: 1 }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Leads"
          value={totalLeads.toLocaleString()}
          change={`${(totalLeads > 0 ? "+ " : "")}${totalLeads}`}
          isUp={totalLeads > 0}
          icon={Users}
        />
        <StatCard
          title="Conversas Ativas"
          value={leads.filter(l => l.status === 'Em Contato').length.toString()}
          change="+5.2%"
          isUp={true}
          icon={MessageSquare}
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          change={`${(conversionRate > 0 ? "+ " : "")}${conversionRate.toFixed(1)}%`}
          isUp={conversionRate > 0}
          icon={TrendingUp}
        />
        <StatCard
          title="Receita Estimada"
          value={`R$ ${totalValue.toLocaleString()}`}
          change="+8.4%"
          isUp={true}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold">Desempenho Semanal</h3>
            <select className="bg-white/5 border-none rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-[#4ADE80]">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#4ADE80' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#4ADE80" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart & Top Leads */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl flex flex-col">
            <h3 className="text-lg font-semibold mb-6">Status dos Leads</h3>
            <div className="flex-1 flex items-center">
              <div className="h-64 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {displayPieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-sm text-white/60">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isUp, icon: Icon }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl hover:bg-white/[0.05] transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#4ADE80]/10 transition-colors">
          <Icon className="w-6 h-6 text-white/60 group-hover:text-[#4ADE80]" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
          isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <h4 className="text-sm text-white/40 mb-1">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
