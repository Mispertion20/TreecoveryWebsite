import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'What is Treecovery?',
    answer:
      'Treecovery is Kazakhstan\'s first transparent platform for monitoring urban green spaces. We track trees and green areas across cities, providing open, verifiable data to citizens, researchers, and policymakers. Our mission is to restore trust in environmental initiatives by making tree planting and maintenance efforts transparent and accountable.',
  },
  {
    id: 2,
    question: 'How do I use the map?',
    answer:
      'Simply navigate to the Map page and explore green spaces in your city. You can zoom in and out, click on markers to see detailed information about each tree or green space, and use filters to find specific types of trees or areas. The map shows real-time data from our database, including tree species, planting dates, and maintenance status.',
  },
  {
    id: 3,
    question: 'How do I become an admin?',
    answer:
      'Admin access is granted to verified users who need to contribute or manage data. To request admin access, please contact us through our Contact page with information about your organization or role. We review each request to ensure data quality and prevent misuse. Admins can upload CSV files, manually add green spaces, and manage records in their assigned cities.',
  },
  {
    id: 4,
    question: 'How is data collected?',
    answer:
      'Our data comes from multiple sources: field surveys conducted by trained personnel, satellite imagery analysis, and verified community contributions. All data goes through a quality control process before being added to the database. We maintain strict standards for accuracy and regularly audit records. For detailed information, visit our Methodology page.',
  },
  {
    id: 5,
    question: 'Is the data accurate?',
    answer:
      'Yes, we maintain high standards for data accuracy. All records are verified through multiple methods including GPS coordinates, photo documentation, and cross-referencing with official records when available. Our system tracks data quality metrics, and we regularly audit and update records. Currently, we maintain a 95% accuracy rate across all tracked green spaces.',
  },
  {
    id: 6,
    question: 'How can I contribute?',
    answer:
      'There are several ways to contribute: 1) Report issues or inaccuracies through the contact form, 2) Request admin access if you have data to contribute, 3) Share Treecovery with others to increase awareness, 4) Provide feedback to help us improve the platform. We welcome contributions from citizens, researchers, and organizations committed to environmental transparency.',
  },
  {
    id: 7,
    question: 'Is it free to use?',
    answer:
      'Yes, Treecovery is completely free to use. All data is open and accessible to everyone. We believe that environmental information should be freely available to all citizens. There are no registration fees, subscription costs, or hidden charges. Simply visit the map and start exploring!',
  },
];

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span className="font-semibold text-lg text-neutral-charcoal pr-4">{faq.question}</span>
        <ChevronDown
          className={`flex-shrink-0 text-primary-emerald transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={24}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`faq-answer-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 text-neutral-charcoal/70 leading-relaxed border-t border-gray-100">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="overflow-x-hidden bg-neutral-offwhite">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-primary-forest to-primary-forest/90 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <HelpCircle size={64} className="text-primary-sage" />
          </motion.div>
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-primary-sage max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find answers to common questions about Treecovery
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <FAQAccordion faq={faq} />
              </motion.div>
            ))}
          </motion.div>

          {/* Still Have Questions */}
          <motion.div
            className="mt-16 p-8 bg-white rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-neutral-charcoal mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-neutral-charcoal/70 mb-6">
              Can't find the answer you're looking for? Please get in touch with our friendly team.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-primary-emerald text-white py-3 px-8 rounded-lg font-medium hover:bg-primary-forest transition-colors focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:ring-offset-2"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

