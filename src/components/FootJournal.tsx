import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Activity, 
  Zap, 
  Info, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Search,
  Check
} from 'lucide-react';
import { db, auth, handleFirestoreError } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  painLevel: number;
  symptoms: string[];
  notes: string;
  activityLevel: 'low' | 'moderate' | 'high';
  createdAt: any;
}

const SYMPTOMS_LIST = [
  "Sharp Heel Pain", "Arch Aching", "Big Toe Bump", "Numbness", "Tingling", 
  "Ankle Stiffness", "Swelling", "Burning Sensation", "Morning Pain", "Exercise Pain"
];

export const FootJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form State
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    painLevel: 5,
    symptoms: [] as string[],
    notes: '',
    activityLevel: 'moderate' as 'low' | 'moderate' | 'high'
  });

  // Derive unique previous symptoms
  const previousSymptoms = React.useMemo(() => {
    const allSymptoms = entries.flatMap(e => e.symptoms);
    return Array.from(new Set(allSymptoms));
  }, [entries]);

  // Filtered suggestions
  const suggestions = React.useMemo(() => {
    const combined = Array.from(new Set([...SYMPTOMS_LIST, ...previousSymptoms]));
    if (!symptomSearch.trim()) return [];
    return combined.filter(s => 
      s.toLowerCase().includes(symptomSearch.toLowerCase()) && 
      !newEntry.symptoms.includes(s)
    ).slice(0, 5);
  }, [symptomSearch, previousSymptoms, newEntry.symptoms]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'journal'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[];
      setEntries(entryData);
      setLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const path = `users/${auth.currentUser.uid}/journal`;
    try {
      await addDoc(collection(db, path), {
        ...newEntry,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setSymptomSearch('');
      setShowSuggestions(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        painLevel: 5,
        symptoms: [],
        notes: '',
        activityLevel: 'moderate'
      });
    } catch (error) {
      handleFirestoreError(error, 'create', path);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/journal/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, 'delete', path);
    }
  };

  const getPainIcon = (level: number) => {
    if (level <= 3) return <TrendingDown className="text-emerald-500 w-5 h-5" />;
    if (level <= 7) return <Minus className="text-amber-500 w-5 h-5" />;
    return <TrendingUp className="text-rose-500 w-5 h-5" />;
  };

  return (
    <section id="journal" className="py-24 px-6 bg-brand-beige/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-px bg-brand-orange" />
              <span className="text-brand-orange font-bold uppercase tracking-[0.6em] text-[10px]">Your Momentum Journal</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-black text-brand-brown tracking-[-0.04em] leading-tight">
              FOOT HEALTH <br />
              <span className="text-brand-orange italic font-bold">JOURNAL<span className="text-brand-brown">.</span></span>
            </h2>
            <p className="text-base md:text-lg text-brand-taupe/60 mt-8 font-light leading-relaxed max-w-xl">
              Track symptoms, pain levels, and activity to identify clinical patterns for your wellness journey.
            </p>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-brand-orange text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-brown transition-all shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
            New Entry
          </button>
        </div>

        {/* Journal Entries List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
          </div>
        ) : entries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {entries.map((entry) => (
                <motion.div 
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-brand-brown/5 shadow-soft hover:shadow-xl transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-beige rounded-xl flex items-center justify-center text-brand-brown">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">Date</span>
                        <p className="text-sm font-bold text-brand-brown">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-brand-taupe/40 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-brand-beige/30 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3.5 h-3.5 text-brand-orange" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-taupe/60">Pain Level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-display font-bold text-brand-brown">{entry.painLevel}/10</span>
                        {getPainIcon(entry.painLevel)}
                      </div>
                    </div>
                    <div className="bg-brand-beige/30 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 text-brand-brown" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-taupe/60">Activity</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-brown">{entry.activityLevel}</span>
                    </div>
                  </div>

                  {entry.symptoms.length > 0 && (
                    <div className="mb-6">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-taupe/60 block mb-3">Symptoms</span>
                      <div className="flex flex-wrap gap-2">
                        {entry.symptoms.map((s, i) => (
                          <span key={i} className="text-[9px] font-bold uppercase tracking-widest bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.notes && (
                    <div className="mt-auto pt-6 border-t border-brand-brown/5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-taupe/60 block mb-2">Notes</span>
                      <p className="text-xs text-brand-taupe leading-relaxed line-clamp-3 italic">"{entry.notes}"</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-brand-brown/5 shadow-soft">
            <div className="w-20 h-20 bg-brand-beige rounded-full flex items-center justify-center mx-auto mb-6 text-brand-taupe/40">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-brown mb-2">No entries yet</h3>
            <p className="text-brand-taupe/60 font-light mb-8">Start logging your daily foot health to see trends.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-brand-orange font-bold uppercase tracking-widest text-xs flex items-center gap-2 mx-auto hover:gap-3 transition-all"
            >
              Log Your First Entry <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Entry Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-brand-brown/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-brand-beige w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl relative p-6 sm:p-8 md:p-12 custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-8 sm:mb-10">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-brand-brown">New Journal Entry</h3>
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setSymptomSearch('');
                      setShowSuggestions(false);
                    }}
                    className="p-3 bg-brand-brown/5 hover:bg-brand-brown/10 rounded-full transition-all"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleAddEntry} className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">Date</label>
                      <input 
                        type="date" 
                        required
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                        className="w-full bg-white border border-brand-brown/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">Activity Level</label>
                      <select 
                        value={newEntry.activityLevel}
                        onChange={(e) => setNewEntry({...newEntry, activityLevel: e.target.value as any})}
                        className="w-full bg-white border border-brand-brown/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-colors appearance-none"
                      >
                        <option value="low">Low (Sedentary)</option>
                        <option value="moderate">Moderate (Walking/Standing)</option>
                        <option value="high">High (Running/Sports)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">Pain Level (0-10)</label>
                      <span className="text-xl font-display font-bold text-brand-orange">{newEntry.painLevel}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="1"
                      value={newEntry.painLevel}
                      onChange={(e) => setNewEntry({...newEntry, painLevel: parseInt(e.target.value)})}
                      className="w-full h-2 bg-brand-brown/10 rounded-full appearance-none cursor-pointer accent-brand-orange"
                    />
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-brand-taupe/40">
                      <span>No Pain</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">Symptoms Experienced</label>
                      <span className="text-[9px] text-brand-taupe/40 italic">Type to search or add new</span>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-taupe/40">
                        <Search className="w-4 h-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Search symptoms (e.g. 'Cramping', 'Cold feet')..."
                        value={symptomSearch}
                        onChange={(e) => {
                          setSymptomSearch(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && symptomSearch.trim()) {
                            e.preventDefault();
                            const val = symptomSearch.trim();
                            if (!newEntry.symptoms.includes(val)) {
                              setNewEntry({...newEntry, symptoms: [...newEntry.symptoms, val]});
                            }
                            setSymptomSearch('');
                            setShowSuggestions(false);
                          }
                        }}
                        className="w-full bg-white border border-brand-brown/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                      />

                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-brand-brown/10 rounded-2xl shadow-xl overflow-hidden"
                          >
                            {suggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setNewEntry({...newEntry, symptoms: [...newEntry.symptoms, s]});
                                  setSymptomSearch('');
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-6 py-3 text-sm text-brand-taupe hover:bg-brand-orange/5 hover:text-brand-orange transition-colors flex items-center justify-between group"
                              >
                                {s}
                                <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Selected Symptoms Tags */}
                    {newEntry.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {newEntry.symptoms.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewEntry({...newEntry, symptoms: newEntry.symptoms.filter(item => item !== s)})}
                            className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-brand-orange text-white flex items-center gap-2 group hover:bg-brand-orange/90 transition-all"
                          >
                            {s}
                            <Plus className="w-3 h-3 rotate-45" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-taupe/40 block mb-3">Common Suggestions</span>
                      <div className="flex flex-wrap gap-2">
                        {SYMPTOMS_LIST.filter(s => !newEntry.symptoms.includes(s)).slice(0, 6).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setNewEntry({...newEntry, symptoms: [...newEntry.symptoms, s]});
                            }}
                            className="px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest bg-white text-brand-taupe border border-brand-brown/10 hover:border-brand-orange/40 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">Notes & Observations</label>
                    <textarea 
                      placeholder="Any specific triggers or relief methods you noticed?"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      rows={4}
                      className="w-full bg-white border border-brand-brown/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-brand-orange transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setSymptomSearch('');
                        setShowSuggestions(false);
                      }}
                      className="flex-1 bg-white text-brand-brown py-5 rounded-2xl font-bold uppercase tracking-widest text-xs border border-brand-brown/10 hover:bg-brand-beige transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-brand-orange text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
