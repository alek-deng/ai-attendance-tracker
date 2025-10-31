// src/pages/FQS.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComingSoonModal from "@/components/ComingSoonModal";
import { Button } from "@/components/ui/button";

type FAQItem = {
  q: string;
  a: string | React.ReactNode;
};

const faqData: FAQItem[] = [
  {
    q: "How does AI-based attendance work?",
    a: (
      <>
        We use face embeddings to recognize enrolled students locally in the browser (privacy-first). Teachers start a session, the
        camera matches faces against enrolled profiles, and attendance is recorded. 
      </>
    ),
  },
  {
    q: "Is student data stored securely?",
    a: (
      <>
        Yes in the production system, store only face <em>descriptors</em> (numeric vectors) and protect them at rest with proper database
        encryption and access controls. Obtain explicit consent from students before enrollment.
      </>
    ),
  },
  {
    q: "What happens if recognition fails (masks/poor lighting)?",
    a: (
      <>
        Teachers get a live list of unmatched faces and can manually mark attendance as a fallback. The system also supports manual overrides.
      </>
    ),
  },
  {
    q: "Can I export attendance to CSV?",
    a: "Yes sessions can be exported to CSV for offline processing or integration with school MIS systems.",
  },
];

const SectionTitle: React.FC<{ id?: string; title: string; subtitle?: string }> = ({ id, title, subtitle }) => (
  <div id={id} className="mb-6">
    <h2 className="text-2xl md:text-3xl font-semibold mb-1">{title}</h2>
    {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
  </div>
);

const FQS: React.FC = () => {
  const location = useLocation();
  const [comingOpen, setComingOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Coming soon");
  const [modalMessage, setModalMessage] = useState(
    "This feature is coming soon. We're putting the finishing touches on this feature. Stay tuned we'll notify you once it's available."
  );

  // contact demo state
  const [email, setEmail] = useState("");
  const [contactSaved, setContactSaved] = useState(false);

  // Smooth scroll to anchor on mount or when location.hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        // small timeout to allow layout/paint to settle
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // focus for accessibility
          (el as HTMLElement).focus?.();
        }, 80);
      }
    } else {
      // scroll to top for fresh page navigations
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.hash]);

  function openComingFor(name: string) {
    setModalTitle(`${name} -Coming soon`);
    setModalMessage(
      `The "${name}" page/feature is coming soon. We're putting the finishing touches on this feature. Stay tuned we'll notify you once it's available.`
    );
    setComingOpen(true);
  }

  function closeComing() {
    setComingOpen(false);
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      alert("Please provide a valid email address.");
      return;
    }
    const existing = JSON.parse(localStorage.getItem("demo_signups") || "[]");
    existing.push({ email, createdAt: new Date().toISOString() });
    localStorage.setItem("demo_signups", JSON.stringify(existing));
    setEmail("");
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 3000);
  }

  return (
    <>
      {/* Navbar (same as other pages) */}
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-14" role="main">
        {/* Page header */}
        <header className="max-w-3xl mx-auto text-center mt-10 mb-10">

          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Answers to common questions about the Smart Attendance system. Can't find what you're looking for? Reach out using the contact
            form below.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <SectionTitle id="features" title="Features" subtitle="What the system can do today" />
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Real-time attendance using face recognition</li>
                <li>• Teacher manual override & session management</li>
                <li>• Export attendance to CSV</li>
                <li>• Role-based access (admin, teacher/lecture)</li>
              </ul>
              <div className="mt-4">
                <Button onClick={() => openComingFor("Features")} className="bg-primary text-primary-foreground">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <SectionTitle id="integrations" title="Integrations" subtitle="Connect with your tools" />
              <p className="text-sm text-muted-foreground">
                Connect with your student information system, messaging services, or LMS. We support CSV export and webhooks in the roadmap.
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={() => openComingFor("Integrations")}>
                  View integrations
                </Button>
                <Button onClick={() => openComingFor("Pricing")} className="bg-accent text-accent-foreground">
                  Pricing
                </Button>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <h3 className="font-medium mb-2">Quick links</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <a href="#faq" className="text-muted-foreground hover:text-primary">
                  Jump to FAQ
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-primary">
                  Contact us
                </a>
                <a
                  href="#docs"
                  onClick={(e) => {
                    e.preventDefault();
                    openComingFor("Documentation");
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  Documentation
                </a>
              </nav>
            </div>
          </div>

          {/* Center column: FAQ accordion */}
          <div className="lg:col-span-1 col-span-1">
            <div className="bg-card p-6 rounded-2xl shadow-medium border border-border">
              <SectionTitle id="faq" title="General FAQ" />
              <div className="space-y-3">
                {faqData.map((item, idx) => (
                  <details key={idx} className="group bg-muted/40 rounded-lg p-4" role="region">
                    <summary className="cursor-pointer list-none font-medium flex justify-between items-center">
                      <span>{item.q}</span>
                      <span className="text-sm text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <div className="mt-3 text-sm text-muted-foreground">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <SectionTitle id="docs" title="Documentation & API" subtitle="Developer resources" />
              <p className="text-sm text-muted-foreground mb-4">API Reference and integration guides will be published here.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => openComingFor("API Reference")}>
                  API Reference
                </Button>
                <Button onClick={() => openComingFor("Documentation")} className="bg-primary text-primary-foreground">
                  Documentation
                </Button>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <SectionTitle id="legal" title="Privacy & Terms" subtitle="Legal documents" />
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => openComingFor("Privacy Policy")}
                    className="text-muted-foreground hover:text-primary text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openComingFor("Terms of Service")}
                    className="text-muted-foreground hover:text-primary text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>

           {/* <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <SectionTitle id="contact" title="Contact & Demo Request" subtitle="Drop your email for updates" />
              <form onSubmit={handleContactSubmit} className="mt-3 space-y-3">
                <label className="block text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-2 rounded-md bg-input"
                  placeholder="you@school.edu"
                />
                <div className="flex items-center gap-3">
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Notify me
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmail("");
                      setContactSaved(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
                {contactSaved && <div className="text-sm text-green-600">Thanks — we saved your request.</div>}
              </form>
            </div>  */}
          </div>
        </div>

       
      </main>

      {/* Footer (same as other pages) */}
      <Footer />

      {/* Coming soon modal */}
      <ComingSoonModal open={comingOpen} onClose={closeComing} title={modalTitle} message={modalMessage} />
    </>
  );
};

export default FQS;
