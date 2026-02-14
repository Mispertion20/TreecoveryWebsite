import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { statisticsApi, OverviewStats } from '../services/statisticsApi';

interface Stat {
  id: number;
  value: string;
  label: string;
  numericValue: number;
  suffix?: string;
}

const getDefaultStats = (t: (key: string) => string): Stat[] => [
  {
    id: 1,
    value: '10,000+',
    label: t('impactStats.treesTracked'),
    numericValue: 10000,
    suffix: '+',
  },
  {
    id: 2,
    value: '2',
    label: t('impactStats.cities'),
    numericValue: 2,
  },
  {
    id: 3,
    value: '95%',
    label: t('impactStats.survivalRate'),
    numericValue: 95,
    suffix: '%',
  },
  {
    id: 4,
    value: '500+',
    label: t('impactStats.aliveTrees'),
    numericValue: 500,
    suffix: '+',
  },
];

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  inView: boolean;
}

function AnimatedCounter({ value, suffix = '', inView }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return latest < 100 ? Math.round(latest) : Math.round(latest / 100) * 100;
  });
  const displayValue = useTransform(rounded, (latest) => {
    return latest.toLocaleString();
  });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration: 2.5,
        ease: 'easeOut',
      });

      return controls.stop;
    }
  }, [count, value, inView]);

  return (
    <div className="flex items-baseline justify-center">
      <motion.span
        className="text-7xl md:text-8xl lg:text-9xl font-extrabold gradient-text-emerald tracking-tight"
        style={{
          filter: 'drop-shadow(0 4px 20px rgba(16, 185, 129, 0.4))'
        }}
      >
        {displayValue}
      </motion.span>
      {suffix && (
        <span
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold gradient-text-emerald ml-2"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(16, 185, 129, 0.4))'
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

export default function ImpactStats() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [stats, setStats] = useState<Stat[]>(getDefaultStats(t));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await statisticsApi.getOverviewStats();
        const survivalRate =
          data.total > 0 ? Math.round((data.byStatus.alive / data.total) * 100) : 0;

        setStats([
          {
            id: 1,
            value: `${data.total.toLocaleString()}+`,
            label: t('impactStats.treesTracked'),
            numericValue: data.total,
            suffix: '+',
          },
          {
            id: 2,
            value: data.totalCities.toString(),
            label: t('impactStats.cities'),
            numericValue: data.totalCities,
          },
          {
            id: 3,
            value: `${survivalRate}%`,
            label: t('impactStats.survivalRate'),
            numericValue: survivalRate,
            suffix: '%',
          },
          {
            id: 4,
            value: `${data.byStatus.alive.toLocaleString()}+`,
            label: t('impactStats.aliveTrees'),
            numericValue: data.byStatus.alive,
            suffix: '+',
          },
        ]);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // Keep default stats on error
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden bg-dark-stats"
      aria-labelledby="impact-heading"
    >
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [1, 0.6, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)
          `
        }}
        aria-hidden="true"
      />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Tree Silhouettes */}
        <div className="absolute -left-20 top-1/4 w-64 h-64 opacity-5">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-white">
            {/* Tree 1 */}
            <path d="M100 20 L120 60 L110 60 L130 100 L115 100 L135 140 L65 140 L85 100 L70 100 L90 60 L80 60 Z" />
            <rect x="95" y="140" width="10" height="40" />
          </svg>
        </div>

        <div className="absolute -right-20 bottom-1/4 w-80 h-80 opacity-5">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-white">
            {/* Tree 2 */}
            <path d="M100 10 L125 55 L112 55 L137 105 L120 105 L145 155 L55 155 L80 105 L63 105 L88 55 L75 55 Z" />
            <rect x="92" y="155" width="16" height="35" />
          </svg>
        </div>

        {/* Leaf Patterns */}
        <div className="absolute left-1/4 top-10 opacity-3">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="text-white">
            <path d="M50 10 Q70 30 50 50 Q30 30 50 10" fill="currentColor" opacity="0.3" />
            <path d="M50 50 Q70 70 50 90 Q30 70 50 50" fill="currentColor" opacity="0.2" />
          </svg>
        </div>

        <div className="absolute right-1/3 bottom-10 opacity-3">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="text-white">
            <path d="M50 20 Q75 35 50 50 Q25 35 50 20" fill="currentColor" opacity="0.2" />
            <path d="M50 50 Q75 65 50 80 Q25 65 50 50" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        {/* Abstract Circles */}
        <div className="absolute left-1/2 top-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="absolute inset-0 rounded-full border-4 border-white"></div>
          <div className="absolute inset-8 rounded-full border-2 border-white"></div>
          <div className="absolute inset-16 rounded-full border border-white"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.h2
          id="impact-heading"
          className="text-4xl md:text-5xl font-bold text-center mb-20 text-white dark:text-neutral-dark-text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('impactStats.heading')}
        </motion.h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              role="article"
              aria-label={`${stat.value} ${stat.label}`}
            >
              {/* Animated Number */}
              <div className="mb-4">
                <AnimatedCounter
                  value={stat.numericValue}
                  suffix={stat.suffix}
                  inView={isInView}
                />
              </div>

              {/* Label */}
              <p className="text-xl md:text-2xl text-gray-300 dark:text-neutral-dark-text-tertiary font-medium tracking-wide">
                {stat.label}
              </p>

              {/* Decorative Line */}
              <motion.div
                className="mt-6 mx-auto w-16 h-1 bg-primary-emerald dark:bg-primary-emerald-dark"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1 + 0.3,
                  ease: 'easeOut',
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom Tagline */}
        <motion.p
          className="text-center mt-16 text-lg md:text-xl text-gray-400 dark:text-neutral-dark-text-tertiary max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {t('impactStats.tagline')}
        </motion.p>
      </div>
    </section>
  );
}
