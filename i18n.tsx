import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Source-of-truth Spanish UI strings. Keep in sync with backend/i18n.py UI_STRINGS_ES.
export const ES_STRINGS: Record<string, string> = {
  'nav.inicio': 'Inicio',
  'nav.maquinaria': 'Maquinaria',
  'nav.ingenieria': 'Ingeniería',
  'nav.contacto': 'Contacto',
  'cta.consultar': 'Consultar Ahora',
  'hero.badge': 'High-End Coffee Engineering',
  'hero.cta1': 'Explorar Catálogo',
  'hero.cta2': 'Nuestra Historia',
  'hero.scroll': 'Scroll',
  'section.subtitle': 'Ingeniería de Vanguardia',
  'section.title': 'EQUIPOS INDUSTRIALES',
  'section.description':
    'Cada componente es diseñado para maximizar el rendimiento y preservar la pureza sensorial del café.',
  'category.serie': 'Serie',
  'category.cotizar': 'Cotizar Proyecto',
  'category.detalles': 'Ver Detalles',
  'category.nomedia': 'Contenido multimedia en preparación para',
  'category.media_status': 'Estado: Operativo',
  'media.error_title': 'Multimedia no detectable',
  'media.error_help': 'Verifica el nombre del archivo en el panel de administrador.',
  'media.retry': 'Reintentar carga',
  'trust.guarantee.title': 'Garantía Industrial',
  'trust.guarantee.text': 'Soporte técnico y repuestos originales con cobertura nacional completa.',
  'trust.thermal.title': 'Sistemas Térmicos',
  'trust.thermal.text': 'Eficiencia energética líder en la industria con aislamiento de fibra cerámica.',
  'trust.global.title': 'Alcance Global',
  'trust.global.text': 'Maquinaria diseñada bajo estándares internacionales para exportadores de café.',
  'footer.copyright': '© 2024 Palfer Maquinarias. Ingeniería del Café.',
  'footer.instagram': 'Instagram',
  'footer.linkedin': 'Linkedin',
  'footer.catalog': 'Catálogo',
  'lang.label': 'IDIOMA',
  'lang.region': 'Seleccionar Región',
  'lang.auto': 'AUTO',
  'lang.reset_auto': 'Volver a auto-detectar',
  'lang.manual_active': 'Tu elección manual tiene prioridad',
  'login.title': 'Acceso Administrador',
  'login.password_label': 'Contraseña Maestra',
  'login.submit': 'Entrar al Panel',
  'login.wrong': 'Contraseña incorrecta',
  'chat.welcome':
    '¡Hola! Soy el asistente virtual de Maquinarias PalFer. Pregúntame sobre nuestras tostadoras, trilladoras, selectores o molinos de café y te respondo al instante.',
  'chat.title': 'Asistente PalFer',
  'chat.online': 'En línea · Responde al instante',
  'chat.placeholder': 'Escribe tu pregunta…',
  'chat.thinking': 'Pensando…',
  'chat.footer': 'Respuestas basadas en información oficial PalFer',
  'chat.error':
    'Disculpa, tuve un problema para responder. Por favor inténtalo de nuevo o escríbenos al WhatsApp +57 313 337 4499.',
  'chat.close': 'Cerrar',
  'chat.open': 'Abrir chat',
  'chat.ready_button': 'He solucionado mis dudas, estoy listo para comprar',
  'lead.title': '¡Excelente! Cuéntanos tus datos',
  'lead.subtitle': 'Un asesor de PalFer te contactará para concretar tu compra.',
  'lead.name': 'Nombre completo',
  'lead.address': 'Dirección',
  'lead.email': 'Correo electrónico',
  'lead.phone': 'Teléfono / WhatsApp',
  'lead.note': '¿Algo más que debamos saber? (opcional)',
  'lead.submit': 'Enviar mis datos',
  'lead.cancel': 'Cancelar',
  'lead.success': '¡Gracias! Hemos recibido tus datos. Un asesor te contactará pronto.',
  'lead.error': 'No pudimos enviar tus datos. Por favor inténtalo de nuevo.',
  'admin.leads_tab': 'Listos para comprar',
  'admin.leads_title': 'Personas listas para comprar',
  'admin.leads_empty': 'Todavía no hay leads. Cuando un visitante complete el formulario aparecerá aquí.',
  'admin.lead_contact_whatsapp': 'Contactar por WhatsApp',
  'admin.lead_delete': 'Eliminar',
  'whatsapp.cta':
    'Para una cotización personalizada escribe a nuestro WhatsApp: +57 313 337 4499',
};

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    features: string[];
    videos: string[];
  }>;
}

