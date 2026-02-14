import { motion } from 'framer-motion';
import { Database, MapPin, Camera, CheckCircle, Users, FileText, BarChart3 } from 'lucide-react';
import Footer from '../components/Footer';

const methodologySteps = [
  {
    icon: MapPin,
    title: 'Field Surveys',
    description:
      'Trained personnel conduct on-site surveys using GPS-enabled devices to accurately record tree locations, species, and conditions. Each survey includes photo documentation and detailed notes.',
  },
  {
    icon: Camera,
    title: 'Photo Documentation',
    description:
      'Every green space is documented with multiple photographs showing different angles and conditions. Photos are timestamped and geotagged for verification purposes.',
  },
  {
    icon: Database,
    title: 'Data Entry',
    description:
      'Survey data is entered into our database with standardized fields for species (in Russian, Kazakh, English, and scientific names), coordinates, planting dates, and maintenance status.',
  },
  {
    icon: CheckCircle,
    title: 'Quality Control',
    description:
      'All entries undergo automated validation checks and manual review. We verify GPS coordinates, cross-reference species names, and ensure data completeness before publication.',
  },
  {
    icon: Users,
    title: 'Community Contributions',
    description:
      'Verified admins can contribute data through CSV uploads or manual entry. All contributions are reviewed and validated before being added to the public database.',
  },
  {
    icon: BarChart3,
    title: 'Regular Audits',
    description:
      'We conduct regular audits of our database to identify and correct inaccuracies. Users can report issues, which are investigated and resolved promptly.',
  },
];

const dataFields = [
  { field: 'Location', description: 'GPS coordinates (latitude, longitude) with accuracy within 5 meters' },
  { field: 'Species', description: 'Tree species in multiple languages (Russian, Kazakh, English, Scientific)' },
  { field: 'Planting Date', description: 'Date when the tree was planted (if known)' },
  { field: 'Status', description: 'Current condition: Healthy, Damaged, Dead, or Unknown' },
  { field: 'Responsible Organization', description: 'Organization responsible for maintenance (if applicable)' },
  { field: 'Notes', description: 'Additional information, observations, or maintenance history' },
];

