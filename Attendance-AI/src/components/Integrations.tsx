const integrations = [
  { name: 'FastAPI', color: 'bg-emerald-500' },
  { name: 'Power BI', color: 'bg-yellow-500' },
  { name: 'CommCare', color: 'bg-blue-500' },
];

const Integrations = () => {
  return (
    <section id="integrations" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Seamless Integrations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with the tools you already use
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 max-w-3xl mx-auto">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl px-8 py-4 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${integration.color} group-hover:scale-125 transition-transform`} />
                <span className="text-lg font-semibold">{integration.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
