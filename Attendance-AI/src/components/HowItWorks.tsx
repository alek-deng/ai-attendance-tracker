import { Scan, Server, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: Scan,
    title: 'Face Scan',
    description: 'Students check in with facial recognition fast, touchless, and accurate.',
  },
  {
    icon: Server,
    title: 'FastAPI Backend',
    description: 'Real-time processing and secure data sync with your infrastructure.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Sync',
    description: 'Automated reports, Power BI dashboards, and CommCare integration.',
  },
];

const HowItWorks = () => {
  return (
    <section id="product" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps from check-in to insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all hover:-translate-y-2 group"
            >
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                {index + 1}
              </div>
              <div className="mb-6 inline-block p-4 bg-gradient-hero rounded-xl group-hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
