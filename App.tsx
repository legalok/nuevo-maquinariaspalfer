import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import ChatWidget from './components/ChatWidget';
import { useI18n } from './i18n';
import { 
  Coffee, 
  Settings, 
  Zap, 
  ChevronRight, 
  Menu, 
  X, 
  Droplet, 
  Wind,
  ShieldCheck,
  Globe,
  ArrowRight,
  ChevronDown,
  Trash2,
  Plus,
  Save,
  LogIn,
  LogOut,
  Upload,
  Edit2,
  Check,
  Eye,
  Loader2
} from 'lucide-react';

// --- TYPES ---
interface Category {
  id: string;
  name: string;
  description: string;
  features: string[];
  videos: string[];
}

interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  categories: Category[];
}

const DEFAULT_CONFIG: SiteConfig = {
  siteTitle: 'MAQUINARIAS',
  siteSubtitle: 'PalFer',
  heroTitle: 'INGENIERIA QUE POTENCIA EL SABOR DEL CAFÉ',
  heroSubtitle: 'Diseñamos y fabricamos maquinaria industrial de alta precisión para el procesamiento de café de especialidad.',
  categories: [
    {
      id: 'tostadoras',
      name: 'Tostadoras Tecnificadas',
      description: 'Control preciso de curvas de tueste con tecnología de flujo de aire térmico de última generación.',
      features: ['Eficiencia Térmica 98%', 'Control Digital PID', 'Capacidad 5-12kg'],
      videos: ['/tostadora001.mp4', '/tostadora002.mp4']
    },
    {
      id: 'trilladoras',
      name: 'Trilladoras de Café',
      description: 'Procesamiento de alta velocidad conservando la integridad física del grano para exportación.',
      features: ['120-400 kg/h', 'Baja Emisión de Polvo', 'Separador Densimétrico'],
      videos: ['/Trilladoraparacafe.mp4', '/trilla_piladora.mp4']
    },
    {
      id: 'zarandas',
      name: 'Selector de Café',
      description: 'Zarandas de alta precisión para selección por tamaño y densidad de grano pergamino y almendra.',
      features: ['Vibración Controlada', 'Acero AISI 304', 'Múltiples Niveles'],
      videos: ['/Seleccionadora.mp4', '/selector_1.mp4']
    },
    {
      id: 'molinos',
      name: 'Molinos Industriales',
      description: 'Molienda uniforme con refrigeración activa para preservar aceites y aromas delicados.',
      features: ['Cuchillas Especiales', 'Micrometría Digital', 'Bajo Calentamiento'],
      videos: ['/Molino.mp4', '/molino_cafe.mp4']
    }
  ]
};

