import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Leaf, TrendingUp, MapPin, Database } from 'lucide-react';

/**
 * HeroSection Component
 * Premium landing page hero with split layout, animations, and accessibility features
 * WCAG 2.1 AA compliant with semantic HTML and ARIA labels
 */

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  trend?: boolean;
}

interface TrustBadgeProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: 0,
      y: [0, -10, 0],
      transition: {
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }
      }
    }}
    transition={{ duration: 0.6, delay: 0.8 }}
    className="bg-white/95 dark:glass-card rounded-2xl p-4 shadow-lg dark:shadow-card-dark border border-primary-sage/20 dark:border-primary-emerald-dark/30"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-2xl font-bold text-primary-forest dark:gradient-text-emerald">{value}</p>
        <p className="text-sm text-neutral-charcoal/70 dark:text-neutral-dark-text-tertiary">{label}</p>
      </div>
      {trend && (
        <div className="flex items-center justify-center w-10 h-10 bg-primary-emerald/10 dark:bg-primary-emerald-dark/20 rounded-full dark:shadow-glow-green">
          <TrendingUp className="w-5 h-5 text-primary-emerald dark:text-primary-emerald-dark" aria-hidden="true" />
        </div>
      )}
      {icon && !trend && (
        <div className="flex items-center justify-center w-10 h-10 bg-accent-golden/10 dark:bg-accent-golden/20 rounded-full">
          {icon}
        </div>
      )}
    </div>
  </motion.div>
);

