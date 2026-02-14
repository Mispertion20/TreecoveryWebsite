import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { statisticsApi, OverviewStats } from '../services/statisticsApi';
import { Leaf, TrendingUp, MapPin, Users } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  format: (val: number) => string;
}

export default function LiveStatisticsTicker() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await statisticsApi.getOverviewStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate survival rate
  const survivalRate =
    stats && stats.total > 0
      ? Math.round((stats.byStatus.alive / stats.total) * 100)
      : 0;

  // Calculate statItems length for useEffect dependency
  const statItemsLength = stats ? 4 : 0;

  // Rotate through stats every 5 seconds (only when stats are loaded)
  useEffect(() => {
    if (!stats || statItemsLength === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % statItemsLength);
    }, 5000);
    return () => clearInterval(interval);
  }, [statItemsLength, stats]);

  if (loading || !stats) {
    return (
      <div className="bg-primary-forest text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="animate-pulse text-sm">{t('liveStats.loadingStatistics')}</div>
        </div>
      </div>
    );
  }

  const statItems: StatItem[] = [
    {
      id: 'total',
      label: t('liveStats.treesTracked'),
      value: stats.total,
      icon: <Leaf className="w-4 h-4" />,
      format: (val) => val.toLocaleString(),
    },
    {
      id: 'alive',
      label: t('liveStats.aliveTrees'),
      value: stats.byStatus.alive,
      icon: <TrendingUp className="w-4 h-4" />,
      format: (val) => val.toLocaleString(),
    },
    {
      id: 'survival',
      label: t('liveStats.survivalRate'),
      value: survivalRate,
      icon: <TrendingUp className="w-4 h-4" />,
      format: (val) => `${val}%`,
    },
    {
      id: 'cities',
      label: t('liveStats.cities'),
      value: stats.totalCities,
      icon: <MapPin className="w-4 h-4" />,
      format: (val) => val.toString(),
    },
  ];

  const currentStat = statItems[currentIndex];

  return (
    <div className="bg-primary-forest text-white py-3 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-sm font-medium whitespace-nowrap">{t('liveStats.liveStatistics')}</span>
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-shrink-0">{currentStat.icon}</div>
                  <span className="font-bold text-lg">
                    {currentStat.format(currentStat.value)}
                  </span>
                  <span className="text-sm opacity-90">{currentStat.label}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {statItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-1 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-60'
                }`}
              >
                {item.icon}
                <span className="font-semibold">{item.format(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