// --- ADMIN COMPONENTS ---
const FileUpload = ({ onUploadSuccess, label = 'Subir Archivo' }: { onUploadSuccess: (filename: string) => void, label?: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.filename) {
        onUploadSuccess(data.filename);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const id = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative group">
      <input 
        type="file" 
        onChange={handleUpload} 
        className="hidden" 
        id={id} 
        disabled={uploading}
        accept="video/*,image/*"
      />
      <label 
        htmlFor={id}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl cursor-pointer transition-all ${
          uploading ? 'bg-zinc-800 text-zinc-500' : 'bg-gold-accent text-coffee-black hover:scale-105 shadow-lg shadow-gold-accent/10'
        }`}
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
          {uploading ? 'Subiendo...' : label}
        </span>
      </label>
    </div>
  );
};

const AdminDashboard = ({ 
  config, 
  setConfig, 
  onSave, 
  onLogout,
  onPreviewToggle,
  adminPassword
}: { 
  config: SiteConfig, 
  setConfig: (c: SiteConfig) => void, 
  onSave: () => void,
  onLogout: () => void,
  onPreviewToggle: () => void,
  adminPassword: string
}) => {
  const [availableMedia, setAvailableMedia] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'leads'>('content');
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    fetch('/api/media').then(res => res.json()).then(setAvailableMedia);
  }, []);

  const fetchLeads = React.useCallback(async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch('/api/leads', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (_) {
      // ignore
    } finally {
      setLoadingLeads(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    if (activeTab === 'leads') fetchLeads();
  }, [activeTab, fetchLeads]);

  const deleteLead = async (id: string) => {
    if (!confirm('¿Eliminar este lead?')) return;
    const res = await fetch(`/api/leads/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': adminPassword },
    });
    if (res.ok) setLeads(prev => prev.filter(l => l.id !== id));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setConfig({
      ...config,
      categories: config.categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col font-sans overflow-hidden">
      {/* Admin Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full border border-gold-accent/30 flex items-center justify-center bg-zinc-800">
             <Settings className="text-gold-accent" size={20} />
          </div>
          <div>
            <h2 className="text-white font-black text-xs uppercase tracking-[0.2em]">Panel de Administración</h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Configuración del Sitio Web</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onPreviewToggle}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-all group"
          >
            <Eye size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Vista Previa</span>
          </button>
          <button 
            onClick={onSave}
            className="flex items-center space-x-2 px-6 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full hover:bg-green-500/20 transition-all group"
          >
            <Save size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Guardar Cambios</span>
          </button>
          <button 
            onClick={onLogout}
            className="p-2.5 text-zinc-500 hover:text-white transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 border-r border-white/5 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 ${
              activeTab === 'content' ? 'bg-gold-accent text-coffee-black shadow-lg shadow-gold-accent/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit2 size={16} />
            <span>Contenido & Textos</span>
          </button>
          <button 
            onClick={() => setActiveTab('media')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 ${
              activeTab === 'media' ? 'bg-gold-accent text-coffee-black shadow-lg shadow-gold-accent/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload size={16} />
            <span>Galería de Medios</span>
          </button>
          <button 
            data-testid="admin-leads-tab"
            onClick={() => setActiveTab('leads')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 relative ${
              activeTab === 'leads' ? 'bg-gold-accent text-coffee-black shadow-lg shadow-gold-accent/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={16} />
            <span className="flex-1">Listos para comprar</span>
            {leads.length > 0 && activeTab !== 'leads' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold-accent text-coffee-black rounded-full text-[9px] px-2 py-0.5 font-black">
                {leads.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar bg-zinc-950">
          {activeTab === 'content' && (
             <div className="max-w-4xl space-y-16">
               {/* Hero Config */}
               <section>
                 <h3 className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] mb-8 flex items-center">
                   <div className="w-8 h-[1px] bg-zinc-800 mr-4" /> SECCIÓN HERO
                 </h3>
                 <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Título Principal</label>
                     <input 
                       className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-display text-lg focus:outline-none focus:border-gold-accent/50 transition-colors"
                       value={config.heroTitle}
                       onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Subtítulo</label>
                     <textarea 
                       className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-light text-base focus:outline-none focus:border-gold-accent/50 transition-colors min-h-[100px]"
                       value={config.heroSubtitle}
                       onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                     />
                   </div>
                 </div>
               </section>

               {/* Categories Config */}
               <section className="space-y-12">
                 <h3 className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] mb-8 flex items-center">
                   <div className="w-8 h-[1px] bg-zinc-800 mr-4" /> CATEGORÍAS DE MAQUINARIA
                 </h3>
                 
                 {config.categories.map((cat, idx) => (
                   <div key={cat.id} className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-8 group transition-all hover:bg-zinc-900/50">
                     <div className="flex items-center justify-between">
                       <input 
                         className="bg-transparent text-white font-display text-2xl font-black tracking-tight focus:outline-none"
                         value={cat.name}
                         onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                       />
                       <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">ID: {cat.id}</span>
                     </div>
                     
                     <textarea 
                       className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-zinc-300 font-light text-sm focus:outline-none focus:border-gold-accent/50 transition-colors"
                       value={cat.description}
                       onChange={(e) => updateCategory(cat.id, { description: e.target.value })}
                     />

                     <div className="space-y-4">
                       <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Gestión de Videos</label>
                       <div className="flex flex-wrap gap-3">
                         {cat.videos.map((vid, vIdx) => (
                           <div key={vIdx} className="flex items-center space-x-2 px-3 py-2 bg-zinc-800 rounded-lg border border-white/5">
                             <span className="text-[10px] text-zinc-400 font-mono">{vid}</span>
                             <button 
                               onClick={() => updateCategory(cat.id, { videos: cat.videos.filter((_, i) => i !== vIdx) })}
                               className="text-zinc-600 hover:text-red-400 transition-colors"
                             >
                               <Trash2 size={12} />
                             </button>
                           </div>
                         ))}
                         <div className="flex items-center space-x-2">
                           <select 
                             className="px-3 py-2 bg-zinc-800 text-gold-accent border border-white/5 rounded-xl text-[10px] font-black uppercase focus:outline-none h-[38px] min-w-[120px]"
                             onChange={(e) => {
                               if (e.target.value) {
                                 updateCategory(cat.id, { videos: [...cat.videos, e.target.value] });
                               }
                             }}
                             value=""
                           >
                             <option value="">+ Existente</option>
                             {availableMedia.filter(m => m.endsWith('.mp4')).map(m => (
                               <option key={m} value={m}>{m}</option>
                             ))}
                           </select>
                           <FileUpload 
                             label="Subir Nuevo"
                             onUploadSuccess={(filename) => {
                               setAvailableMedia(prev => [filename, ...prev]);
                               updateCategory(cat.id, { videos: [...cat.videos, filename] });
                             }} 
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </section>
             </div>
          )}

          {activeTab === 'media' && (
             <div className="space-y-12">
               <div className="flex items-center justify-between pb-8 border-b border-white/5">
                 <div>
                   <h3 className="text-white text-3xl font-black tracking-tight">Galería de Medios</h3>
                   <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Archivos en la carpeta /public</p>
                 </div>
                 <FileUpload onUploadSuccess={(f) => setAvailableMedia([f, ...availableMedia])} />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {availableMedia.map((file) => (
                   <div key={file} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center">
                     {file.endsWith('.mp4') ? (
                        <div className="flex flex-col items-center space-y-2">
                           <Coffee className="text-zinc-700" size={32} />
                           <span className="text-[8px] text-zinc-500 font-mono uppercase truncate max-w-[80px]">{file}</span>
                        </div>
                     ) : (
                        <img src={`/${file}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                     )}
                     
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-4">
                       <span className="text-[8px] text-white font-mono uppercase px-2 text-center break-all">{file}</span>
                       <button 
                         onClick={async () => {
                           if (confirm('Eliminar archivo?')) {
                             await fetch(`/api/media/${file}`, { method: 'DELETE' });
                             setAvailableMedia(availableMedia.filter(m => m !== file));
                           }
                         }}
                         className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-8" data-testid="admin-leads-panel">
              <div className="flex items-center justify-between pb-8 border-b border-white/5">
                <div>
                  <h3 className="text-white text-3xl font-black tracking-tight uppercase">Personas listas para comprar</h3>
                  <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">
                    {leads.length} {leads.length === 1 ? 'lead recibido' : 'leads recibidos'}
                  </p>
                </div>
                <button
                  onClick={fetchLeads}
                  disabled={loadingLeads}
                  className="px-4 py-2 bg-gold-accent/10 text-gold-accent border border-gold-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-accent/20 transition-all"
                >
                  {loadingLeads ? 'Cargando…' : 'Actualizar'}
                </button>
              </div>

              {leads.length === 0 && !loadingLeads && (
                <div className="rounded-2xl border-2 border-dashed border-white/10 p-16 text-center text-zinc-500">
                  <ShieldCheck className="mx-auto mb-4 text-zinc-700" size={40} />
                  <p className="text-[12px] uppercase tracking-widest">
                    Todavía no hay leads. Cuando un visitante use el botón "Listo para comprar" aparecerá aquí.
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                {leads.map(lead => (
                  <div key={lead.id} className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6 hover:border-gold-accent/30 transition-colors group">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-white text-lg font-black tracking-tight">{lead.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gold-accent font-mono uppercase tracking-widest">
                            {new Date(lead.created_at).toLocaleString()}
                          </span>
                          {lead.lang && (
                            <span className="text-[9px] uppercase font-bold text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">
                              {lead.lang}
                            </span>
                          )}
                          {lead.country && (
                            <span className="text-[9px] uppercase font-bold text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">
                              {lead.country}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola ' + lead.name + ', soy del equipo de Maquinarias PalFer. Recibimos tu solicitud y queremos ayudarte con tu compra.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
                          data-testid={`lead-whatsapp-${lead.id}`}
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                        >
                          Email
                        </a>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 rounded-full text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Eliminar lead"
                          data-testid={`lead-delete-${lead.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <Detail label="Teléfono" value={lead.phone} />
                      <Detail label="Correo" value={lead.email} />
                      <Detail label="Dirección" value={lead.address} />
                      {lead.note && <Detail label="Nota" value={lead.note} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">{label}</div>
    <div className="text-zinc-200 text-sm break-words">{value}</div>
  </div>
);

const LANGUAGES = [
  { code: 'ES', label: 'Español', flag: '🇨🇴', name: 'Colombia', lang: 'es' },
  { code: 'EN', label: 'English', flag: '🇺🇸', name: 'USA', lang: 'en' },
  { code: 'BR', label: 'Português', flag: '🇧🇷', name: 'Brasil', lang: 'pt' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪', name: 'Germany', lang: 'de' },
  { code: 'FR', label: 'Français', flag: '🇫🇷', name: 'France', lang: 'fr' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹', name: 'Italy', lang: 'it' },
  { code: 'JP', label: '日本語', flag: '🇯🇵', name: 'Japan', lang: 'ja' },
  { code: 'CN', label: '中文', flag: '🇨🇳', name: 'China', lang: 'zh' },
  { code: 'MX', label: 'Español', flag: '🇲🇽', name: 'México', lang: 'es' },
  { code: 'UK', label: 'English', flag: '🇬🇧', name: 'United Kingdom', lang: 'en' },
  { code: 'AE', label: 'العربية', flag: '🇦🇪', name: 'UAE', lang: 'ar' },
  { code: 'KR', label: '한국어', flag: '🇰🇷', name: 'South Korea', lang: 'ko' },
  { code: 'VN', label: 'Tiếng Việt', flag: '🇻🇳', name: 'Vietnam', lang: 'vi' },
  { code: 'ET', label: 'አማርኛ', flag: '🇪🇹', name: 'Ethiopia', lang: 'am' },
  { code: 'CA', label: 'English', flag: '🇨🇦', name: 'Canada', lang: 'en' },
  { code: 'ES2', label: 'Español', flag: '🇪🇸', name: 'España', lang: 'es' },
  { code: 'CH', label: 'Deutsch', flag: '🇨🇭', name: 'Switzerland', lang: 'de' },
  { code: 'PT', label: 'Português', flag: '🇵🇹', name: 'Portugal', lang: 'pt' },
  { code: 'RU', label: 'Русский', flag: '🇷🇺', name: 'Russia', lang: 'ru' },
  { code: 'TR', label: 'Türkçe', flag: '🇹🇷', name: 'Türkiye', lang: 'tr' },
];

const LanguageSelector = ({ scrolled, compact = false }: { scrolled: boolean, compact?: boolean }) => {
  const { lang, setLang, t, detectedLang, isManualOverride, resetToAutoDetected, langLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  // Pick the LANGUAGES entry that matches current lang code; default to first matching
  const selected = LANGUAGES.find(l => l.lang === lang) || LANGUAGES[0];

  return (
    <div className="relative">
      <button 
        data-testid="lang-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${compact ? 'space-x-1.5 px-3 py-2' : 'space-x-3 px-5 py-2.5'} rounded-full border transition-all duration-300 group ${
          scrolled 
            ? 'border-gray-200 hover:border-gold-accent text-gray-700 bg-white shadow-sm' 
            : 'border-white/20 hover:border-white/50 text-white bg-black/20 backdrop-blur-md'
        }`}
        aria-label={t('lang.label')}
      >
        <span className={`${compact ? 'text-base' : 'text-lg'} group-hover:scale-110 transition-transform`}>{selected.flag}</span>
        {!compact && (
          <div className="flex flex-col items-start leading-none">
            <span className="text-[11px] font-black tracking-[0.15em] uppercase opacity-70 mb-1">{t('lang.label')}</span>
            <span className="text-[15px] font-black tracking-widest uppercase">{selected.code.replace(/\d+$/, '')}</span>
          </div>
        )}
        {compact && (
          <span className="text-[11px] font-black tracking-widest uppercase">{selected.code.replace(/\d+$/, '')}</span>
        )}
        {langLoading ? (
          <Loader2 size={compact ? 12 : 14} className="animate-spin" />
        ) : (
          <ChevronDown size={compact ? 12 : 14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-64 max-h-[400px] bg-white/98 backdrop-blur-2xl border border-black/5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-50 p-2"
            >
              <div className="overflow-y-auto max-h-[340px] custom-scrollbar pr-1">
                {isManualOverride && (
                  <div className="px-4 py-2 mb-1 rounded-2xl bg-gold-accent/10 border border-gold-accent/20 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-accent mt-2 animate-pulse" />
                    <p className="text-[10px] leading-snug text-coffee-black/80 font-medium">
                      {t('lang.manual_active')}
                    </p>
                  </div>
                )}
                {LANGUAGES.map((langItem, idx) => {
                  const isActive = selected.code === langItem.code && selected.name === langItem.name;
                  const isAuto = !isManualOverride && detectedLang && langItem.lang === detectedLang && idx === LANGUAGES.findIndex(l => l.lang === detectedLang);
                  return (
                    <button
                      key={`${langItem.code}-${idx}`}
                      data-testid={`lang-option-${langItem.code}`}
                      onClick={() => {
                        setLang(langItem.lang);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3.5 hover:bg-gold-accent/10 rounded-2xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{langItem.flag}</span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-black uppercase tracking-widest text-coffee-black group-hover:text-gold-accent transition-colors truncate">{langItem.label}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter group-hover:text-gray-600 transition-colors truncate">{langItem.name}</span>
                      </div>
                      {isAuto && (
                        <span
                          className="text-[8px] font-black uppercase tracking-widest text-coffee-black bg-coffee-yellow/80 px-1.5 py-0.5 rounded shrink-0"
                          title="Auto-detectado por tu ubicación"
                        >
                          {t('lang.auto')}
                        </span>
                      )}
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-gold-accent shadow-[0_0_8px_rgba(234,179,8,1)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isManualOverride && detectedLang && (
                <button
                  data-testid="lang-reset-auto"
                  onClick={() => {
                    resetToAutoDetected();
                    setIsOpen(false);
                  }}
                  className="w-full mt-1 px-4 py-2.5 rounded-2xl border border-coffee-yellow/30 hover:bg-coffee-yellow/10 transition-all text-[10px] font-black uppercase tracking-widest text-gray-700 hover:text-coffee-black flex items-center justify-center gap-2"
                >
                  <span className="text-base">{LANGUAGES.find(l => l.lang === detectedLang)?.flag || '🌐'}</span>
                  <span>{t('lang.reset_auto')}</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


// Componente para manejar la carga de medios (videos o imágenes) con robustez.
// Estrategia "instant-play":
//   1. El poster .jpg (primer frame) se muestra al instante mientras llega el video.
//   2. IntersectionObserver: el <source> del video se monta sólo cuando el bloque
//      está cerca del viewport, evitando que 8 videos compitan por ancho de banda
//      al abrir la página.
//   3. Los videos en el servidor usan +faststart (moov al inicio) para empezar a
//      reproducir tan pronto lleguen los primeros bytes.
const MediaPlayer = ({ src, categoryId, index }: { src: string, categoryId: string, index: number }) => {
  const { t } = useI18n();
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const normalizedSrc = src.replace(/^public\//i, '');
  const mediaPath = normalizedSrc.startsWith('/') ? normalizedSrc : `/${normalizedSrc}`;
  const encodedPath = encodeURI(mediaPath);

  const isImage = /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(normalizedSrc);
  const posterPath = !isImage ? encodedPath.replace(/\.[^/.]+$/i, ".jpg") : undefined;

  // Lazy-mount the video when the card enters (or is near) the viewport
  useEffect(() => {
    if (isImage) { setInView(true); return; }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: '600px 0px' } // start fetching ~600px before it appears
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isImage]);

  const handleVideoError = (e: any) => {
    const err = e.target?.error;
    console.error(`Error de video [${normalizedSrc}]:`, err?.code);
    setError(true);
  };

  return (
    <div ref={containerRef} className="w-full text-left group">
      <div
        className="relative overflow-hidden aspect-[16/10] shadow-2xl bg-zinc-900 rounded-3xl border border-white/5"
        style={!isImage && posterPath ? {
          backgroundImage: `url(${posterPath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {isImage ? (
          <img
            src={encodedPath}
            alt={`Maquinaria ${normalizedSrc}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        ) : inView ? (
          <video
            key={`${categoryId}-${index}-${normalizedSrc}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterPath}
            src={encodedPath}
            onLoadedData={() => setReady(true)}
            onPlaying={() => setReady(true)}
            onError={handleVideoError}
          >
            Tu navegador no soporta el elemento de video.
          </video>
        ) : null}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center z-20 border-2 border-dashed border-zinc-800">
            <Settings className="text-zinc-800 mb-3 animate-pulse" size={24} />
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest leading-relaxed">
              {t('media.error_title')}<br/>
              <span className="text-coffee-yellow/80 font-bold">"{normalizedSrc}"</span>
            </span>
            <p className="mt-2 text-[8px] text-zinc-600 max-w-[200px]">
              {t('media.error_help')}
            </p>
            <button
              onClick={() => { setError(false); setReady(false); setInView(true); }}
              className="mt-4 px-4 py-1.5 bg-zinc-900 text-zinc-400 text-[9px] rounded-full hover:bg-zinc-800 transition-all border border-white/5"
            >
              {t('media.retry')}
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
          <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-medium">{t('category.media_status')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureSlider = ({ features }: { features: string[] }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // We double the features to create a seamless loop
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="w-full relative overflow-hidden py-4" ref={containerRef}>
      <motion.div 
        className="flex space-x-5 md:space-x-8 w-max"
        animate={{
          x: [0, "-50%"]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30, // Adjust speed here
            ease: "linear",
          },
        }}
      >
        {duplicatedFeatures.map((f, i) => (
          <div
            key={`${f}-${i}`}
            className="flex-shrink-0 w-[260px] md:w-[380px] flex items-center p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-white border-2 border-coffee-yellow/10 hover:border-coffee-yellow/50 transition-all shadow-sm group select-none"
          >
            <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-coffee-yellow rounded-full mr-5 md:mr-10 shadow-[0_0_12px_rgba(234,179,8,0.8)] group-hover:scale-125 transition-transform flex-shrink-0" />
            <span className="text-gray-600 font-medium text-base md:text-xl tracking-wide leading-tight">{f}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const TrustSlider = ({ items }: { items: any[] }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Double the items for infinite loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className="w-full relative overflow-hidden" ref={containerRef}>
      <motion.div 
        className="flex space-x-12 md:space-x-32 w-max pr-32"
        animate={{
          x: [0, "-50%"]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40, // Adjust speed here
            ease: "linear",
          },
        }}
      >
        {duplicatedItems.map((feature, i) => (
          <div 
            key={i} 
            className="w-[280px] md:w-[480px] space-y-8 md:space-y-12 text-center md:text-left select-none group"
          >
             <div className="text-coffee-yellow flex justify-center md:justify-start">
               <div className="p-5 md:p-8 rounded-full bg-coffee-yellow/5 border border-coffee-yellow/20 shadow-xl shadow-coffee-yellow/5 group-hover:scale-110 transition-transform duration-500">
                 <feature.icon className="w-12 h-12 md:w-20 md:h-20" strokeWidth={1.2} />
               </div>
             </div>
             <div className="space-y-4 md:space-y-6">
                <h4 className="text-xl md:text-3xl font-display font-black text-coffee-black tracking-tighter">{feature.title}</h4>
                <p className="text-gray-800 text-base md:text-2xl font-light leading-relaxed opacity-80">{feature.text}</p>
             </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function App() {
  const { t, lang, config: i18nConfig, setLang } = useI18n();
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Fetch initial config (Spanish source of truth, used by Admin editor)
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setConfig(data);
      })
      .catch(err => console.error('Failed to load config:', err))
      .finally(() => setLoadingConfig(false));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Public-facing config: prefer local config (DEFAULT_CONFIG) which has all 4 categories.
  // Only use i18nConfig if it has more or equal categories than local config.
  const displayConfig = (i18nConfig as SiteConfig | null)?.categories?.length >= config.categories.length 
    ? (i18nConfig as SiteConfig) 
    : config;

  const handleSave = async () => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('Configuration saved successfully!');
        // Refresh i18n so the new content is re-translated for the current language
        setLang(lang);
      }
    } catch (err) {
      alert('Error saving configuration.');
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin && !isPreview) {
    return (
      <AdminDashboard 
        config={config} 
        setConfig={setConfig} 
        onSave={handleSave} 
        onLogout={() => setIsAdmin(false)} 
        onPreviewToggle={() => setIsPreview(true)}
        adminPassword={password}
      />
    );
  }

  return (
    <div className="min-h-screen bg-parchment text-coffee-black selection:bg-coffee-yellow selection:text-white bg-gradient-to-br from-parchment via-coffee-cream to-parchment/30">
      {/* Top Admin Bar during Preview */}
      {isAdmin && isPreview && (
        <div className="fixed top-0 inset-x-0 z-[200] bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Modo Vista Previa</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsPreview(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
            >
              <Edit2 size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Volver a Editar</span>
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/40 transition-all"
            >
              <Save size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Guardar Cambios</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`glass-nav ${scrolled ? 'py-4 bg-white/95 shadow-lg' : 'py-4 md:py-6 bg-transparent border-transparent'}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div 
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 ${scrolled ? 'border-coffee-yellow' : 'border-coffee-yellow/40'} bg-white flex items-center justify-center overflow-hidden p-1.5 md:p-2 flex-shrink-0 shadow-lg shadow-coffee-yellow/20 cursor-pointer`}
              onDoubleClick={() => setShowLogin(true)}
            >
               <img src="/LOGO.jpg" alt="PalFer Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`font-display font-black text-lg md:text-3xl tracking-[0.05em] ${scrolled ? 'text-coffee-black' : 'text-white'} leading-none uppercase`}>{displayConfig.siteTitle}</span>
              <span className="text-[12px] md:text-[16px] font-display font-bold text-coffee-yellow tracking-[0.5em] uppercase mt-1">{displayConfig.siteSubtitle}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-16">
            {[
              { key: 'nav.inicio', anchor: 'inicio' },
              { key: 'nav.maquinaria', anchor: 'maquinaria' },
              { key: 'nav.ingenieria', anchor: 'ingenieria' },
              { key: 'nav.contacto', anchor: 'contacto' },
            ].map((item) => (
              <a 
                key={item.key} 
                href={`#${item.anchor}`}
                className={`text-[11px] font-black uppercase tracking-[0.4em] ${scrolled ? 'text-gray-600 hover:text-gold-accent' : 'text-white/60 hover:text-white'} transition-all`}
              >
                {t(item.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
            {/* Desktop / tablet: full selector */}
            <div className="hidden sm:block">
              <LanguageSelector scrolled={scrolled} />
            </div>
            {/* Mobile: compact selector always visible (no need to open menu) */}
            <div className="sm:hidden">
              <LanguageSelector scrolled={scrolled} compact />
            </div>
            <a 
              href="https://wa.me/573133374499?text=Hola,%20estoy%20interesado%20en%20recibir%20información%20sobre%20sus%20soluciones%20de%20ingeniería%20para%20café.%20¿Podrían%20asesorarme?"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block px-12 py-5 bg-gold-accent text-coffee-black rounded-full font-black text-[11px] tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-xl shadow-gold-accent/20 active:scale-95"
            >
              {t('cta.consultar')}
            </a>
            <button className={`lg:hidden ${scrolled ? 'text-coffee-black' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-black/5 overflow-hidden"
            >
              <div className="flex flex-col p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('lang.region')}</span>
                  <LanguageSelector scrolled={true} />
                </div>
                {[
                  { key: 'nav.inicio', anchor: 'inicio' },
                  { key: 'nav.maquinaria', anchor: 'maquinaria' },
                  { key: 'nav.ingenieria', anchor: 'ingenieria' },
                  { key: 'nav.contacto', anchor: 'contacto' },
                ].map((item) => (
                  <a 
                    key={item.key} 
                    href={`#${item.anchor}`}
                    className="text-xl font-display font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-gold-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t(item.key)}
                  </a>
                ))}
                <a 
                  href="https://wa.me/573133374499?text=Hola,%20estoy%20interesado%20en%20recibir%20información%20sobre%20sus%20soluciones%20de%20ingeniería%20para%20café.%20¿Podrían%20ayudarme?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-gold-accent text-coffee-black rounded-full font-black text-xs tracking-[0.2em] uppercase text-center"
                >
                  {t('cta.consultar')}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Overlay */}
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/5 p-12 rounded-[2.5rem] shadow-2xl relative"
            >
              <button 
                onClick={() => setShowLogin(false)}
                className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 rounded-full bg-gold-accent/10 flex items-center justify-center mb-6">
                   <ShieldCheck className="text-gold-accent" size={32} />
                </div>
                <h2 className="text-white text-2xl font-black uppercase tracking-widest text-center">{t('login.title')}</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-4">{t('login.password_label')}</label>
                  <input 
                    type="password"
                    autoFocus
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold-accent transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (password === 'palfer2024') {
                          setIsAdmin(true);
                          setShowLogin(false);
                        } else {
                          alert(t('login.wrong'));
                        }
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={() => {
                    if (password === 'palfer2024') {
                      setIsAdmin(true);
                      setShowLogin(false);
                    } else {
                      alert(t('login.wrong'));
                    }
                  }}
                  className="w-full py-5 bg-gold-accent text-coffee-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold-accent/10"
                >
                  {t('login.submit')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero 
        title={
          <span dangerouslySetInnerHTML={{ 
            __html: displayConfig.heroTitle
              .replace('TRANSFORMACIÓN', '<span class="text-gold-accent italic">TRANSFORMACIÓN</span>')
              .replace('CAFÉ', '<span class="text-coffee-yellow italic glow-text">CAFÉ</span>') 
          }} />
        }
        subtitle={displayConfig.heroSubtitle}
      />

      {/* Categories Section */}
      <section id="maquinaria" className="py-24 md:py-60 px-6 silver-gradient">
        <div className="container mx-auto">
        <div className="max-w-4xl mb-24 md:mb-40 p-8 md:p-12 rounded-[3rem] bg-white/40 backdrop-blur-md border-2 border-coffee-yellow/30 shadow-xl shadow-coffee-yellow/10">
          <div className="text-gold-accent font-mono text-[9px] md:text-[10px] font-black tracking-[0.4em] md:tracking-[0.6em] uppercase mb-8 md:mb-10 flex items-center">
            <span className="w-8 h-[2px] bg-coffee-yellow mr-4"></span>
            {t('section.subtitle')}
          </div>
          <h2 className="text-2xl md:text-5xl font-display font-black text-coffee-black leading-tight tracking-tighter mb-8 md:mb-12">
             {t('section.title')}
          </h2>
          <p className="text-gray-800 text-lg md:text-3xl font-light leading-relaxed">
             {t('section.description')}
          </p>
        </div>

        <div className="space-y-32 md:space-y-80">
          {displayConfig.categories.map((category, i) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-10%" }}
              className="flex flex-col space-y-12"
            >
              {/* Header: Title and Description above all */}
              <div className="max-w-4xl space-y-8">
                <div className="flex items-center space-x-4 md:space-x-6">
                   <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gold-accent/10 flex items-center justify-center text-gold-accent shadow-inner">
                      <Coffee size={28} className="md:w-10 md:h-10" />
                   </div>
                   <span className="text-[10px] md:text-xs font-mono text-gray-600 tracking-[0.3em] md:tracking-[0.5em] uppercase font-bold">{t('category.serie')} {category.id.toUpperCase()}</span>
                </div>

                <h3 className="text-xl md:text-4xl font-display font-black text-coffee-black leading-tight tracking-tight">
                  {category.name}
                </h3>

                {/* Video Grid */}
                <div className="w-full py-4">
                  {category.videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                      {category.videos.map((src, idx) => (
                        <MediaPlayer 
                           key={idx} 
                           src={src} 
                           categoryId={category.id} 
                           index={idx} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="premium-card bg-white border-2 border-black/5 border-dashed p-16 md:p-24 flex flex-col items-center justify-center text-gray-600">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-100 flex items-center justify-center mb-6">
                        <Coffee className="text-gray-200" size={32} />
                      </div>
                      <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase text-gray-400 text-center">
                        {t('category.nomedia')} {category.name}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-800 text-base md:text-2xl font-light leading-relaxed max-w-3xl">
                  {category.description}
                </p>
              </div>

              {/* Media and Features Content */}
              <div className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-32 items-start`}>
                {/* Features and Actions */}
                <div className="w-full space-y-8 md:space-y-12">
                  <div className="w-full">
                    <FeatureSlider features={category.features} />
                  </div>

                  <div className="pt-6 md:pt-10 flex flex-wrap items-center gap-6 md:gap-10">
                    <a 
                      href={`https://wa.me/573133374499?text=Hola,%20me%20gustaría%20recibir%20una%20cotización%20detallada%20para%20un%20proyecto%20de%20${encodeURIComponent(category.name)}.%20¿Podrían%20ayudarme?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-10 md:px-14 py-4 md:py-6 bg-gold-accent text-coffee-black rounded-full font-black text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-xl shadow-gold-accent/20 text-center"
                    >
                      {t('category.cotizar')}
                    </a>
                    <button className="w-full sm:w-auto text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase text-gray-600 hover:text-coffee-black transition-all border-b border-transparent hover:border-coffee-black text-center">
                      {t('category.detalles')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* Trust & Engineering */}
      <section className="py-24 md:py-40 border-y border-black/5 silver-gradient">
        <div className="container mx-auto px-6">
          <div className="w-full overflow-hidden">
            <TrustSlider items={[
               { icon: ShieldCheck, title: t('trust.guarantee.title'), text: t('trust.guarantee.text') },
               { icon: Wind, title: t('trust.thermal.title'), text: t('trust.thermal.text') },
               { icon: Globe, title: t('trust.global.title'), text: t('trust.global.text') }
             ]} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t-2 border-coffee-yellow/40 silver-gradient">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
           <div className="flex items-center space-x-6">
              <div 
                className="w-12 h-12 border-2 border-coffee-yellow rounded-xl flex items-center justify-center overflow-hidden p-1 bg-white shadow-lg shadow-coffee-yellow/20 cursor-pointer"
                onDoubleClick={() => setShowLogin(true)}
              >
                 <img src="/LOGO.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-black text-xl tracking-[0.2em] text-coffee-black">PALFER</span>
           </div>
           <div className="text-[10px] font-mono text-gray-600 tracking-[0.4em] uppercase">
             {t('footer.copyright')}
           </div>
           <div className="flex space-x-12">
             {[
               { key: 'footer.instagram' },
               { key: 'footer.linkedin' },
               { key: 'footer.catalog' },
             ].map(s => (
               <a key={s.key} href="#" className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-600 hover:text-gold-accent transition-all">
                 {t(s.key)}
               </a>
             ))}
           </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
