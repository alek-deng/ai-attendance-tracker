import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";
import founderImage1 from "@/assets/founderImage1.jpeg";
import founderImage2 from "@/assets/founderImage2.jpeg"; 
import founderImage3 from "@/assets/founderImage3.jpeg";
import founderImage4 from "@/assets/founderImage4.jpeg";
import ComingSoonModal from "@/components/ComingSoonModal";

const Hero: React.FC = () => {
  const [comingOpen, setComingOpen] = useState(false);

  function openComing() {
    setComingOpen(true);
  }
  function closeComing() {
    setComingOpen(false);
  }

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="animate-fade-in">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Automate Attendance with{" "}
              <span className="text-primary">AI Recognition</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Transform student tracking with facial recognition. Real-time sync,
              powerful analytics, and seamless integration with your existing
              systems.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Request Demo -> opens coming soon */}
              <Button
                size="lg"
                className="group hover:-translate-y-1 transition-all shadow-medium hover:shadow-large"
                onClick={openComing}
                aria-haspopup="dialog"
              >
                <div className="flex items-center">
                  Request Demo
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="ml-3 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 font-medium">
                  Coming soon
                </span>
              </Button>

              {/* View Docs -> opens coming soon */}
              <Button
                variant="outline"
                size="lg"
                className="hover:-translate-y-1 transition-all"
                onClick={openComing}
                aria-haspopup="dialog"
              >
                <div className="flex items-center">
                  <FileText className="mr-2 w-4 h-4" />
                  View Docs
                </div>

                <span className="ml-3 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 font-medium">
                  Coming soon
                </span>
              </Button>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative animate-slide-in">
            <div className="absolute inset-0 bg-gradient-hero rounded-3xl -rotate-3 scale-105" />
            <div className="relative rounded-3xl overflow-hidden shadow-large border border-border animate-float">
              <img
                src={heroDashboard}
                alt="AI Attendance Dashboard showing student faces and attendance tracking"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Founders Section */}
        <div className="mt-20 animate-fade-in">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Founded by
            </p>
            <h3 className="text-xl font-semibold">
              Passionate Innovators in Education Technology
             
            </h3>
            <p className="ml-3 inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 font-medium"> coming soon</p>
          </div>
          
      {/*   <div className="flex justify-center items-center gap-8">
            
            <div className="text-center">
              <img 
                src={founderImage1} 
                alt="Founder Name" 
                className="w-20 h-20 rounded-full border-2 border-border mx-auto mb-3 object-cover"
              />
              <p className="font-medium">ALEK-DENG</p>
              <p className="text-sm text-muted-foreground">Role</p>
            </div>

           
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-border mx-auto mb-3 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Image 2</span>
              </div>
              <p className="font-medium">CARTONA</p>
              <p className="text-sm text-muted-foreground">Role</p>
            </div>

           
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-border mx-auto mb-3 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Image 3</span>
              </div>
              <p className="font-medium">JOHN-NJENGA</p>
              <p className="text-sm text-muted-foreground">Role</p>
            </div>

            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-border mx-auto mb-3 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Image 4</span>
              </div>
              <p className="font-medium">DEV-MANDAVIA</p>
              <p className="text-sm text-muted-foreground">Role</p>
            </div>
          </div>  */} 

        </div>
      </div>

      {/* Coming soon modal */}
      <ComingSoonModal
        open={comingOpen}
        onClose={closeComing}
        title="Coming soon"
        message="We're putting the finishing touches on this feature. Stay tuned  we'll notify you once it's available."
      />
    </section>
  );
};

export default Hero;