export default function MethodologyPage() {
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
            Methodology
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-primary-sage max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            How we collect, verify, and maintain accurate green space data
          </motion.p>
        </div>
      </section>

      {/* Data Collection Methodology */}
      <section className="py-20 px-6 bg-white" aria-labelledby="collection-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="collection-heading" className="text-4xl md:text-5xl font-bold mb-8 text-neutral-charcoal">
              Data Collection Process
            </h2>
            <p className="text-lg text-neutral-charcoal/70 leading-relaxed mb-12">
              Our methodology ensures accuracy, transparency, and verifiability at every step. 
              We combine field surveys, technology, and community contributions to build the 
              most comprehensive green space database in Kazakhstan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {methodologySteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={index}
                    className="bg-neutral-offwhite rounded-xl p-6 hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-primary-emerald flex items-center justify-center">
                          <IconComponent className="text-white" size={24} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-charcoal mb-2">{step.title}</h3>
                        <p className="text-neutral-charcoal/70 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data Fields Section */}
      <section className="py-20 px-6 bg-sage-gradient" aria-labelledby="fields-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="fields-heading" className="text-4xl md:text-5xl font-bold mb-8 text-neutral-charcoal">
              Data Fields
            </h2>
            <p className="text-lg text-neutral-charcoal/70 leading-relaxed mb-8">
              Each green space record includes standardized fields to ensure consistency and 
              enable accurate analysis and reporting.
            </p>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {dataFields.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-6 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-4">
                      <FileText className="text-primary-emerald flex-shrink-0 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold text-lg text-neutral-charcoal mb-1">{item.field}</h3>
                        <p className="text-neutral-charcoal/70">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="py-20 px-6 bg-white" aria-labelledby="contribute-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="contribute-heading" className="text-4xl md:text-5xl font-bold mb-8 text-neutral-charcoal">
              How to Contribute
            </h2>
            <div className="space-y-6 text-lg text-neutral-charcoal/70 leading-relaxed">
              <p>
                We welcome contributions from organizations, researchers, and verified individuals 
                who can provide accurate green space data. Here's how you can contribute:
              </p>

              <div className="bg-neutral-offwhite rounded-xl p-8 space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-3">1. Request Admin Access</h3>
                  <p>
                    Contact us through our{' '}
                    <a href="/contact" className="text-primary-emerald hover:underline font-medium">
                      Contact page
                    </a>{' '}
                    with information about your organization and the data you'd like to contribute. 
                    We review each request to ensure data quality.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-3">2. CSV Upload</h3>
                  <p>
                    Once approved, admins can upload CSV files with green space data. The CSV must 
                    follow our standardized format with required fields. Our system validates the 
                    data before importing.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-3">3. Manual Entry</h3>
                  <p>
                    Admins can also manually add individual green spaces through our web interface. 
                    This is useful for small additions or corrections to existing records.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-3">4. Report Issues</h3>
                  <p>
                    If you notice inaccuracies or missing data, you can report them through our 
                    contact form. We investigate all reports and update records as needed.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data Accuracy */}
      <section className="py-20 px-6 bg-neutral-offwhite" aria-labelledby="accuracy-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="accuracy-heading" className="text-4xl md:text-5xl font-bold mb-8 text-neutral-charcoal">
              Data Accuracy
            </h2>
            <div className="space-y-6 text-lg text-neutral-charcoal/70 leading-relaxed">
              <p>
                We maintain high standards for data accuracy through multiple verification methods:
              </p>

              <ul className="space-y-4 list-disc list-inside ml-4">
                <li>
                  <strong>GPS Verification:</strong> All locations are verified using GPS coordinates 
                  with accuracy within 5 meters. We cross-reference coordinates with satellite imagery 
                  when available.
                </li>
                <li>
                  <strong>Species Validation:</strong> Tree species are verified against botanical 
                  databases and expert review. We maintain a reference database of valid species names.
                </li>
                <li>
                  <strong>Photo Documentation:</strong> Every record includes photo documentation 
                  that can be reviewed for verification.
                </li>
                <li>
                  <strong>Regular Audits:</strong> We conduct regular audits of our database, 
                  checking for inconsistencies, duplicates, and inaccuracies.
                </li>
                <li>
                  <strong>Community Feedback:</strong> Users can report issues, which are 
                  investigated and resolved promptly.
                </li>
              </ul>

              <div className="bg-primary-emerald/10 border-l-4 border-primary-emerald p-6 rounded-r-lg mt-8">
                <p className="text-neutral-charcoal font-medium">
                  <strong>Current Accuracy Rate:</strong> 95% across all tracked green spaces
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 px-6 bg-white" aria-labelledby="technical-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="technical-heading" className="text-4xl md:text-5xl font-bold mb-8 text-neutral-charcoal">
              Technical Details
            </h2>
            <div className="space-y-6 text-lg text-neutral-charcoal/70 leading-relaxed">
              <p>
                Treecovery is built on modern, open-source technologies to ensure reliability, 
                scalability, and transparency:
              </p>

              <div className="bg-neutral-offwhite rounded-xl p-8 space-y-4">
                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-2">Database</h3>
                  <p>PostgreSQL database hosted on Supabase, with Row Level Security (RLS) policies for data access control.</p>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-2">API</h3>
                  <p>RESTful API built with Node.js and Express, providing endpoints for data access, authentication, and administration.</p>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-2">Frontend</h3>
                  <p>React-based web application with TypeScript, using Leaflet for interactive maps and Tailwind CSS for styling.</p>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-neutral-charcoal mb-2">Data Format</h3>
                  <p>All data is stored in standardized formats and can be exported as CSV or JSON. The database schema is publicly documented.</p>
                </div>
              </div>

              <p className="mt-6">
                For developers interested in integrating with our API or contributing to the codebase, 
                please{' '}
                <a href="/contact" className="text-primary-emerald hover:underline font-medium">
                  contact us
                </a>{' '}
                for API documentation and access.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

