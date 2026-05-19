import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  ArrowRight,
  Zap
} from 'lucide-react';

interface MythCardProps {
  myth: string;
  fact: string;
  explanation: string;
  source: string;
  index: number;
}

const MythCard: React.FC<MythCardProps> = ({ myth, fact, explanation, source, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      className="perspective-1000 h-[450px] md:h-[550px] w-full group cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          mass: 1
        }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-[4rem] border border-brand-brown/5 shadow-soft p-10 md:p-14 flex flex-col justify-center items-center text-center gap-10 group-hover:shadow-luxury transition-all duration-700">
          <div className="p-5 bg-red-50 text-red-500 rounded-3xl group-hover:scale-110 transition-transform duration-700 group-hover:rotate-12">
            <AlertCircle className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-500/60 font-sans">Common Misconception</span>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-brand-brown leading-[0.9] tracking-tight px-4 italic">
            "{myth}"
          </h3>
          <div className="mt-10 flex items-center gap-4 text-brand-orange font-bold text-[10px] uppercase tracking-[0.5em] group-hover:gap-8 transition-all duration-500 opacity-40 group-hover:opacity-100">
            Reveal Analysis <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden bg-[#1A1512] rounded-[4rem] p-10 md:p-14 flex flex-col justify-center gap-12 text-brand-beige rotate-y-180 relative overflow-hidden shadow-luxury">
          {/* Animated Glow Effect */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.4, 1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none"
          />
          
          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400 font-sans">Clinical Verdict</span>
              </div>
              <p className="text-xl md:text-2xl font-display font-bold leading-tight tracking-tight">
                {fact}
              </p>
            </div>

            <div className="space-y-4 border-l-2 border-brand-orange/20 pl-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-orange">Evidence-Based Insight</h4>
              <p className="text-brand-beige/70 leading-relaxed font-light text-lg">
                {explanation}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/5 mt-auto flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-30">Journal Source</span>
              <span className="text-[10px] font-medium opacity-60 italic">{source}</span>
            </div>
            <div className="w-14 h-14 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <Zap className="w-6 h-6 text-brand-gold animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const MythBusters: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  const myths = [
    {
      myth: "Flat feet are always unhealthy and must be treated.",
      fact: "Many people naturally have flat feet and experience no pain or limitations.",
      explanation: "The structure of the foot arch varies naturally among individuals. Flat feet only become a concern when they cause symptoms such as pain, fatigue, or alignment issues during walking or standing.",
      source: "American Academy of Orthopaedic Surgeons (AAOS)"
    },
    {
      myth: "Heel pain means you just need new shoes.",
      fact: "Heel pain is often related to strain of the plantar fascia.",
      explanation: "The plantar fascia is a thick band of tissue that supports the arch of the foot. Repeated stress, prolonged standing, or tight calf muscles can irritate this tissue and cause pain near the heel, especially during the first steps in the morning.",
      source: "Mayo Clinic – Plantar Fasciitis"
    },
    {
      myth: "If your feet don’t hurt, they are perfectly healthy.",
      fact: "Some foot issues develop gradually and may not cause immediate pain.",
      explanation: "Problems such as overpronation, weak arch muscles, or poor alignment can slowly develop over time and may eventually lead to discomfort in the feet, knees, or ankles.",
      source: "American Podiatric Medical Association (APMA)"
    },
    {
      myth: "All insoles are the same.",
      fact: "Different insoles are designed for different needs.",
      explanation: "Some insoles focus on cushioning, others provide arch support, and some improve foot stability and alignment. The correct insole depends on foot structure and daily activity.",
      source: "American Orthopaedic Foot & Ankle Society (AOFAS)"
    },
    {
      myth: "Standing all day does not affect your feet.",
      fact: "Long periods of standing can increase stress on the feet and cause fatigue.",
      explanation: "The muscles and ligaments of the feet support the entire body weight while standing. Over time, prolonged standing can increase pressure on the heel and arch, leading to fatigue or discomfort.",
      source: "Canadian Centre for Occupational Health and Safety"
    },
    {
      myth: "Flat shoes are always better for foot health.",
      fact: "Shoes without proper support can sometimes increase strain on the foot.",
      explanation: "Supportive footwear helps distribute pressure across the foot and reduces stress on muscles and ligaments during walking and standing.",
      source: "Harvard Health Publishing"
    },
    {
      myth: "Running will ruin your knees and feet over time.",
      fact: "Proper running can actually increase bone density and strengthen tissues.",
      explanation: "Research indicates that recreational runners often have lower rates of knee osteoarthritis compared to sedentary individuals. The key is gradual progression and supportive footwear.",
      source: "Journal of Orthopaedic & Sports Physical Therapy"
    },
    {
      myth: "Barefoot walking on concrete is natural and healthy.",
      fact: "Modern hard surfaces lack the shock absorption of natural terrain.",
      explanation: "While walking barefoot on soft surfaces is beneficial, flat concrete provides no arch support or impact dispersion, potentially leading to fat pad atrophy.",
      source: "American Podiatric Medical Association (APMA)"
    },
    {
      myth: "The higher the arch support, the better the insole.",
      fact: "Excessive arch support can weaken the foot's natural shock absorption.",
      explanation: "An arch that is too high can lock the foot into a supinated position. Optimal support should mimic the natural contour without being overly rigid.",
      source: "British Journal of Sports Medicine (BJSM)"
    }
  ];

  return (
    <section id="myth-busters" ref={sectionRef} className="py-24 md:py-32 bg-brand-beige/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[100px] -mr-48 -mt-48" 
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] -ml-48 -mb-48" 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 px-6 py-2 bg-brand-brown text-brand-beige rounded-full text-[10px] font-bold uppercase tracking-[0.6em] mb-12"
          >
            Clinical Essentials
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black text-brand-brown mb-8 tracking-[-0.04em] leading-tight"
          >
            FOOT HEALTH <br />
            <span className="text-brand-orange italic font-bold">REVEALED<span className="text-brand-brown">.</span></span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-brand-taupe/60 max-w-2xl mx-auto font-light leading-relaxed px-4 md:px-0"
          >
            Insights for the urban walker.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {myths.map((item, index) => (
            <MythCard key={index} {...item} index={index} />
          ))}
        </div>

        {/* CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 md:mt-32 bg-brand-brown rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl group hover:scale-[1.02] transition-transform duration-500"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-brand-beige mb-6">
              Still unsure about your foot health?
            </h3>
            <p className="text-brand-beige/70 mb-10 max-w-xl mx-auto font-light">
              Take our structured assessment to identify potential issues and get personalized recommendations.
            </p>
            <a
              href="#quiz"
              className="inline-flex items-center gap-3 bg-brand-orange text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-brand-orange/90 transition-all shadow-xl hover:shadow-brand-orange/20 active:scale-95"
            >
              Start Your Assessment <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] md:text-xs text-brand-taupe/50 max-w-2xl mx-auto leading-relaxed italic">
            The information provided here is for educational purposes and should not replace professional medical advice. If you experience persistent foot pain, consult a qualified healthcare professional.
          </p>
        </div>
      </div>
    </section>
  );
};
