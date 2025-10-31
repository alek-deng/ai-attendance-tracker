import { Fingerprint, Shield, Zap, TrendingUp, Link2, Users } from 'lucide-react';

const features = [
  {
    icon: Fingerprint,
    title: 'Facial Recognition Accuracy',
    description: 'Industry-leading AI models ensure 99%+ accuracy in diverse lighting conditions.',
  },
  {
    icon: Shield,
    title: 'Privacy Controls',
    description: 'On-device processing and encrypted data storage comply with education privacy standards.',
  },
  {
    icon: Zap,
    title: 'FastAPI Real-time Sync',
    description: 'Lightning-fast backend processing with instant attendance updates across devices.',
  },
  {
    icon: TrendingUp,
    title: 'Power BI Dashboards',
    description: 'Rich analytics and customizable reports for administrators and educators.',
  },
  {
    icon: Link2,
    title: 'CommCare Integration',
    description: 'Seamless data flow with CommCare for comprehensive student information systems.',
  },
  {
    icon: Users,
    title: 'Role-based Access',
    description: 'Granular permissions for lectures, admins, and students with audit trails.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for modern attendance management
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1"
            >
              <div className="mb-6 inline-block p-4 bg-gradient-hero rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