interface I18nState {
  lang: string;
  detectedLang: string | null;
  detectedCountry: string | null;
  isManualOverride: boolean;
  strings: Record<string, string>;
  config: SiteConfig | null;
  setLang: (lang: string) => void;
  resetToAutoDetected: () => void;
  t: (key: string) => string;
  loading: boolean;
  langLoading: boolean;
}

const I18nContext = createContext<I18nState | null>(null);

const STORAGE_KEY = 'palfer-lang';

export const I18nProvider: React.FC<{ children: React.ReactNode; initialConfig?: SiteConfig | null }> = ({ children, initialConfig }) => {
  const [lang, setLangState] = useState<string>('es');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return false;
    }
  });
  const [strings, setStrings] = useState<Record<string, string>>(ES_STRINGS);
  const [config, setConfig] = useState<SiteConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [langLoading, setLangLoading] = useState<boolean>(false);
  // Token used to ignore stale loadLang results when the user clicks several
  // languages in quick succession. Only the latest call is allowed to apply.
  const loadTokenRef = React.useRef(0);

  // Detect locale on mount; if user has a saved choice, honour it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        let target = saved;
        try {
          const r = await fetch('/api/locale');
          if (r.ok) {
            const j = await r.json();
            if (!cancelled) {
              setDetectedLang(j.lang);
              setDetectedCountry(j.country);
            }
            if (!target) target = j.lang || 'es';
          }
        } catch (_) {
          // ignore
        }
        if (!target) target = 'es';
        if (!cancelled) await loadLang(target);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLang = useCallback(async (target: string) => {
    const myToken = ++loadTokenRef.current;
    setLangLoading(true);
    try {
      const r = await fetch(`/api/i18n?lang=${encodeURIComponent(target)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      // Ignore if a newer request was started after this one
      if (myToken !== loadTokenRef.current) return;
      const finalLang = j.lang || target;
      setLangState(finalLang);
      setStrings({ ...ES_STRINGS, ...(j.strings || {}) });
      if (j.config) setConfig(j.config);
    } catch (_) {
      if (myToken === loadTokenRef.current) {
        setLangState('es');
        setStrings(ES_STRINGS);
      }
    } finally {
      if (myToken === loadTokenRef.current) {
        setLangLoading(false);
      }
    }
  }, []);

  const setLang = useCallback(
    (target: string) => {
      const code = (target || 'es').toLowerCase();
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch (_) {
        // ignore
      }
      setIsManualOverride(true);
      void loadLang(code);
    },
    [loadLang],
  );

  const resetToAutoDetected = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // ignore
    }
    setIsManualOverride(false);
    const target = detectedLang || 'es';
    void loadLang(target);
  }, [detectedLang, loadLang]);

  const t = useCallback((key: string) => strings[key] || ES_STRINGS[key] || key, [strings]);

  const value = useMemo<I18nState>(
    () => ({
      lang,
      detectedLang,
      detectedCountry,
      isManualOverride,
      strings,
      config,
      setLang,
      resetToAutoDetected,
      t,
      loading,
      langLoading,
    }),
    [lang, detectedLang, detectedCountry, isManualOverride, strings, config, setLang, resetToAutoDetected, t, loading, langLoading],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
