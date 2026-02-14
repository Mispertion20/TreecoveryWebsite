import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Database, RefreshCw, MapPin } from 'lucide-react';
import { useRef } from 'react';

import type { LucideIcon } from 'lucide-react';

interface InfoCard {
  id: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  position: 'left' | 'right';
}

const getInfoCards = (t: (key: string) => string): InfoCard[] => [
  {
    id: 1,
    icon: Database,
    title: '50,000+',
    subtitle: t('mapPreview.treesTracked'),
    position: 'left',
  },
  {
    id: 2,
    icon: RefreshCw,
    title: t('mapPreview.realTime'),
    subtitle: t('mapPreview.updates'),
    position: 'right',
  },
];

export default function MapPreview() {
  const { t } = useTranslation();
  const infoCards = getInfoCards(t);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax effects for floating cards
  const leftCardY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rightCardY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const mapScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden bg-dark-map"
      style={{ backgroundColor: '#2D5016' }}
      aria-labelledby="map-preview-heading"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Title */}
        <motion.h2
          id="map-preview-heading"
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white dark:text-neutral-dark-text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('mapPreview.heading')}
        </motion.h2>

        {/* Map Container with Floating Cards */}
        <div className="relative">
          {/* Main Map Area */}
          <motion.div
            className="relative mx-auto max-w-5xl"
            style={{ scale: mapScale }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Map Background */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 dark:from-neutral-dark-bg-primary/80 dark:to-neutral-dark-bg-secondary/80 rounded-2xl p-8 md:p-12 backdrop-blur-sm dark:backdrop-blur-glass border border-white/10 dark:border-primary-emerald-dark/20 shadow-2xl dark:shadow-glow-green-lg">
              {/* Kazakhstan Map Illustration */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-emerald-800/30 to-green-800/30 rounded-xl overflow-hidden">
                {/* SVG Map Placeholder */}
                <svg
                  viewBox="0 0 800 500"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Kazakhstan outline (simplified shape) */}
                  <path
                    d="M 150 200 Q 180 150 250 160 L 350 140 Q 420 135 480 150 L 580 170 Q 650 180 700 220 L 720 260 Q 730 300 710 340 L 680 370 Q 620 400 550 390 L 450 380 Q 380 390 320 380 L 240 360 Q 180 340 150 300 L 130 250 Q 125 220 150 200 Z"
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="rgba(16, 185, 129, 0.4)"
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />

                  {/* Grid lines for map effect */}
                  <g stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1="0"
                        y1={i * 62.5}
                        x2="800"
                        y2={i * 62.5}
                      />
                    ))}
                    {Array.from({ length: 13 }).map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={i * 61.5}
                        y1="0"
                        x2={i * 61.5}
                        y2="500"
                      />
                    ))}
                  </g>

                  {/* Animated marker pins */}
                  {[
                    { x: 200, y: 250, delay: 0 },
                    { x: 350, y: 200, delay: 0.2 },
                    { x: 480, y: 240, delay: 0.4 },
                    { x: 580, y: 280, delay: 0.6 },
                    { x: 420, y: 320, delay: 0.8 },
                    { x: 280, y: 300, delay: 1 },
                  ].map((marker, index) => (
                    <motion.g
                      key={`marker-${index}`}
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: marker.delay,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        repeatDelay: 2,
                      }}
                    >
                      {/* Pin shadow */}
                      <ellipse
                        cx={marker.x}
                        cy={marker.y + 25}
                        rx="8"
                        ry="3"
                        fill="rgba(0, 0, 0, 0.2)"
                      />
                      {/* Pin */}
                      <path
                        d={`M ${marker.x} ${marker.y} Q ${marker.x - 8} ${marker.y + 5} ${marker.x} ${marker.y + 20} Q ${marker.x + 8} ${marker.y + 5} ${marker.x} ${marker.y} Z`}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      {/* Pin dot */}
                      <circle
                        cx={marker.x}
                        cy={marker.y + 5}
                        r="3"
                        fill="#ffffff"
                      />
                      {/* Pulse effect */}
                      <motion.circle
                        cx={marker.x}
                        cy={marker.y + 5}
                        r="8"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        initial={{ opacity: 0.8, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 2 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: marker.delay,
                        }}
                      />
                    </motion.g>
                  ))}
                </svg>

                {/* Decorative map pins icon overlay */}
                <div className="absolute top-4 right-4 text-emerald-400/30">
                  <MapPin size={48} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Info Cards */}
          {/* Desktop version */}
          <div className="hidden lg:block">
            {infoCards.map((card) => {
              const IconComponent = card.icon;
              const yTransform = card.position === 'left' ? leftCardY : rightCardY;

              return (
                <motion.div
                  key={card.id}
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    card.position === 'left' ? '-left-20 xl:-left-32' : '-right-20 xl:-right-32'
                  }`}
                  style={{ y: yTransform }}
                  initial={{ opacity: 0, x: card.position === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <motion.div
                    className="bg-white dark:bg-dark-surface dark:backdrop-blur-glass rounded-2xl p-6 shadow-2xl dark:shadow-card-dark w-56 border border-emerald-100 dark:border-white/10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-primary-emerald-dark dark:to-primary-emerald-dark rounded-xl p-3 text-white">
                        <IconComponent size={28} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:gradient-text-emerald">
                          {card.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-neutral-dark-text-tertiary">
                          {card.subtitle}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile version - stacked below map */}
          <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoCards.map((card) => {
              const IconComponent = card.icon;

              return (
                <motion.div
                  key={card.id}
                  className="bg-white dark:bg-dark-surface dark:backdrop-blur-glass rounded-2xl p-6 shadow-xl dark:shadow-card-dark border border-emerald-100 dark:border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: card.id * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-primary-emerald-dark dark:to-primary-emerald-dark rounded-xl p-3 text-white">
                      <IconComponent size={28} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:gradient-text-emerald">
                        {card.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-neutral-dark-text-tertiary">
                        {card.subtitle}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            className="px-8 py-4 bg-accent-golden dark:bg-accent-golden hover:bg-[#D97706] dark:hover:bg-accent-golden/90 text-white font-semibold rounded-xl shadow-lg dark:shadow-glow-green-button hover:shadow-xl dark:hover:shadow-glow-green-button-hover transition-all duration-300 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start exploring Kazakhstan's green spaces"
          >
            Start Exploring
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
