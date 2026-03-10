import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  User,
  Briefcase,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Zap,
  ShieldAlert,
  Megaphone,
  ChevronRight,
  ChevronLeft,
  Save,
  Play
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AgentConfig } from '../types';
import { cn } from '../lib/utils';

const STEPS = [
  { id: 'identidade', title: '1. Personalidade', icon: User, modules: [1, 2] },
  { id: 'contexto', title: '2. Negócio', icon: Briefcase, modules: [1] },
  { id: 'catalogo', title: '3. Produtos', icon: BookOpen, modules: [3] },
  { id: 'qualificacao', title: '4. Qualificação', icon: CheckCircle2, modules: [4, 5] },
  { id: 'vendas', title: '5. Vendas & FAQ', icon: Zap, modules: [6, 7, 12] },
  { id: 'workflow', title: '6. Fluxo & Transbordo', icon: MessageSquare, modules: [8, 9] },
  { id: 'objecoes', title: '7. Objeções', icon: ShieldAlert, modules: [10, 11] },
  { id: 'campanhas', title: '8. Campanhas', icon: Megaphone, modules: [13] },
  { id: 'teste', title: 'Homologação', icon: Play, isFinal: true },
];

const INITIAL_CONFIG: AgentConfig = {
  nome_agente: '',
  nome_empresa: '',
  tom_de_voz: 'Profissional',
  formal_ou_informal: 'Formal',
  uso_emojis: 'Moderado',
  apresentacao_escolhida: '',
  descricao_empresa: '',
  diferenciais_competitivos: '',
  site: '',
  redes_sociais: '',
  horario_funcionamento: '',
  atende_fds: 'Não',
  lista_detalhada_produtos: '',
  perfil_cliente_ideal: '',
  campos_selecionados_checklist: '',
  pergunta_especifica_negocio: '',
  faq_perguntas_respostas: '',
  formas_pagamento: '',
  condicoes_especiais: '',
  links_materiais: '',
  passo_a_passo_atendimento: '',
  nome_consultor: '',
  zap_consultor: '',
  situacoes_transbordo: '',
  mensagem_transferencia: '',
  horario_atendente: '',
  mensagem_fora_horario_humano: '',
  respostas_objecoes: '',
  lista_proibicoes: '',
  campanha_atual: '',
  politicas_troca_garantia: ''
};

