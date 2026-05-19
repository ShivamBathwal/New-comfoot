import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Info, X, Target, Activity, Zap, ShieldCheck, Search, ArrowRight } from 'lucide-react';

interface PainZone {
  id: string;
  name: string;
  title: string;
  description: string;
  tips: string[];
  position: { top: string; left: string };
  icon: React.ElementType;
  color: string;
}

const painZones: PainZone[] = [
  {
    id: 'heel',
    name: 'Heel',
    title: 'Heel Pain Guide',
    description: 'Often caused by Plantar Fasciitis, heel pain is one of the most common foot complaints. It typically feels like a sharp stab in the bottom of your foot.',
    tips: [
      'Use orthotics with deep heel cups',
      'Perform calf and foot stretches daily',
      'Avoid walking barefoot on hard surfaces',
      'Look for shoes with superior shock absorption'
    ],
    position: { top: '75%', left: '48%' },
    icon: Target,
    color: 'text-rose-500'
  },
  {
    id: 'arch',
    name: 'Arch',
    title: 'Flat Feet & Arch Support',
    description: 'Pain in the arch often indicates overpronation or fallen arches. This can lead to fatigue and pain that radiates up to the knees and hips.',
    tips: [
      'Choose shoes with firm arch support',
      'Look for stability or motion control features',
      'Strengthen foot muscles with "towel curls"',
      'Ensure proper shoe width to prevent compression'
    ],
    position: { top: '55%', left: '42%' },
    icon: Activity,
    color: 'text-emerald-500'
  },
  {
    id: 'ball',
    name: 'Ball of Foot',
    title: 'Metatarsalgia Guide',
    description: 'Pain and inflammation in the ball of your foot can make every step feel like walking on pebbles. It is common in athletes and those wearing ill-fitting shoes.',
    tips: [
      'Use metatarsal pads to redistribute pressure',
      'Choose shoes with a wide toe box',
      'Avoid high heels or narrow-pointed shoes',
      'Opt for maximum forefoot cushioning'
    ],
    position: { top: '30%', left: '50%' },
    icon: Zap,
    color: 'text-amber-500'
  },
  {
    id: 'ankle',
    name: 'Ankle',
    title: 'Stability & Support',
    description: 'Ankle pain or instability can lead to frequent sprains. Proper support is crucial for maintaining alignment and preventing long-term joint issues.',
    tips: [
      'Look for high-top or supportive collars',
      'Choose shoes with a firm heel counter',
      'Balance training to improve proprioception',
      'Compression sleeves for mild swelling'
    ],
    position: { top: '85%', left: '65%' },
    icon: ShieldCheck,
    color: 'text-sky-500'
  }
];

const ScanningLine = () => (
  <motion.div
    animate={{ top: ['0%', '100%', '0%'] }}
    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    className="absolute left-0 right-0 h-0.5 bg-brand-orange/30 z-20 pointer-events-none shadow-[0_0_15px_rgba(242,125,38,0.5)]"
  />
);

