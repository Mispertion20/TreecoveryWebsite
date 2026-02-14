import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, MapPin, Github, Twitter, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import api from '../services/api';

const getSchema = (t: (key: string) => string) => yup.object({
  name: yup.string().required(t('contact.nameRequired')).min(2, t('contact.nameMinLength')),
  email: yup.string().required(t('contact.emailRequired')).email(t('contact.emailInvalid')),
  subject: yup.string().required(t('contact.subjectRequired')).min(3, t('contact.subjectMinLength')),
  message: yup.string().required(t('contact.messageRequired')).min(10, t('contact.messageMinLength')),
});

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@treecovery.kz',
    href: 'mailto:info@treecovery.kz',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Kazakhstan',
    href: null,
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/treecovery',
    href: 'https://github.com/treecovery',
  },
  {
    icon: Twitter,
    label: 'Twitter',
    value: '@treecovery',
    href: 'https://twitter.com/treecovery',
  },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const schema = getSchema(t);

  type FormData = yup.InferType<typeof schema>;
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      await api.post('/contact', data);
      setSubmitStatus('success');
      setSubmitMessage(t('contact.thankYou'));
      reset();
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(
        error.response?.data?.error || t('contact.sendFailed')
      );
    }
  };

  return (
    <main className="overflow-x-hidden bg-neutral-offwhite">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-primary-forest to-primary-forest/90 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('contact.heading')}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-primary-sage max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('contact.subheading')}
          </motion.p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-20 px-6" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold mb-6 text-neutral-charcoal">
                {t('contact.sendMessage')}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span>{submitMessage}</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{submitMessage}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-charcoal mb-2">
                    {t('contact.name')} *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-charcoal mb-2">
                    {t('contact.email')} *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-charcoal mb-2">
                    {t('contact.subject')} *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    {...register('subject')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-charcoal mb-2">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    id="message"
                    {...register('message')}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent resize-none ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tell us more..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-emerald text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-forest focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      {t('contact.sendMessageButton')}
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-charcoal">
                {t('contact.getInTouch')}
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-neutral-charcoal/70 leading-relaxed">
                  {t('contact.getInTouchDescription')}
                </p>

                <div className="space-y-4">
                  {contactInfo.map((info) => {
                    const IconComponent = info.icon;
                    const content = (
                      <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex-shrink-0 mt-1">
                          <IconComponent className="text-primary-emerald" size={24} />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-charcoal mb-1">{info.label}</div>
                          <div className="text-neutral-charcoal/70">{info.value}</div>
                        </div>
                      </div>
                    );

                    if (info.href) {
                      return (
                        <a
                          key={info.label}
                          href={info.href}
                          target={info.href.startsWith('http') ? '_blank' : undefined}
                          rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="block"
                        >
                          {content}
                        </a>
                      );
                    }

                    return <div key={info.label}>{content}</div>;
                  })}
                </div>

                <div className="mt-8 p-6 bg-sage-gradient rounded-xl">
                  <h3 className="font-bold text-lg text-neutral-charcoal mb-2">{t('contact.responseTime')}</h3>
                  <p className="text-neutral-charcoal/70">
                    {t('contact.responseTimeDescription')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