export default function AgentView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<AgentConfig>(INITIAL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testMessage, setTestMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('agents')
      .select('detailed_config')
      .eq('user_id', user.id)
      .single();

    if (data?.detailed_config && Object.keys(data.detailed_config).length > 0) {
      setConfig({ ...INITIAL_CONFIG, ...data.detailed_config });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('agents')
        .upsert({
          user_id: user.id,
          detailed_config: config,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof AgentConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const generatePrompt = () => {
    return `
# 1. IDENTIDADE E PERSONA (Módulos 1 e 2)
Seu nome é ${config.nome_agente}, você é o especialista de atendimento da ${config.nome_empresa}.
- **Tom de Voz:** ${config.tom_de_voz}.
- **Linguagem:** ${config.formal_ou_informal} e uso de emojis: ${config.uso_emojis}.
- **Saudação Inicial:** Sempre utilize: "${config.apresentacao_escolhida}".

# 2. CONTEXTO DO NEGÓCIO (Módulo 1)
- **O que fazemos:** ${config.descricao_empresa}.
- **Diferenciais:** ${config.diferenciais_competitivos}.
- **Canais Oficiais:** Site: ${config.site}, Instagram: ${config.redes_sociais}.
- **Horários:** ${config.horario_funcionamento}. Atendemos fins de semana? ${config.atende_fds}.

# 3. CATÁLOGO DE PRODUTOS E SERVIÇOS (Módulo 3)
Você possui conhecimento profundo sobre:
${config.lista_detalhada_produtos} 
*(Sempre informe Preço, Prazo e Descrição conforme cadastrado)*.

# 4. QUALIFICAÇÃO E COLETA DE DADOS (Módulos 4 e 5)
Seu público-alvo é: ${config.perfil_cliente_ideal}.
- **Obrigatório coletar antes do transbordo:** ${config.campos_selecionados_checklist}.
- **Pergunta Crucial:** Antes de passar para o consultor, você DEVE perguntar: ${config.pergunta_especifica_negocio}.

# 5. DIRETRIZES DE VENDAS E FAQ (Módulos 6, 7 e 12)
- **FAQ:** Responda às dúvidas comuns rigorosamente conforme: ${config.faq_perguntas_respostas}.
- **Pagamentos:** Aceitamos ${config.formas_pagamento}. Condições especiais: ${config.condicoes_especiais}.
- **Materiais de Apoio:** Envie estes links quando relevante: ${config.links_materiais}.

# 6. FLUXO DE TRABALHO E TRANSBORDO (Módulos 8 e 9)
Siga o processo de atendimento: ${config.passo_a_passo_atendimento}.
- **Quando transferir:** Transfira para ${config.nome_consultor} no WhatsApp ${config.zap_consultor} se: ${config.situacoes_transbordo}.
- **Mensagem de Transbordo:** "${config.mensagem_transferencia}".
- **Fora de Horário:** Se o cliente chamar fora de ${config.horario_atendente}, diga: "${config.mensagem_fora_horario_humano}".

# 7. GESTÃO DE OBJEÇÕES E PROIBIÇÕES (Módulos 10 e 11)
- **Contorno de Objeções:** Se o cliente apresentar resistência (ex: "tá caro"), responda: ${config.respostas_objecoes}.
- **REGRAS DE OURO (PROIBIDO):**
  - ${config.lista_proibicoes}.
  - Nunca invente preços ou prazos não listados.

# 8. INFORMAÇÕES ADICIONAIS E CAMPANHAS (Módulo 13)
- **Promoção Ativa:** ${config.campanha_atual}.
- **Políticas Importantes:** ${config.politicas_troca_garantia}.
    `.trim();
  };

  const renderCurrentStep = () => {
    switch (STEPS[currentStep].id) {
      case 'identidade':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Nome do Agente</label>
                <input
                  type="text"
                  value={config.nome_agente}
                  onChange={(e) => updateField('nome_agente', e.target.value)}
                  placeholder="Ex: Clara, Sofia, Consultor Atrion..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Nome da Empresa</label>
                <input
                  type="text"
                  value={config.nome_empresa}
                  onChange={(e) => updateField('nome_empresa', e.target.value)}
                  placeholder="Ex: Atrion Digital Solutions LTDA"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Tom de Voz</label>
                <select
                  value={config.tom_de_voz}
                  onChange={(e) => updateField('tom_de_voz', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all text-white"
                >
                  <option>Amigável e Acolhedor</option>
                  <option>Profissional e Executivo</option>
                  <option>Enérgico e Persuasivo</option>
                  <option>Empático e Paciente</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Formalidade</label>
                <select
                  value={config.formal_ou_informal}
                  onChange={(e) => updateField('formal_ou_informal', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all text-white"
                >
                  <option>Formal (Tratar por Sr/Sra)</option>
                  <option>Informal (Tratar por Você)</option>
                  <option>Híbrido (Equilibrado)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Uso de Emojis</label>
                <select
                  value={config.uso_emojis}
                  onChange={(e) => updateField('uso_emojis', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all text-white"
                >
                  <option>Nenhum (Apenas texto)</option>
                  <option>Moderado (Apenas no início/fim)</option>
                  <option>Frequente (Dinamismo visual)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Saudação Inicial (Apresentação)</label>
              <textarea
                value={config.apresentacao_escolhida}
                onChange={(e) => updateField('apresentacao_escolhida', e.target.value)}
                placeholder="Ex: Olá! Seja muito bem-vindo à Atrion. Eu sou a Clara, sua assistente virtual especialista em automação. Como posso transformar seu atendimento hoje?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
          </div>
        );

      case 'contexto':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">O que fazemos (Descrição da Empresa)</label>
              <textarea
                value={config.descricao_empresa}
                onChange={(e) => updateField('descricao_empresa', e.target.value)}
                placeholder="Ex: Somos uma agência de marketing focada em escala para infoprodutores, utilizando IA e funis de vendas de alta conversão para maximizar o ROI de nossos parceiros."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Diferenciais Competitivos</label>
              <textarea
                value={config.diferenciais_competitivos}
                onChange={(e) => updateField('diferenciais_competitivos', e.target.value)}
                placeholder="Ex: 1. Suporte prioritário 24/7; 2. Tecnologia proprietária de IA; 3. Mais de 10 milhões em vendas geradas para clientes no último ano."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Site Oficial</label>
                <input
                  type="text"
                  value={config.site}
                  onChange={(e) => updateField('site', e.target.value)}
                  placeholder="Ex: https://www.atriondigital.com.br"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Instagram / Redes Sociais</label>
                <input
                  type="text"
                  value={config.redes_sociais}
                  onChange={(e) => updateField('redes_sociais', e.target.value)}
                  placeholder="Ex: instagram.com/atrion.digital"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Horário de Funcionamento</label>
                <input
                  type="text"
                  value={config.horario_funcionamento}
                  onChange={(e) => updateField('horario_funcionamento', e.target.value)}
                  placeholder="Ex: Segunda a Sexta das 09:00 às 18:00, Sábados das 09:00 às 13:00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Atende Fins de Semana?</label>
                <select
                  value={config.atende_fds}
                  onChange={(e) => updateField('atende_fds', e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all text-white"
                >
                  <option>Sim, atendimento normal</option>
                  <option>Não, apenas dias úteis</option>
                  <option>Apenas Sábados (Meio período)</option>
                  <option>Plantão de Emergência</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'catalogo':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Lista de Produtos e Serviços</label>
              <div className="p-4 bg-[#4ADE80]/5 border border-[#4ADE80]/20 rounded-xl mb-4 text-xs text-[#4ADE80]">
                Sugestão: Seja específico com preços e entregáveis para que a IA possa fechar vendas.
              </div>
              <textarea
                value={config.lista_detalhada_produtos}
                onChange={(e) => updateField('lista_detalhada_produtos', e.target.value)}
                placeholder={"Ex:\n1. Mentoria Prime - R$ 2.997,00 - 4 encontros individuais + Suporte via WhatsApp.\n2. Curso de Automação - R$ 497,00 - Acesso vitalício a 50 aulas gravadas.\n3. Setup de IA Personalizado - Sob consulta - Implementação completa no seu negócio."}
                rows={12}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'qualificacao':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Perfil do Cliente Ideal (Avatar)</label>
              <textarea
                value={config.perfil_cliente_ideal}
                onChange={(e) => updateField('perfil_cliente_ideal', e.target.value)}
                placeholder="Ex: Empreendedores e infoprodutores que faturam acima de R$ 10k/mês e buscam automatizar seu suporte ou vendas para escalar sua operação sem aumentar a equipe."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Campos Obrigatórios para Coleta (Checklist)</label>
              <input
                type="text"
                value={config.campos_selecionados_checklist}
                onChange={(e) => updateField('campos_selecionados_checklist', e.target.value)}
                placeholder="Ex: Nome completo, E-mail, Qual o seu nicho de atuação e Faturamento médio mensal."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Pergunta Crucial para o Consultor</label>
              <textarea
                value={config.pergunta_especifica_negocio}
                onChange={(e) => updateField('pergunta_especifica_negocio', e.target.value)}
                placeholder="Ex: Antes de passar para o nosso consultor especializado, qual é hoje o seu maior desafio no atendimento ao cliente?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
          </div>
        );

      case 'vendas':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">FAQ (Perguntas e Respostas)</label>
              <textarea
                value={config.faq_perguntas_respostas}
                onChange={(e) => updateField('faq_perguntas_respostas', e.target.value)}
                placeholder={"P: Vocês oferecem teste grátis?\nR: Oferecemos uma demonstração personalizada ao vivo.\n\nP: Qual o tempo de implementação?\nR: Geralmente entre 7 a 15 dias úteis."}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Formas de Pagamento</label>
                <input
                  type="text"
                  value={config.formas_pagamento}
                  onChange={(e) => updateField('formas_pagamento', e.target.value)}
                  placeholder="Ex: Cartão de Crédito (até 12x), Pix ou Boleto à vista."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Condições Especiais</label>
                <input
                  type="text"
                  value={config.condicoes_especiais}
                  onChange={(e) => updateField('condicoes_especiais', e.target.value)}
                  placeholder="Ex: 10% de desconto para pagamentos via Pix ou 5% de desconto à vista no boleto."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Links de Materiais de Apoio</label>
              <textarea
                value={config.links_materiais}
                onChange={(e) => updateField('links_materiais', e.target.value)}
                placeholder="Ex: 1. Portfólio oficial: atrion.com/cases; 2. Vídeo explicativo: youtube.com/watch?v=..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
          </div>
        );

      case 'workflow':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Passo a Passo do Atendimento (Script)</label>
              <textarea
                value={config.passo_a_passo_atendimento}
                onChange={(e) => updateField('passo_a_passo_atendimento', e.target.value)}
                placeholder="Ex: 1. Saudação; 2. Identificação da necessidade; 3. Coleta de dados (Nome/Whats); 4. Envio de proposta; 5. Transferência para consultor."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Nome do Consultor Humano</label>
                <input
                  type="text"
                  value={config.nome_consultor}
                  onChange={(e) => updateField('nome_consultor', e.target.value)}
                  placeholder="Ex: Mateus Rocha"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">WhatsApp do Consultor</label>
                <input
                  type="text"
                  value={config.zap_consultor}
                  onChange={(e) => updateField('zap_consultor', e.target.value)}
                  placeholder="Ex: 5511999999999"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Quando Transferir (Situações Gatilho)</label>
              <textarea
                value={config.situacoes_transbordo}
                onChange={(e) => updateField('situacoes_transbordo', e.target.value)}
                placeholder="Ex: Quando o cliente solicitar orçamento personalizado, tiver dúvidas técnicas profundas ou fornecer todos os dados de qualificação."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Mensagem de Transferência (Aviso)</label>
              <input
                type="text"
                value={config.mensagem_transferencia}
                onChange={(e) => updateField('mensagem_transferencia', e.target.value)}
                placeholder="Ex: Perfeito! Já anotei seus dados. Vou te transferir agora para o Mateus, nosso consultor sênior, para finalizar sua proposta."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all"
              />
            </div>
          </div>
        );

      case 'objecoes':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Respostas para Objeções Comuns</label>
              <textarea
                value={config.respostas_objecoes}
                onChange={(e) => updateField('respostas_objecoes', e.target.value)}
                placeholder="Ex: Se o cliente disser que 'está caro', responda enfatizando que o custo da automação é revertido em economia de tempo e aumento de 30% nas vendas."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Lista de Proibições (REGRAS DE OURO)</label>
              <textarea
                value={config.lista_proibicoes}
                onChange={(e) => updateField('lista_proibicoes', e.target.value)}
                placeholder="Ex: 1. Nunca falar de concorrentes; 2. Não prometer suporte por telefone; 3. Nunca oferecer descontos acima de 15% sem autorização."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'campanhas':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Campanha / Promoção Atual</label>
              <textarea
                value={config.campanha_atual}
                onChange={(e) => updateField('campanha_atual', e.target.value)}
                placeholder="Ex: Utilize o cupom NOVOATRI24 para ganhar instalação gratuita + 20% de desconto na primeira mensalidade do plano Business."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Políticas de Troca e Garantia</label>
              <textarea
                value={config.politicas_troca_garantia}
                onChange={(e) => updateField('politicas_troca_garantia', e.target.value)}
                placeholder="Ex: Garantia incondicional de 7 dias para cancelamento com reembolso total. Após esse período, o cancelamento é livre sem multa, apenas perdendo acesso ao suporte."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4ADE80] outline-none transition-all resize-none"
              />
            </div>
          </div>
        );

      case 'teste':
        return (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 p-4 bg-[#4ADE80]/5 border border-[#4ADE80]/20 rounded-xl">
              <div className="flex items-center gap-2 text-[#4ADE80] font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Instrução Gerada (Preview)</span>
              </div>
              <div className="max-h-40 overflow-y-auto custom-scrollbar text-xs text-white/40 font-mono whitespace-pre-wrap">
                {generatePrompt()}
              </div>
            </div>
            <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4ADE80] flex items-center justify-center text-black">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{config.nome_agente || 'Agente'}</span>
                </div>
                <div className="text-[10px] text-[#4ADE80] uppercase tracking-wider font-bold bg-[#4ADE80]/10 px-2 py-1 rounded-full">
                  Homologação Ativa
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p>Inicie uma conversa para testar <br />as novas diretrizes do agente.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                      <div className={cn(
                        "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                        msg.role === 'user' ? "bg-[#4ADE80] text-black" : "bg-white/5 text-white"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite sua mensagem de teste..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-[#4ADE80]"
                  />
                  <button className="p-2 bg-[#4ADE80] text-black rounded-xl hover:scale-105 transition-transform">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4ADE80] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-8">
      {/* Dynamic Sidebar Stepper */}
      <aside className="w-72 flex flex-col gap-2">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-1">Configuração do Agente</h3>
          <p className="text-xs text-white/40">Siga as seções para treinar sua IA.</p>
        </div>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 text-left relative overflow-hidden",
                currentStep === index
                  ? "bg-[#4ADE80] text-black shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                currentStep === index ? "bg-black/10" : "bg-white/5"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{step.title}</p>
                {step.modules && (
                  <p className={cn(
                    "text-[10px] uppercase tracking-wider opacity-60",
                    currentStep === index ? "text-black" : "text-[#4ADE80]"
                  )}>
                    Módulos {step.modules.join(', ')}
                  </p>
                )}
              </div>
              <div className={cn(
                "absolute right-2 transition-transform",
                currentStep === index ? "translate-x-0" : "translate-x-8"
              )}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Progresso</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col bg-black/20 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#4ADE80]/10 rounded-2xl flex items-center justify-center">
              {React.createElement(STEPS[currentStep].icon, { className: "w-6 h-6 text-[#4ADE80]" })}
            </div>
            <div>
              <h4 className="text-lg font-bold">{STEPS[currentStep].title}</h4>
              <p className="text-sm text-white/40">Preencha os dados abaixo com precisão.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="text-[#4ADE80] font-bold">{currentStep + 1}</span>
              <span>/</span>
              <span>{STEPS.length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {renderCurrentStep()}
        </div>

        <footer className="px-8 py-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white disabled:opacity-0 transition-all font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <button
            onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
            className="flex items-center gap-2 px-8 py-3 bg-[#4ADE80] text-black font-bold rounded-2xl hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all"
          >
            {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Próxima Etapa'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      </main>
    </div>
  );
}