import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Map, UserPlus } from 'lucide-react';

export default function FinalCTA() {
  const { t } = useTranslation();
  
  return (
    <section
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background with gradient overlay (placeholder for nature/forest image) */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-forest/80 via-primary-forest/70 to-primary-forest/80" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-emerald rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-sage rounded-full blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Main Heading */}
        <motion.h2
          id="cta-heading"
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {t('finalCTA.heading')}
        </motion.h2>

        {/* Subheading - removed as per spec */}

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        >
          {/* Primary Button - Explore the Map */}
          <motion.button
            className="group relative px-10 py-5 bg-primary-emerald text-white text-lg font-semibold rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary-emerald/50 min-w-[240px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Explore the interactive tree map"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-emerald to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <span className="relative flex items-center justify-center gap-2">
              <Map size={24} strokeWidth={2} />
              {t('finalCTA.exploreMap')}
            </span>
          </motion.button>

          {/* Secondary Button - Register as Admin */}
          <motion.button
            className="group relative px-10 py-5 bg-transparent text-white text-lg font-semibold rounded-lg border-2 border-white shadow-lg overflow-hidden transition-all duration-300 hover:bg-white hover:text-primary-forest hover:shadow-2xl hover:shadow-white/30 min-w-[240px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Register as an administrator"
          >
            <span className="relative flex items-center justify-center gap-2">
              <UserPlus size={24} strokeWidth={2} />
              {t('finalCTA.registerAdmin')}
            </span>
          </motion.button>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          className="text-sm md:text-base text-gray-300 font-light"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
        >
          {t('finalCTA.freeAndOpen')}
        </motion.p>
      </div>
    </section>
  );
}
