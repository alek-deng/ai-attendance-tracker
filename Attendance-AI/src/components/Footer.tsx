import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import ComingSoonModal from '@/components/ComingSoonModal';

const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Integrations', href: '#integrations' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contact@example.com', label: 'Email' },
  ];

  // modal state
  const [comingOpen, setComingOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('Coming soon');
  const [modalMessage, setModalMessage] = useState<string>(
    "This feature is coming soon. Stay tuned  we'll notify you once it's available."
  );

  const openComingFor = (name: string) => {
    setModalTitle(`${name} - Coming soon`);
    setModalMessage(
      `The "${name}" page/feature is coming soon. We're putting the finishing touches on this feature. Stay tuned  we'll notify you once it's available.`
    );
    setComingOpen(true);
  };

  const closeComing = () => setComingOpen(false);

  return (
    <>
      <footer className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <span className="font-bold text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  AI Attendance
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-4">
                Modern attendance tracking powered by artificial intelligence.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="p-2 bg-card rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => {
                  const isPricing = link.name.toLowerCase() === 'pricing';
                  if (isPricing) {
                    // Pricing opens the coming soon modal
                    return (
                      <li key={link.name}>
                        <button
                          onClick={() => openComingFor(link.name)}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                          aria-haspopup="dialog"
                        >
                          {link.name}
                        </button>
                      </li>
                    );
                  }

                   if (link.name.toLowerCase() === 'faq') {
                    return (
                      <li key={link.name}>
                        {/* Use Link so react-router navigates to the FQS page */}
                        <Link to="/fqs" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                          {link.name}
                        </Link>
                      </li>
                    );
                  }
                  // Other product links behave normally (anchor)
                  return (
                    <li key={link.name}>
                      <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                        {link.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    {/* All company links open coming soon */}
                    <button
                      onClick={() => openComingFor(link.name)}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                      aria-haspopup="dialog"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    {/* All resources links open coming soon */}
                    <button
                      onClick={() => openComingFor(link.name)}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                      aria-haspopup="dialog"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              © {new Date().getFullYear()} AI Attendance Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Coming soon modal */}
      <ComingSoonModal open={comingOpen} onClose={closeComing} title={modalTitle} message={modalMessage} />
    </>
  );
};

export default Footer;
