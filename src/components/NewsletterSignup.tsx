import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSignup() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error(t('newsletter.invalidEmail'));
      return;
    }

    setSubmitting(true);

    try {
      // ⚠️ WARNING: Newsletter functionality is not yet implemented
      // This is a placeholder that simulates success without actually subscribing users
      // TODO: Implement newsletter API endpoint before deploying to production
      // Options:
      // 1. Integrate with an email service (Mailchimp, SendGrid, ConvertKit)
      // 2. Store emails in database and set up email campaigns
      // 3. Remove this component if newsletter feature is not needed

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show warning in development
      if (import.meta.env.DEV) {
        toast.error('⚠️ Newsletter not implemented! Email not saved: ' + email, {
          duration: 5000,
        });
        return;
      }

      toast.success(t('newsletter.subscribeSuccess'));
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      toast.error(t('newsletter.subscribeFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-r from-primary-forest to-primary-emerald">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('newsletter.heading')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('newsletter.subheading')}
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block"
            >
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-medium">
                  {t('newsletter.thankYou')}
                </span>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('newsletter.emailPlaceholder')}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                    aria-label="Email address for newsletter subscription"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-white text-primary-forest font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {submitting ? t('newsletter.subscribing') : t('newsletter.subscribe')}
                </button>
              </div>
              <p className="text-sm text-white/80 mt-4">
                {t('newsletter.privacy')}
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

