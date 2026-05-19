
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  ArrowRight,
  Info,
  Activity,
  ExternalLink
} from 'lucide-react';
import { Condition } from '../types';

interface ConditionComparisonProps {
  conditions: Condition[];
  onClose: () => void;
  onSelectCondition: (condition: Condition) => void;
}

export const ConditionComparison: React.FC<ConditionComparisonProps> = ({ 
  conditions, 
  onClose,
  onSelectCondition
}) => {
  if (conditions.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-brand-brown/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-brand-beige w-full max-w-7xl h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl relative flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-12 border-b border-brand-brown/5 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <span className="h-px w-6 md:w-8 bg-brand-orange" />
              <span className="text-brand-orange font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]">Comparison Tool</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-brand-brown">Condition Comparison</h2>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-brand-brown/5 hover:bg-brand-brown hover:text-brand-beige rounded-2xl transition-all group"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Exit Comparison</span>
            <X className="w-4 h-4 md:w-5 md:h-5 text-brand-taupe group-hover:text-brand-beige group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-6 md:p-12 bg-white/20">
          <div className={`grid gap-8 md:gap-12 min-w-[750px] md:min-w-[900px]`} style={{ gridTemplateColumns: `repeat(${conditions.length}, 1fr)` }}>
            {conditions.map((condition, idx) => (
              <motion.div 
                key={condition.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-14"
              >
                {/* Title & Short Desc */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-brown flex items-center justify-center text-brand-orange shadow-lg">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="bg-brand-brown/5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] text-brand-taupe">
                      Profile 0{idx + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-brand-brown tracking-tight leading-none">{condition.title}</h3>
                  <p className="text-sm text-brand-taupe/60 leading-relaxed font-light max-w-sm tracking-tight">{condition.shortDesc}</p>
                </div>

                {/* Common Causes Segment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-brand-brown/5 pb-2">
                    <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-taupe">Clinical Etiology</h4>
                  </div>
                  <ul className="space-y-4">
                    {condition.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-[13px] text-brand-taupe font-light leading-snug group">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DIY Support Segment */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-brand-brown/5 pb-4">
                    <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-taupe">DIY Support Protocols</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {condition.diySupport.map((tip, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-5 rounded-[1.5rem] border border-brand-brown/5 shadow-sm group hover:border-brand-orange/20 transition-all">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium text-brand-brown/80">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Types Segment */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-brand-brown/5 pb-4">
                    <div className="p-2 bg-brand-brown/5 rounded-xl text-brand-taupe">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-taupe">Product Intelligence</h4>
                  </div>
                  <div className="space-y-4">
                    {condition.products.slice(0, 3).map((product, idx) => (
                      <div key={idx} className="p-6 bg-brand-brown text-brand-beige rounded-[2rem] shadow-xl group cursor-pointer hover:bg-brand-orange transition-all duration-500">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 italic">Recommended</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                        </div>
                        <h5 className="text-[14px] font-bold leading-tight mb-2">{product.name}</h5>
                        <p className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity leading-relaxed font-light">{product.bestFor}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => onSelectCondition(condition)}
                  className="mt-auto w-full bg-brand-brown text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-orange transition-all flex items-center justify-center gap-4 group shadow-xl"
                >
                  Examine Protocol <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-8 bg-brand-brown text-brand-beige/60 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Comparison based on common clinical presentations</span>
          </div>
          <span>Comfoot Clinical Database v1.2</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
