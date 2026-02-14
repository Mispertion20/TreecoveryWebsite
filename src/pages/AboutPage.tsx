import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Leaf, Target, Users, TrendingUp, MapPin } from 'lucide-react';
import Footer from '../components/Footer';

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

const getStats = (t: (key: string) => string) => [
  { value: '10,000+', label: t('impactStats.treesTracked'), icon: Leaf },
  { value: '2', label: t('impactStats.cities'), icon: MapPin },
  { value: '95%', label: 'Accuracy', icon: TrendingUp },
  { value: '500+', label: 'Users', icon: Users },
];

const getTimeline = (t: (key: string) => string) => [
  {
    year: '2023',
    title: 'Project Launch',
    description: 'Treecovery was conceived to address the lack of transparency in green space monitoring in Kazakhstan.',
  },
  {
    year: '2024',
    title: 'First Cities Added',
    description: 'Launched with Almaty and Astana, tracking thousands of trees and green spaces.',
  },
  {
    year: '2024',
    title: 'Open Data Platform',
    description: 'Made all data publicly accessible, enabling citizens, researchers, and planners to make informed decisions.',
  },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const stats = getStats(t);
  const timeline = getTimeline(t);
  return (
    <main className="overflow-x-hidden bg-neutral-offwhite">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-primary-forest to-primary-forest/90 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('about.heading')}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-primary-sage max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('about.tagline')}
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white" aria-labelledby="mission-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-primary-emerald" size={32} />
              <h2 id="mission-heading" className="text-4xl md:text-5xl font-bold text-neutral-charcoal">
                {t('about.ourMission')}
              </h2>
            </div>
            <p className="text-lg md:text-xl text-neutral-charcoal/80 leading-relaxed mb-6">
              {t('about.missionDescription')}
            </p>
            <p className="text-lg text-neutral-charcoal/70 leading-relaxed">
              Our mission is to restore trust in environmental initiatives by providing a clear, 
              open-source view of tree planting and maintenance efforts across Kazakhstan. We empower 
              citizens, researchers, and policymakers with accurate data to make informed decisions 
              about our shared green future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistics Highlights */}
      <section className="py-20 px-6 bg-sage-gradient" aria-labelledby="stats-heading">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            id="stats-heading"
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-neutral-charcoal"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Impact
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all duration-300"
                  variants={itemVariants}
                >
                  <IconComponent className="text-primary-emerald mx-auto mb-4" size={48} />
                  <div className="text-4xl md:text-5xl font-bold text-primary-forest mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg text-neutral-charcoal/70">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Methodology Overview */}
      <section className="py-20 px-6 bg-white" aria-labelledby="methodology-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="methodology-heading" className="text-4xl md:text-5xl font-bold mb-8 text-neutral-charcoal">
              How We Work
            </h2>
            <div className="space-y-6 text-lg text-neutral-charcoal/70 leading-relaxed">
              <p>
                Treecovery uses a combination of field surveys, satellite imagery, and community 
                contributions to track and verify green spaces across Kazakhstan. Our data collection 
                methodology ensures accuracy and transparency at every step.
              </p>
              <p>
                All data is stored in an open database, accessible to anyone who wants to verify 
                claims or conduct research. We maintain strict quality controls and regularly audit 
                our records to ensure the highest standards of accuracy.
              </p>
              <p>
                For detailed information about our data collection methods, verification processes, 
                and technical specifications, visit our{' '}
                <a href="/methodology" className="text-primary-emerald hover:underline font-medium">
                  Methodology page
                </a>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Timeline */}
      <section className="py-20 px-6 bg-neutral-offwhite" aria-labelledby="timeline-heading">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            id="timeline-heading"
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-neutral-charcoal"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Project Timeline
          </motion.h2>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className="flex gap-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary-emerald flex items-center justify-center text-white font-bold text-lg">
                    {item.year.slice(-2)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-1 h-full bg-primary-sage/30 mx-auto mt-2" style={{ minHeight: '60px' }}></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-2xl font-bold text-neutral-charcoal mb-2">{item.title}</h3>
                  <p className="text-lg text-neutral-charcoal/70 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-white" aria-labelledby="team-heading">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Users className="text-primary-emerald mx-auto mb-6" size={48} />
            <h2 id="team-heading" className="text-4xl md:text-5xl font-bold mb-6 text-neutral-charcoal">
              Our Team
            </h2>
            <p className="text-lg text-neutral-charcoal/70 leading-relaxed max-w-2xl mx-auto">
              Treecovery is built by a dedicated team of developers, environmental scientists, 
              and data specialists committed to transparency and environmental stewardship. We're 
              supported by volunteers, researchers, and citizens who contribute data and feedback 
              to make the platform better every day.
            </p>
            <p className="text-lg text-neutral-charcoal/70 leading-relaxed max-w-2xl mx-auto mt-4">
              Want to join us or contribute?{' '}
              <a href="/contact" className="text-primary-emerald hover:underline font-medium">
                Get in touch
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

