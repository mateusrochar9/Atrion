import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  MapPin, 
  Instagram, 
  Linkedin, 
  Play, 
  Download, 
  Plus, 
  Loader2, 
  CheckCircle2,
  ExternalLink,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SOURCES = [
  { id: 'gmaps', name: 'Google Maps', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'insta', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-600/10' },
  { id: 'web', name: 'Web Scraper', icon: Globe, color: 'text-[#4ADE80]', bg: 'bg-[#4ADE80]/10' },
];

interface ScrapedData {
  id: string;
  name: string;
  category: string;
  phone: string;
  website: string;
  rating?: number;
  status: 'pending' | 'extracted';
}

export default function ExtractorView() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [url, setUrl] = useState('');
  const [selectedSource, setSelectedSource] = useState('gmaps');
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ScrapedData[]>([]);
  const [progress, setProgress] = useState(0);

  const handleStartExtraction = () => {
    const hasQuery = niche.trim() && city.trim();
    const hasUrl = url.trim();
    
    if (selectedSource === 'gmaps' && !hasQuery && !hasUrl) return;
    if (selectedSource !== 'gmaps' && !hasUrl) return;
    
    setIsExtracting(true);
    setResults([]);
    setProgress(0);

    // Simulate extraction process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIsExtracting(false);
        
        // Mock results
        setResults([
          { id: '1', name: 'Restaurante Sabor Real', category: 'Restaurante', phone: '+55 11 98888-1111', website: 'saborreal.com.br', rating: 4.8, status: 'extracted' },
          { id: '2', name: 'Tech Solutions Ltda', category: 'Tecnologia', phone: '+55 11 97777-2222', website: 'techsolutions.io', rating: 4.5, status: 'extracted' },
          { id: '3', name: 'Academia FitLife', category: 'Saúde', phone: '+55 11 96666-3333', website: 'fitlife.com', rating: 4.2, status: 'extracted' },
          { id: '4', name: 'Clínica Sorriso', category: 'Odontologia', phone: '+55 11 95555-4444', website: 'sorriso.med.br', rating: 4.9, status: 'extracted' },
          { id: '5', name: 'Padaria Central', category: 'Alimentação', phone: '+55 11 94444-5555', website: 'padariacentral.com', rating: 4.0, status: 'extracted' },
        ]);
      }
      setProgress(currentProgress);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div>
              <h3 className="text-2xl font-bold mb-2">Extrator de Dados IA</h3>
              <p className="text-white/40 text-sm">Extraia leads qualificados automaticamente de qualquer fonte na web.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                    selectedSource === source.id 
                      ? "bg-white/10 border-[#4ADE80] shadow-[0_0_20px_rgba(74,222,128,0.1)]" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn("p-3 rounded-xl", source.bg)}>
                    <source.icon className={cn("w-6 h-6", source.color)} />
                  </div>
                  <span className="text-xs font-medium">{source.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {selectedSource === 'gmaps' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-col sm:flex-row gap-4 overflow-hidden"
                >
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-white/20 group-focus-within:text-[#4ADE80] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="O que pretende pesquisar? (Ex: Dentistas)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 transition-all"
                    />
                  </div>
                  
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <MapPin className="w-5 h-5 text-white/20 group-focus-within:text-[#4ADE80] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Qual cidade? (Ex: São Paulo)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Globe className="w-5 h-5 text-white/20 group-focus-within:text-[#4ADE80] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={selectedSource === 'gmaps' ? "Ou cole um link direto do Google Maps..." : "Cole o link da fonte (URL) para extração..."}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 transition-all"
                  />
                </div>

                <button
                  onClick={handleStartExtraction}
                  disabled={isExtracting || (selectedSource === 'gmaps' ? (!niche.trim() || !city.trim()) && !url.trim() : !url.trim())}
                  className="bg-[#4ADE80] text-black px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 min-w-[140px]"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extraindo...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Iniciar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Status da Tarefa</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span>Progresso</span>
                  <span className="text-[#4ADE80]">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#4ADE80]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <Database className="w-3 h-3" />
                  <span>{results.length} registros encontrados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-4">
              <h3 className="font-bold flex items-center gap-2">
                Resultados da Extração
                <span className="text-xs font-normal text-white/40">({results.length} itens)</span>
              </h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4ADE80] text-black rounded-xl text-xs font-bold hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                  Importar para Leads
                </button>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Empresa / Nome</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Website</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">
                            {item.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={cn("text-[8px]", i < (item.rating || 0) ? "text-yellow-500" : "text-white/10")}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-white/60">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-[#4ADE80]">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`https://${item.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-white/40 hover:text-[#4ADE80] transition-colors">
                          {item.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <Plus className="w-4 h-4 text-white/40 hover:text-[#4ADE80]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isExtracting && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <Database className="w-10 h-10 text-white/10" />
          </div>
          <div className="max-w-sm">
            <h4 className="font-bold text-lg">Nenhuma extração ativa</h4>
            <p className="text-sm text-white/40">
              {selectedSource === 'gmaps' 
                ? "Preencha o nicho e a cidade ou cole um link direto do Maps para começar." 
                : "Cole o link da fonte (URL) acima para começar a minerar dados."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
