import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Upload, PenSquare, RefreshCw, Image, FileDown, Users } from 'lucide-react';

interface AdminFeature {
  id: number;
  title: string;
  description: string;
  icon: typeof CheckCircle2;
}

const getAdminFeatures = (t: (key: string) => string): AdminFeature[] => [
  {
    id: 1,
    title: t('adminSection.csvUpload'),
    description: t('adminSection.csvUploadDesc'),
    icon: Upload,
  },
  {
    id: 2,
    title: t('adminSection.manualEntry'),
    description: t('adminSection.manualEntryDesc'),
    icon: PenSquare,
  },
  {
    id: 3,
    title: t('adminSection.statusUpdates'),
    description: t('adminSection.statusUpdatesDesc'),
    icon: RefreshCw,
  },
  {
    id: 4,
    title: t('adminSection.photoManagement'),
    description: t('adminSection.photoManagementDesc'),
    icon: Image,
  },
  {
    id: 5,
    title: t('adminSection.exportTools'),
    description: t('adminSection.exportToolsDesc'),
    icon: FileDown,
  },
  {
    id: 6,
    title: t('adminSection.userManagement'),
    description: t('adminSection.userManagementDesc'),
    icon: Users,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const dashboardVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
};

export default function AdminSection() {
  const { t } = useTranslation();
  const adminFeatures = getAdminFeatures(t);
  return (
    <section
      className="py-20 px-6 bg-white"
      aria-labelledby="admin-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Dashboard Mockup */}
          <motion.div
            className="order-2 lg:order-1"
            variants={dashboardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <div
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl p-6 border border-gray-200"
              role="img"
              aria-label="Admin dashboard preview"
            >
              {/* Dashboard Header */}
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">T</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{t('adminSection.dashboardTitle')}</h3>
                      <p className="text-xs text-gray-500">{t('adminSection.dashboardSubtitle')}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: t('adminSection.totalTrees'), value: '12,458', color: 'emerald' },
                  { label: t('adminSection.pending'), value: '234', color: 'amber' },
                  { label: t('adminSection.thisMonth'), value: '+1,205', color: 'blue' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 shadow-sm"
                  >
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-lg font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">{t('adminSection.plantingProgress')}</p>
                  <div className="w-16 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  {[85, 65, 90, 45, 70].map((width, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded"></div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Preview */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">{t('adminSection.recentUploads')}</p>
                  <div className="w-12 h-5 bg-emerald-600 rounded"></div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 pb-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded"></div>
                      <div className="flex-1 space-y-1">
                        <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-gray-100 rounded"></div>
                      </div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Features List */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                id="admin-heading"
                className="text-4xl md:text-5xl font-bold mb-4 text-neutral-charcoal"
              >
                {t('adminSection.heading')}
              </h2>
              <p className="text-lg text-neutral-charcoal/70 mb-8" style={{ lineHeight: '1.7' }}>
                {t('adminSection.description')}
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              className="space-y-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {adminFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    className="flex items-start gap-4 group"
                    variants={itemVariants}
                  >
                    {/* Checkmark Icon */}
                    <div
                      className="flex-shrink-0 mt-1"
                      aria-hidden="true"
                    >
                      <CheckCircle2
                        size={24}
                        className="text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Feature Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent
                          size={18}
                          className="text-gray-500"
                          aria-hidden="true"
                        />
                        <h3 className="font-bold text-lg text-neutral-charcoal group-hover:text-primary-emerald transition-colors duration-300">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-neutral-charcoal/70" style={{ lineHeight: '1.7' }}>
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button
                className="bg-primary-emerald hover:bg-primary-forest text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Request admin access to Treecovery dashboard"
              >
                {t('adminSection.requestAccess')}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
