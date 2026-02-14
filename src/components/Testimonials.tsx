import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  organization: string;
  image?: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Айгуль Нурланова',
    role: 'Deputy Mayor',
    organization: 'Astana City Administration',
    quote:
      'Treecovery has revolutionized how we track and manage our urban green spaces. The real-time data helps us make informed decisions about tree planting and maintenance.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ерлан Жаныбеков',
    role: 'Director',
    organization: 'Almaty Parks Department',
    quote:
      'The platform provides excellent visibility into our green infrastructure. We can now track survival rates and optimize our planting strategies based on actual data.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Мария Петрова',
    role: 'Environmental Specialist',
    organization: 'Ministry of Ecology',
    quote:
      'Treecovery enables us to monitor green spaces across Kazakhstan efficiently. The citizen reporting feature has been invaluable for early detection of issues.',
    rating: 5,
  },
];

export default function Testimonials() {
  const { t } = useTranslation();
  return (
    <section className="py-24 px-6 bg-gray-50" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            {t('testimonials.heading')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('testimonials.subheading')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <Quote className="w-8 h-8 text-primary-emerald mb-4" aria-hidden="true" />

              <blockquote className="text-gray-700 text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="border-t pt-6">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-primary-emerald font-medium">
                  {testimonial.organization}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

