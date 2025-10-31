import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';

const securityFeatures = [
  { icon: Lock, text: 'End-to-end encryption for all attendance data' },
  { icon: Eye, text: 'On-device face processing—images never leave your network' },
  { icon: Server, text: 'GDPR and FERPA compliant data handling' },
  { icon: ShieldCheck, text: 'Regular security audits and penetration testing' },
];

const Security = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Security & Privacy First
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with enterprise-grade security and student privacy protection at its core
            </p>
          </div>

          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-large border border-border">
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We understand the sensitivity of biometric data in educational settings. Our AI Attendance Tracker
              uses edge processing and advanced encryption to ensure student privacy while delivering accurate,
              real-time attendance tracking.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-hero rounded-lg flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground leading-relaxed pt-2">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
