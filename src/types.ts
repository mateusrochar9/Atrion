export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Novo' | 'Em Contato' | 'Qualificado' | 'Fechado' | 'Perdido';
  value: number;
  lastContact: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'customer';
  text: string;
  timestamp: string;
}

export interface AgentConfig {
  // 1. Identidade e Persona
  nome_agente: string;
  nome_empresa: string;
  tom_de_voz: string;
  formal_ou_informal: string;
  uso_emojis: string;
  apresentacao_escolhida: string;

  // 2. Contexto do Negócio
  descricao_empresa: string;
  diferenciais_competitivos: string;
  site: string;
  redes_sociais: string;
  horario_funcionamento: string;
  atende_fds: string;

  // 3. Catálogo de Produtos e Serviços
  lista_detalhada_produtos: string;

  // 4. Qualificação e Coleta de Dados
  perfil_cliente_ideal: string;
  campos_selecionados_checklist: string;
  pergunta_especifica_negocio: string;

  // 5. Diretrizes de Vendas e FAQ
  faq_perguntas_respostas: string;
  formas_pagamento: string;
  condicoes_especiais: string;
  links_materiais: string;

  // 6. Fluxo de Trabalho e Transbordo
  passo_a_passo_atendimento: string;
  nome_consultor: string;
  zap_consultor: string;
  situacoes_transbordo: string;
  mensagem_transferencia: string;
  horario_atendente: string;
  mensagem_fora_horario_humano: string;

  // 7. Gestão de Objeções e Proibições
  respostas_objecoes: string;
  lista_proibicoes: string;

  // 8. Informações Adicionais e Campanhas
  campanha_atual: string;
  politicas_troca_garantia: string;

  // Configurações de Canal (Extras)
  whatsapp_api_key?: string;
  webchat_enabled?: boolean;
}

export type Tab = 'agente' | 'whatsapp' | 'dashboard' | 'leads' | 'kanban' | 'funil' | 'extrator' | 'configuracoes';
