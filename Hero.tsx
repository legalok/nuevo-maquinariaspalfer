import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';

/**
 * 🛡️ REGLA DE PROTECCIÓN DEL HERO SECTION:
 * Este componente está AISLADO para proteger el video cinemático y su estructura.
 * NO realizar cambios en este archivo a menos que la petición del usuario sea
 * EXCLUSIVAMENTE sobre el "Header", "Hero Section" o "Video de Fondo".
 * Los videos se sirven desde la carpeta protegida /public/hero/
 */

interface HeroProps {
  title?: React.ReactNode;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
  const { t } = useI18n();
  return (
    <section id="inicio" className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden bg-black py-20 md:py-32" style={{ backgroundImage: 'url(/hero/hero_main.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <video 
        key="hero-video-active-stream-v1"
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
        poster="/hero/hero_main.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ objectPosition: 'center' }}
      >
        {/* Prioridad al nuevo video en la carpeta hero */}
        <source src="/hero/hero_main.mp4" type="video/mp4" />
        {/* Fallbacks verificados */}
        <source src="/trilla_v1.mp4" type="video/mp4" />
        <source src="/trilla1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay para contraste - Transparencia pura en el centro */}
      <div className="absolute inset-0 z-10 hero-overlay pointer-events-none" />
 
      <div className="relative z-20 text-center max-w-7xl mx-auto px-6">
         <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
         >
          <span className="inline-block px-6 md:px-10 py-2 border-2 border-coffee-yellow bg-black/60 text-coffee-yellow text-[9px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase mb-8 md:mb-12 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            {t('hero.badge')}
          </span>
          <h1 className="hero-title mb-6 md:mb-10 text-white drop-shadow-2xl">
            {title || (
              <>
                MAQUINARIAS PARA LA <br />
                <span className="text-gold-accent italic">TRANSFORMACIÓN</span> <br />
                DEL <span className="text-coffee-yellow italic glow-text">CAFÉ</span>
              </>
            )}
          </h1>
          <p className="text-gray-200 text-sm md:text-2xl max-w-5xl mx-auto font-light leading-relaxed mb-10 md:mb-16 px-2 md:px-4" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.8), 0 2px 5px rgba(0,0,0,0.9)' }}>
            {subtitle || "Cada máquina es una promesa de calidad: transformamos tu cosecha en excelencia industrial para los mercados más exigentes."}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
             <a 
               href="https://wa.me/573133374499?text=Hola,%20quisiera%20explorar%20su%20catálogo%20de%20maquinaria%20para%20café.%20¿Me%20podrían%20enviar%20más%20información?"
               target="_blank"
               rel="noopener noreferrer"
               className="w-full md:w-auto px-10 md:px-16 py-4 md:py-6 bg-white text-coffee-black rounded-full font-black text-[10px] md:text-[11px] tracking-[0.3em] uppercase border-2 border-coffee-yellow hover:bg-coffee-yellow hover:text-white transition-all hover:scale-105 md:hover:scale-110 shadow-2xl shadow-coffee-yellow/30 text-center"
             >
               {t('hero.cta1')}
             </a>
             <button className="w-full md:w-auto px-10 md:px-16 py-4 md:py-6 bg-black/20 backdrop-blur-md text-white rounded-full font-black text-[10px] md:text-[11px] tracking-[0.3em] uppercase border border-white/30 hover:bg-white hover:text-coffee-black transition-all hover:scale-105 md:hover:scale-110 flex items-center justify-center space-x-4">
               <span>{t('hero.cta2')}</span>
               <ArrowRight size={18} />
             </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className="w-[1px] h-20 bg-gradient-to-b from-coffee-yellow via-coffee-yellow/20 to-transparent" />
        <span className="mt-4 text-[8px] font-mono tracking-[0.4em] text-gray-400 uppercase vertical-text">{t('hero.scroll')}</span>
      </div>
    </section>
  );
};

export default Hero;
