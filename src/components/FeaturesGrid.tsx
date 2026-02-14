import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Map, Filter, BarChart3, Upload, Camera, Download, LucideIcon } from 'lucide-react';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const getFeatures = (t: (key: string) => string): Feature[] => [
  {
    id: 1,
    title: t('features.interactiveMap.title'),
    description: t('features.interactiveMap.description'),
    icon: Map,
  },
  {
    id: 2,
    title: t('features.advancedFilters.title'),
    description: t('features.advancedFilters.description'),
    icon: Filter,
  },
  {
    id: 3,
    title: t('features.liveStatistics.title'),
    description: t('features.liveStatistics.description'),
    icon: BarChart3,
  },
  {
    id: 4,
    title: t('features.easyUpload.title'),
    description: t('features.easyUpload.description'),
    icon: Upload,
  },
  {
    id: 5,
    title: t('features.photoDocumentation.title'),
    description: t('features.photoDocumentation.description'),
    icon: Camera,
  },
  {
    id: 6,
    title: t('features.exportReports.title'),
    description: t('features.exportReports.description'),
    icon: Download,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function FeaturesGrid() {
  const { t } = useTranslation();
  const features = getFeatures(t);
  
  return (
    <section
      className="py-20 px-6 dark:bg-neutral-dark-bg-primary"
      style={{ backgroundColor: '#F0F5F1' }}
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          id="features-heading"
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-neutral-charcoal dark:text-neutral-dark-text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('features.heading')}
        </motion.h2>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                className="relative bg-white dark:glass-card rounded-2xl p-8 shadow-md dark:shadow-card-dark hover:shadow-xl dark:hover:shadow-card-dark-hover transition-all duration-300 hover:-translate-y-3 group border border-primary-sage/10 dark:border-white/10 dark:hover:border-primary-emerald-dark/40 overflow-hidden"
                variants={itemVariants}
                role="article"
                aria-label={`${feature.title} feature`}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background Gradient */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-primary-emerald/10 to-transparent dark:from-primary-emerald-dark/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                {/* Large Icon Circle with Gradient and Glow */}
                <div
                  className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-emerald to-primary-emerald/80 dark:from-primary-emerald-dark dark:to-primary-emerald rounded-2xl shadow-lg dark:shadow-glow-green group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                  style={{
                    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1), 0 0 0 8px rgba(16, 185, 129, 0.05), 0 8px 24px rgba(16, 185, 129, 0.3)'
                  }}
                  aria-hidden="true"
                >
                  <IconComponent
                    size={36}
                    strokeWidth={2}
                    className="text-white"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-neutral-charcoal dark:text-neutral-dark-text-primary group-hover:text-primary-emerald dark:group-hover:text-primary-emerald-dark transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-charcoal/70 dark:text-neutral-dark-text-tertiary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