export const FootPainMap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<PainZone | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  return (
    <section id="pain-map" className="section-padding bg-brand-beige/20 rounded-[3rem] my-24 relative overflow-hidden border border-brand-brown/5">
      {/* HUD Decorative Elements */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 opacity-40">
        <div className="text-[8px] font-mono text-brand-brown uppercase tracking-widest">Diagnostic HUD v2.4</div>
        <div className="text-[8px] font-mono text-brand-brown uppercase tracking-widest">Status: {isScanning ? 'Scanning...' : 'Analysis Ready'}</div>
      </div>
      <div className="absolute bottom-8 right-8 flex flex-col gap-1 opacity-40 text-right">
        <div className="text-[8px] font-mono text-brand-brown uppercase tracking-widest">Coordinates: [34.05, -118.24]</div>
        <div className="text-[8px] font-mono text-brand-brown uppercase tracking-widest">Sensor: Active</div>
      </div>

      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-brand-orange/20"
        >
          <Search className="w-3 h-3" /> Interactive Diagnostic
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold text-brand-brown mb-6"
        >
          Where does it <span className="text-brand-orange italic">hurt?</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-brand-taupe max-w-2xl mx-auto text-lg font-light leading-relaxed"
        >
          Click on the areas of the foot below to discover tailored advice and the right support for your specific needs.
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Interactive Foot Diagram */}
        <div className="relative aspect-[4/5] max-w-md mx-auto w-full bg-white rounded-[3rem] p-12 flex items-center justify-center overflow-hidden border border-brand-brown/5 shadow-xl group">
          <ScanningLine />
          
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* Simple Stylized Foot SVG */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Heatmap Glow */}
            <AnimatePresence>
              {selectedZone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 blur-[40px] opacity-30 pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle at ${selectedZone.position.left} ${selectedZone.position.top}, var(--brand-orange), transparent 50%)`
                  }}
                />
              )}
            </AnimatePresence>

            <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-2xl relative z-10">
              <motion.path 
                animate={{ 
                  stroke: selectedZone ? '#F27D26' : '#5B4A3A',
                  strokeWidth: selectedZone ? 3 : 2
                }}
                d="M100,280 C60,280 40,250 40,200 C40,150 60,120 80,100 C90,90 95,70 95,50 C95,30 110,20 120,20 C135,20 150,40 150,70 C150,100 140,130 140,160 C140,200 150,230 150,260 C150,280 130,280 100,280 Z" 
                fill="white" 
                className="transition-colors duration-500"
              />
              {/* Toes (Simplified) */}
              <circle cx="120" cy="35" r="15" fill="white" stroke="#5B4A3A" strokeWidth="1.5" />
              <circle cx="145" cy="55" r="10" fill="white" stroke="#5B4A3A" strokeWidth="1.5" />
              <circle cx="155" cy="85" r="8" fill="white" stroke="#5B4A3A" strokeWidth="1.5" />
              <circle cx="158" cy="115" r="7" fill="white" stroke="#5B4A3A" strokeWidth="1.5" />
              <circle cx="155" cy="145" r="6" fill="white" stroke="#5B4A3A" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Interaction Points */}
          {painZones.map((zone) => {
            const Icon = zone.icon;
            const isSelected = selectedZone?.id === zone.id;
            
            return (
              <button
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  setIsScanning(false);
                }}
                className={`absolute group z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500`}
                style={{ top: zone.position.top, left: zone.position.left }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Constant Subtle Pulse for Inactive Zones */}
                  {!isSelected && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: Math.random() * 2 // Stagger the pulses
                      }}
                      className="absolute w-12 h-12 rounded-full bg-brand-orange/40 pointer-events-none"
                    />
                  )}

                  {/* Active/Hover Pulse Rings */}
                  <div className={`absolute w-16 h-16 rounded-full bg-brand-orange/20 animate-ping ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  <div className={`absolute w-10 h-10 rounded-full border border-brand-orange/30 animate-pulse ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  
                  {/* Main Marker */}
                  <div className={`w-10 h-10 rounded-2xl border-2 border-white shadow-2xl transition-all duration-500 flex items-center justify-center ${isSelected ? 'bg-brand-orange scale-110 rotate-12 shadow-[0_0_20px_rgba(242,125,38,0.4)]' : 'bg-brand-brown group-hover:bg-brand-orange group-hover:rotate-6 shadow-lg'}`}>
                    <Icon className={`w-5 h-5 text-white`} />
                  </div>
                  
                  {/* Label */}
                  <div className={`absolute left-full ml-4 px-4 py-2 bg-brand-brown text-white text-[10px] font-bold uppercase tracking-widest rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pointer-events-none shadow-2xl z-40`}>
                    {zone.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Guide Content */}
        <div className="min-h-[450px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {selectedZone ? (
              <motion.div
                key={selectedZone.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-brand-brown/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <button 
                  onClick={() => {
                    setSelectedZone(null);
                    setIsScanning(true);
                  }}
                  className="absolute top-8 right-8 p-3 bg-brand-beige/50 hover:bg-brand-orange hover:text-white rounded-full transition-all z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-5 mb-10">
                  <div className={`w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange`}>
                    <selectedZone.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-orange mb-1 block">Diagnostic Result</span>
                    <h3 className="text-3xl font-display font-bold text-brand-brown">{selectedZone.title}</h3>
                  </div>
                </div>

                <p className="text-brand-taupe text-lg leading-relaxed mb-10 font-light">
                  {selectedZone.description}
                </p>

                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-brown border-b border-brand-brown/10 pb-3">Recommended Care Protocol:</h4>
                  <ul className="grid gap-4">
                    {selectedZone.tips.map((tip, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 text-brand-taupe group"
                      >
                        <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <span className="text-sm leading-relaxed">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-12 w-full py-5 bg-brand-brown text-brand-beige rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-brand-orange transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  Shop Targeted Solutions
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-16 border-2 border-dashed border-brand-brown/10 rounded-[3rem] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm"
              >
                <div className="w-24 h-24 rounded-full bg-brand-beige flex items-center justify-center mb-8 relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 bg-brand-orange/10 rounded-full"
                  />
                  <Target className="w-10 h-10 text-brand-orange/40 relative z-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-brand-brown mb-4">Select a Pain Point</h3>
                <p className="text-brand-taupe/70 max-w-xs mx-auto font-light leading-relaxed">
                  Click the interactive markers on the foot diagram to begin your diagnostic analysis.
                </p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-orange animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                  System Ready
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