const TrustBadge: React.FC<TrustBadgeProps> = ({ value, label, icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05, y: -2 }}
    className="flex flex-col items-center gap-2 p-4 bg-white/50 dark:glass-card rounded-xl border border-primary-sage/30 dark:border-primary-emerald-dark/20 dark:shadow-card-dark hover:dark:border-primary-emerald-dark/40 transition-all duration-300"
  >
    <div className="flex items-center justify-center w-12 h-12 bg-primary-emerald/10 dark:bg-primary-emerald-dark/20 rounded-full dark:shadow-glow-green">
      {icon}
    </div>
    <p className="text-lg font-bold text-primary-forest dark:gradient-text-emerald">{value}</p>
    <p className="text-xs text-neutral-charcoal/70 dark:text-neutral-dark-text-tertiary text-center">{label}</p>
  </motion.div>
);

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);
  // Use external image by default (same approach as FinalCTA component)
  const [imageError, setImageError] = useState(false);
  const heroImageUrl = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80';
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Custom easing for smooth motion
      }
    }
  };

  // Floating animation for background shapes
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const floatingAnimationSlow = {
    y: [0, -30, 0],
    x: [0, 10, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 dark:bg-dark-hero"
      aria-label="Hero section"
    >
      {/* Animated Gradient Overlay (Dark Mode Only) */}
      <div className="hidden dark:block absolute inset-0 opacity-100 pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{
            opacity: [1, 0.6, 1],
            transition: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Floating Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-32 h-32 bg-primary-sage/20 dark:bg-primary-emerald-dark/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={floatingAnimationSlow}
          className="absolute top-40 right-20 w-48 h-48 bg-primary-emerald/10 dark:bg-primary-emerald-dark/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, duration: 7 } }}
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-accent-golden/10 dark:bg-primary-emerald-dark/10 rounded-full blur-3xl"
        />

        {/* Decorative Leaf Shapes */}
        <motion.div
          animate={floatingAnimationSlow}
          className="absolute top-1/4 right-1/3"
        >
          <Leaf className="w-16 h-16 text-primary-sage/30 transform rotate-45" aria-hidden="true" />
        </motion.div>
        <motion.div
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
          className="absolute bottom-1/3 left-1/3"
        >
          <Leaf className="w-12 h-12 text-primary-emerald/20 transform -rotate-12" aria-hidden="true" />
        </motion.div>
      </div>

      {/* Header Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-emerald to-primary-forest dark:from-primary-emerald-dark dark:to-primary-emerald-dark rounded-xl shadow-lg dark:shadow-glow-green-button">
              <Leaf className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-primary-forest dark:text-neutral-dark-text-primary tracking-tight">
              Treecovery
            </h2>
          </div>

        </div>
      </motion.div>

      {/* Main Content Container */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">

          {/* Left Side - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 lg:pr-8"
          >

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-[72px] leading-[1.1] font-bold text-primary-forest dark:text-neutral-dark-text-primary tracking-tight"
              style={{ fontSize: 'clamp(48px, 8vw, 72px)' }}
            >
              {t('hero.headline')}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-neutral-charcoal/80 dark:text-neutral-dark-text-secondary max-w-xl"
              style={{ lineHeight: '1.7' }}
            >
              {t('hero.subheadline')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/map"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary-emerald dark:bg-gradient-to-br dark:from-primary-emerald-dark dark:to-primary-emerald rounded-xl shadow-lg dark:shadow-glow-green-button hover:bg-primary-forest dark:hover:shadow-glow-green-button-hover transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-emerald/50 focus:ring-offset-2"
                  aria-label="Explore the interactive map of trees"
                >
                  <MapPin className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t('hero.exploreMap')}
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-forest dark:text-primary-emerald-dark dark:border-primary-emerald-dark bg-transparent border-2 border-primary-forest rounded-xl hover:bg-primary-forest dark:hover:bg-primary-emerald-dark/10 dark:hover:border-primary-emerald-dark hover:text-white dark:hover:text-primary-emerald-dark backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-forest/50 dark:focus:ring-primary-emerald-dark/50 focus:ring-offset-2"
                  aria-label={t('hero.learnMore')}
                >
                  {t('hero.learnMore')}
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 mt-4"
            >
              <TrustBadge
                value="10,000+"
                label={t('common.treesTracked')}
                icon={<Leaf className="w-6 h-6 text-primary-emerald" aria-hidden="true" />}
              />
              <TrustBadge
                value="2"
                label={t('common.cities')}
                icon={<MapPin className="w-6 h-6 text-primary-emerald" aria-hidden="true" />}
              />
              <TrustBadge
                value={t('common.open')}
                label={t('common.data')}
                icon={<Database className="w-6 h-6 text-primary-emerald" aria-hidden="true" />}
              />
            </motion.div>
          </motion.div>

          {/* Right Side - Image & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[500px] lg:h-[600px]"
            style={{ y }}
          >
            {/* Image Container with Gradient Overlay */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl dark:shadow-glow-green-lg">
              {/* Hero Image - Optimized for LCP */}
              {!imageError ? (
                <img
                  src={heroImageUrl}
                  alt="Beautiful urban forest landscape with green trees"
                  className="absolute inset-0 w-full h-full object-cover"
                  fetchPriority="high"
                  loading="eager"
                  onError={() => {
                    // If external image fails, show gradient fallback
                    setImageError(true);
                  }}
                />
              ) : (
                /* Fallback gradient background when all images fail to load */
                <div className="absolute inset-0 bg-gradient-to-br from-primary-sage/40 via-primary-emerald/30 to-primary-forest/50 dark:from-primary-emerald-dark/20 dark:via-primary-emerald-dark/10 dark:to-neutral-dark-bg-tertiary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="w-32 h-32 text-primary-emerald/30 dark:text-primary-emerald-dark/40" aria-hidden="true" />
                  </div>
                </div>
              )}

              {/* Lighter Gradient Overlay - Fades from left (text side) to right (photo side) */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent dark:from-neutral-dark-bg-primary/70 dark:via-neutral-dark-bg-primary/20 dark:to-transparent" />

              {/* Subtle bottom shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-forest/20 via-transparent to-transparent dark:from-neutral-dark-bg-primary/40" />

              {/* Decorative Border with Glow */}
              <div className="absolute inset-0 border-2 border-white/10 dark:border-primary-emerald-dark/20 rounded-3xl" />
            </div>

            {/* Floating Stat Card */}
            <div className="absolute -bottom-6 -left-6 lg:left-0 w-64 z-10">
              <StatCard
                value="15"
                label={t('common.treesPlantedToday')}
                trend={true}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Organic Wave Divider at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full" aria-hidden="true">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C240,96 480,96 720,80 C960,64 1200,32 1440,48 L1440,120 L0,120 Z"
            fill="#FAFAF9"
            className="dark:!fill-[#0A0E0D]"
          />
          <path
            d="M0,80 C240,48 480,48 720,64 C960,80 1200,96 1440,80 L1440,120 L0,120 Z"
            fill="#FAFAF9"
            className="dark:!fill-[#0A0E0D]"
            opacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
