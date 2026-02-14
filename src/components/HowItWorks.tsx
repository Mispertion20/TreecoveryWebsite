import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sprout, MapPin, TrendingUp, LucideIcon } from 'lucide-react';
import { useRef } from 'react';

interface Step {
  id: number;
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const getSteps = (t: (key: string) => string): Step[] => [
  {
    id: 1,
    number: '01',
    title: t('howItWorks.treesPlanted.title'),
    description: t('howItWorks.treesPlanted.description'),
    icon: Sprout,
  },
  {
    id: 2,
    number: '02',
    title: t('howItWorks.mappedRealtime.title'),
    description: t('howItWorks.mappedRealtime.description'),
    icon: MapPin,
  },
  {
    id: 3,
    number: '03',
    title: t('howItWorks.monitorGrow.title'),
    description: t('howItWorks.monitorGrow.description'),
    icon: TrendingUp,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function HowItWorks() {
  const { t } = useTranslation();
  const steps = getSteps(t);
  const lineRef = useRef<HTMLDivElement>(null);
  const isLineInView = useInView(lineRef, { once: true, margin: '-100px' });

  return (
    <section
      className="py-20 px-6 bg-white relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          id="how-it-works-heading"
          className="text-4xl md:text-5xl font-bold text-center mb-20 text-neutral-charcoal"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('howItWorks.heading')}
        </motion.h2>

        {/* Timeline Container */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Connecting Line - Desktop */}
          <div
            ref={lineRef}
            className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 mx-auto"
            style={{ width: 'calc(100% - 200px)', left: '100px' }}
            aria-hidden="true"
          >
            {/* Background line */}
            <div className="absolute inset-0 bg-gray-200" />

            {/* Animated line */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ scaleX: 0 }}
              animate={isLineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />

            {/* Dashed pattern overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 10px, white 10px, white 20px)',
              }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.id}
                  className="relative flex flex-col items-center text-center"
                  variants={stepVariants}
                  role="article"
                  aria-label={`Step ${step.id}: ${step.title}`}
                >
                  {/* Decorative Number Background */}
                  <div
                    className="absolute -top-8 text-8xl md:text-9xl font-bold text-emerald-50 select-none pointer-events-none z-0"
                    aria-hidden="true"
                  >
                    {step.number}
                  </div>

                  {/* Icon Circle */}
                  <motion.div
                    className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    aria-hidden="true"
                  >
                    <IconComponent
                      size={48}
                      strokeWidth={1.5}
                      className="text-white"
                    />
                  </motion.div>

                  {/* Step Number - Mobile */}
                  <span
                    className="lg:hidden text-sm font-bold text-emerald-600 mb-2"
                    aria-label={`Step ${step.id}`}
                  >
                    STEP {step.number}
                  </span>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-neutral-charcoal relative z-10">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-charcoal/70 max-w-sm relative z-10" style={{ lineHeight: '1.7' }}>
                    {step.description}
                  </p>

                  {/* Connecting Line - Mobile (Vertical) */}
                  {index < steps.length - 1 && (
                    <div
                      className="lg:hidden absolute left-1/2 -bottom-12 w-0.5 h-12 -translate-x-1/2"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-gray-200" />
                      <motion.div
                        className="absolute inset-0 bg-emerald-500"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                        style={{ transformOrigin: 'top' }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Decorative Element */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-neutral-charcoal/60 text-sm md:text-base">
            Simple, transparent, and effective tree tracking
          </p>
        </motion.div>
      </div>
    </section>
  );
}
