import { Leaf, Github, Mail, Twitter, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: typeof Github;
  label: string;
  href: string;
}

const getFooterLinks = (t: (key: string) => string): FooterLink[] => [
  { label: t('common.about'), href: '/about' },
  { label: t('common.contact'), href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Methodology', href: '/methodology' },
];

const socialLinks: SocialLink[] = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/treecovery',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:info@treecovery.kz',
  },
  {
    icon: Twitter,
    label: 'Twitter',
    href: 'https://twitter.com/treecovery',
  },
];

export default function Footer() {
  const { t } = useTranslation();
  const footerLinks = getFooterLinks(t);
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-primary-forest text-white"
      role="contentinfo"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Column 1: Logo and Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf
                size={32}
                className="text-primary-sage"
                aria-hidden="true"
              />
              <span className="text-2xl font-bold">Treecovery</span>
            </div>
            <p className="text-primary-sage leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-primary-sage hover:text-white hover:underline transition-all duration-200 inline-block"
                      aria-label={`Navigate to ${link.label}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.connectWithUs')}</h3>
            <nav aria-label="Social media links">
              <ul className="flex space-x-6">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        className="text-primary-sage hover:text-white transition-colors duration-200 inline-block hover:scale-110 transform"
                        aria-label={`Visit our ${social.label}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconComponent
                          size={24}
                          strokeWidth={1.5}
                          className="stroke-current"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section: Copyright */}
      <div className="border-t border-primary-sage/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-primary-sage flex items-center justify-center gap-1 flex-wrap">
            <span>&copy; {currentYear} Treecovery.</span>
            <span className="flex items-center gap-1">
              {t('footer.madeWithLove')}
              <Heart
                size={14}
                className="text-red-400 fill-red-400 inline-block"
                aria-label="love"
              />
              {t('footer.forKazakhstan')}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
