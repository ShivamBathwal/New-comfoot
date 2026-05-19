import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Stethoscope, Search, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Precision Diagnosis",
    description: "Identify the root cause of your discomfort with our clinical-grade diagnostic engine.",
    icon: <Stethoscope className="w-8 h-8" />,
    color: "bg-brand-orange",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Expert Exploration",
    description: "Explore a database of 50+ conditions with curated relief protocols and product recommendations.",
    icon: <Search className="w-8 h-8" />,
    color: "bg-brand-brown",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Smart Tracking",
    description: "Monitor your recovery journey with our integrated journal and personalized pain maps.",
    icon: <Calendar className="w-8 h-8" />,
    color: "bg-brand-gold",
    image: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=800"
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-brand-brown/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-brand-beige w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-luxury relative flex flex-col md:flex-row h-[85vh] md:h-auto"
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 z-30 p-3 bg-white/10 backdrop-blur-md text-brand-brown rounded-full hover:bg-brand-orange hover:text-white transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-1/2 h-1/3 md:h-auto relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentStep}
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/80 via-transparent to-transparent opacity-60" />
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative bg-white/40">
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`w-16 h-16 ${steps[currentStep].color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl`}>
                  {steps[currentStep].icon}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-brown mb-6 leading-tight">
                  {steps[currentStep].title}
                </h2>
                
                <p className="text-lg md:text-xl text-brand-taupe/70 font-light leading-relaxed mb-12">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-auto pt-8 border-t border-brand-brown/5">
              {/* Stepper Dots */}
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentStep ? 'w-8 bg-brand-orange' : 'w-2 bg-brand-brown/10'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {currentStep < steps.length - 1 ? (
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-3 px-8 py-4 bg-brand-brown text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-orange transition-all group"
                  >
                    Next <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                ) : (
                  <button 
                    onClick={onComplete}
                    className="group flex items-center gap-3 px-10 py-4 bg-brand-orange text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Proof */}
          <div className="absolute bottom-8 left-16 right-16 flex items-center justify-center gap-6 opacity-30 pointer-events-none hidden md:flex">
             <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[8px] font-bold uppercase tracking-widest">Clinical Protocol</span>
             </div>
             <div className="w-px h-4 bg-brand-brown/20" />
             <div className="text-[8px] font-bold uppercase tracking-widest italic">Reinvisioned 2.6</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
