import React, { useState, useEffect } from 'react';
import { 
  Footprints, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  Menu, 
  X,
  Activity,
  Zap,
  ShieldCheck,
  ExternalLink,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  BookOpen,
  Star
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionValue } from 'motion/react';
import { auth, googleProvider, FirebaseUser, db, handleFirestoreError } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, setDoc, doc } from 'firebase/firestore';

const Logo = ({ isScrolled, className = "" }: { isScrolled?: boolean; className?: string }) => (
  <motion.div 
    whileHover="hover"
    className={`flex items-center gap-4 cursor-pointer ${className}`}
  >
    <div className={`bg-brand-brown rounded-[1.2rem] flex items-center justify-center shadow-luxury transition-all duration-700 relative overflow-hidden group ${isScrolled ? 'w-10 h-10' : 'w-12 h-12'}`}>
      <motion.div
        variants={{
          hover: {
            y: [-2, 2, -2],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }}
      >
        <Footprints className="text-brand-orange w-3/5 h-3/5" />
      </motion.div>
      {/* Decorative pulse effect on hover */}
      <motion.div 
        variants={{
          hover: { opacity: 0.2, scale: 1.5 }
        }}
        initial={{ opacity: 0, scale: 1 }}
        className="absolute inset-0 bg-brand-orange rounded-full blur-xl -z-10"
      />
    </div>
    <div className="flex flex-col leading-[0.8]">
      <span className={`font-display font-black text-brand-brown transition-all duration-700 tracking-[-0.05em] ${isScrolled ? 'text-lg' : 'text-xl md:text-2xl'}`}>
        Com<span className="text-brand-orange">foot</span>
      </span>
      {!isScrolled && (
        <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-brand-taupe/40 mt-1 ml-0.5 whitespace-nowrap">
          Where Comfort meets your Soul
        </span>
      )}
    </div>
  </motion.div>
);

import { FootProblemQuiz } from './components/FootProblemQuiz';
import { MythBusters } from './components/MythBusters';
import { AdminDashboard } from './components/AdminDashboard';
import { FootJournal } from './components/FootJournal';
import { ConditionComparison } from './components/ConditionComparison';
import { Onboarding } from './components/Onboarding';
import { Condition, Product, Symptom } from './types';

// --- Data ---

const CONDITIONS: Condition[] = [
  {
    id: 'plantar-fasciitis',
    title: 'Plantar Fasciitis',
    shortDesc: 'Morning heel pain or discomfort after long standing.',
    fullDesc: 'Plantar fasciitis is an inflammation of the fibrous tissue (plantar fascia) along the bottom of your foot that connects your heel bone to your toes.',
    whatIsIt: 'Often felt as a sharp stabbing sensation in the bottom of your foot, particularly during your first steps in the morning or after sitting for a long time.',
    causes: [
      'Repetitive strain from running or jumping',
      'Improper footwear with poor arch support',
      'Tight calf muscles',
      'Sudden increase in physical activity'
    ],
    symptoms: [
      { name: 'Sharp pain in the bottom of the heel', description: 'Often feels like a stabbing sensation, most intense during the first few steps of the day.' },
      { name: 'Pain that is worse in the morning', description: 'The plantar fascia tightens overnight; sudden stretching in the morning causes micro-tears and sharp pain.' },
      { name: 'Swelling or inflammation around the heel', description: 'Visible puffiness or redness indicating the body is trying to heal the damaged tissue.' },
      { name: 'Tenderness when touching the heel area', description: 'Sensitivity to pressure, especially at the point where the fascia attaches to the heel bone.' }
    ],
    diySupport: [
      'Frozen water bottle rolls (15 mins daily)',
      'Calf and plantar fascia stretches',
      'Rest and avoiding high-impact activities',
      'Using cushioned heel cups'
    ],
    products: [
      {
        name: 'Frido Plantar Insole',
        description: 'Premium orthotic insoles designed specifically for plantar fasciitis relief with deep heel cushioning and arch support.',
        bestFor: 'Best Fit: Daily wear in walking or sports shoes.',
        link: 'https://amzn.to/4rZCbsz'
      },
      {
        name: 'Medial Arch Support',
        description: 'Targeted support for the medial arch to redistribute pressure and reduce strain on the plantar fascia ligament.',
        bestFor: 'Commonly Used: Correcting overpronation and arch fatigue.',
        link: 'https://amzn.to/4kJD5XT'
      },
      {
        name: 'Foot Massager and Roller',
        description: 'Ergonomically shaped roller for deep tissue massage to break up scar tissue and increase blood flow.',
        bestFor: 'Best Fit: Morning and evening recovery sessions.',
        link: 'https://amzn.to/4aFri8e'
      }
    ],
    painType: ['Heel Pain', 'Arch Pain'],
    affectedArea: ['Heel', 'Arch']
  },
  {
    id: 'flat-feet',
    title: 'Flat Feet',
    shortDesc: 'Low arch support causing strain and fatigue.',
    fullDesc: 'Flat feet (pes planus) occur when the arches on the inside of your feet flatten when you stand up.',
    whatIsIt: 'A condition where the entire sole of the foot touches the floor when standing. It can lead to misalignment in the ankles, knees, and hips.',
    causes: [
      'Genetic predisposition',
      'Weakened arches due to aging',
      'Foot or ankle injury',
      'Obesity or excessive weight bearing'
    ],
    symptoms: [
      { name: 'Feet tiring easily', description: 'Muscles in the feet and legs work harder to compensate for the lack of arch support, leading to rapid fatigue.' },
      { name: 'Pain in the arch or heel area', description: 'Strain on the ligaments and tendons that normally support the arch can cause persistent aching.' },
      { name: 'Swelling along the inside of the ankle', description: 'The posterior tibial tendon, which supports the arch, can become inflamed and swollen.' },
      { name: 'Back and leg pain due to misalignment', description: 'Flat feet can cause the legs to rotate inward, putting stress on the knees, hips, and lower back.' }
    ],
    diySupport: [
      'Arch strengthening exercises (towel scrunches)',
      'Walking barefoot on soft sand',
      'Maintaining a healthy weight',
      'Choosing shoes with firm mid-soles'
    ],
    products: [
      {
        name: 'Frido Rigid Arch Support Insole',
        description: 'Rigid orthotic insoles designed to provide maximum support for collapsed arches and improve foot alignment.',
        bestFor: 'Best Fit: Daily wear in sports or formal shoes.',
        link: 'https://amzn.in/d/066diPwp'
      },
      {
        name: 'Boldfit Arch Support',
        description: 'Comfortable and durable arch support inserts that help reduce foot fatigue and pain.',
        bestFor: 'Commonly Used: Active lifestyles and long hours of standing.',
        link: 'https://amzn.in/d/0bgzXhjD'
      },
      {
        name: 'Flat Foot Arch Support',
        description: 'Targeted support for the medial arch to redistribute pressure and reduce strain.',
        bestFor: 'Best Fit: Correcting overpronation.',
        link: 'https://amzn.in/d/01TLGUJ3'
      }
    ],
    painType: ['Arch Pain', 'Aching'],
    affectedArea: ['Arch']
  },
  {
    id: 'bunions',
    title: 'Bunions (Hallux Valgus)',
    shortDesc: 'Bony bump at the base of the big toe.',
    fullDesc: 'A bunion is a bony bump that forms on the joint at the base of your big toe. It occurs when some of the bones in the front part of your foot move out of place.',
    whatIsIt: 'The tip of your big toe gets pulled toward the smaller toes and forces the joint at the base of your big toe to stick out.',
    causes: [
      'Wearing tight, narrow shoes',
      'Inherited structural foot defects',
      'Stress on your foot or a medical condition, such as arthritis',
      'Prolonged standing in high heels'
    ],
    symptoms: [
      { name: 'Bulging bump on the outside of the big toe', description: 'A visible, often red and swollen protrusion at the base of the big toe.' },
      { name: 'Swelling, redness or soreness', description: 'Inflammation around the big toe joint that can be painful to touch.' },
      { name: 'Corns or calluses', description: 'These often develop where the first and second toes overlap or rub against each other.' },
      { name: 'Persistent or intermittent pain', description: 'Aching or sharp pain that can make it difficult to find comfortable shoes.' }
    ],
    diySupport: [
      'Wearing wide-toe box shoes',
      'Using bunion pads or cushions',
      'Applying ice to the joint after standing',
      'Toe spacing exercises'
    ],
    products: [
      {
        name: 'Frido Orthotics Bunion Corrector',
        description: 'Advanced bunion corrector designed for effective toe realignment and pressure relief.',
        bestFor: 'Best Fit: Hallux Valgus correction and pain relief.',
        link: 'https://amzn.to/4sW7nZN'
      },
      {
        name: 'AGEasy Antara Bunion Corrector',
        description: 'Comfortable bunion aid that helps in toe separation and alignment.',
        bestFor: 'Commonly Used: Daily wear and gradual correction.',
        link: 'https://amzn.to/4eHwhc4'
      },
      {
        name: 'Wonder Care Silicone Toe Separators',
        description: 'Soft silicone separators that gently divide toes to reduce bunion pain.',
        bestFor: 'Best Fit: Friction reduction and toe spacing.',
        link: 'https://amzn.to/4cKDWDM'
      },
      {
        name: 'Gel Big toe Bunion Guard',
        description: 'Protective gel guard that shields the bunion from shoe pressure and rubbing.',
        bestFor: 'Commonly Used: External protection and immediate relief.',
        link: 'https://amzn.to/4sZinpg'
      },
      {
        name: 'Zebrooc Bunions Gel Toe Separators',
        description: 'Multi-functional gel separators for bunion relief and toe stretching.',
        bestFor: 'Commonly Used: Comprehensive toe care.',
        link: 'https://amzn.to/4tCJZ4I'
      },
      {
        name: 'BowieMall Toe Hallux Valgus',
        description: 'Supportive brace for managing hallux valgus and improving toe posture.',
        bestFor: 'Best Fit: Toe alignment and joint support.',
        link: 'https://amzn.to/4sXa2m3'
      }
    ],
    painType: ['Toe Pain', 'Aching'],
    affectedArea: ['Toes']
  },
  {
    id: 'diabetic-foot',
    title: 'Diabetic Foot Care',
    shortDesc: 'Specialized care for sensitive feet due to diabetes.',
    fullDesc: 'Diabetes can cause nerve damage (neuropathy) and poor blood flow, making feet vulnerable to ulcers and infections that can be slow to heal.',
    whatIsIt: 'A critical condition where even minor injuries can lead to serious complications. Daily inspection and specialized protection are mandatory.',
    causes: [
      'High blood sugar levels over time',
      'Peripheral neuropathy (nerve damage)',
      'Peripheral artery disease (poor circulation)',
      'Inappropriate footwear causing pressure points'
    ],
    symptoms: [
      { name: 'Loss of feeling or numbness', description: 'Inability to feel heat, cold, or pain, which can lead to unnoticed injuries.' },
      { name: 'Tingling or burning sensation', description: 'Often described as "pins and needles," usually worse at night.' },
      { name: 'Slow-healing sores or ulcers', description: 'Minor cuts or blisters that do not heal within a normal timeframe.' },
      { name: 'Changes in skin color or temperature', description: 'Redness, warmth, or unusual coolness indicating circulation issues.' }
    ],
    diySupport: [
      'Daily foot inspections with a mirror',
      'Never walking barefoot',
      'Moisturizing feet (but not between toes)',
      'Gentle washing and thorough drying'
    ],
    products: [
      {
        name: 'Kitcoz Foot Cream Roll on',
        description: 'Convenient roll-on foot cream specifically formulated for intensive moisturizing of diabetic feet.',
        bestFor: 'Best Fit: Moisturizing and skin integrity maintenance.',
        link: 'https://amzn.to/4mSq9zN'
      },
      {
        name: 'BraceAbility Neuropathy Sock',
        description: 'Specialized socks designed to provide comfort and protection for feet affected by neuropathy.',
        bestFor: 'Commonly Used: Neuropathy symptoms and foot protection.',
        link: 'https://amzn.to/4mSVlz0'
      },
      {
        name: 'Fixderma Foobetik Cream',
        description: 'Expertly formulated cream for diabetic foot care, preventing dryness and infection.',
        bestFor: 'Best Fit: Comprehensive diabetic foot skin health.',
        link: 'https://amzn.to/4cNsg3o'
      },
      {
        name: 'ortho joy extra soft slippers',
        description: 'Ultra-soft therapeutic slippers providing superior cushioning for sensitive diabetic feet.',
        bestFor: 'Best Fit: Indoor comfort and pressure reduction.',
        link: 'https://amzn.to/41Z8cGe'
      },
      {
        name: 'Doctorhealth soft Men\'s massage flip flop',
        description: 'Soft and comfortable flip flops with massage points to stimulate circulation.',
        bestFor: 'Commonly Used: Lightweight summer wear and circulation support.',
        link: 'https://amzn.to/4twZfQu'
      },
      {
        name: 'DOCTOR EXTRA SOFT Men\'s Sports Shoes',
        description: 'Cushioned sports shoes designed specifically for those needing extra soft footbeds.',
        bestFor: 'Best Fit: Active lifestyle and impact protection.',
        link: 'https://amzn.to/3OCx4R9'
      }
    ],
    painType: ['Numbness', 'Tingling'],
    affectedArea: ['Whole Foot']
  },
  {
    id: 'achilles-tendinitis',
    title: 'Achilles Tendinitis',
    shortDesc: 'Pain along the back of the leg near the heel.',
    fullDesc: 'Achilles tendinitis is an overuse injury of the Achilles tendon, the band of tissue that connects calf muscles at the back of the lower leg to your heel bone.',
    whatIsIt: 'Commonly occurs in runners who have suddenly increased the intensity or duration of their runs, or middle-aged people who play sports.',
    causes: [
      'Sudden increase in physical activity',
      'Tight calf muscles',
      'Bone spurs on the heel',
      'Running in worn-out or improper shoes'
    ],
    symptoms: [
      { name: 'Aching pain in the back of the leg', description: 'Usually felt above the heel after running or other sports activity.' },
      { name: 'Episodes of more severe pain', description: 'Sharp pain during prolonged running, stair climbing, or sprinting.' },
      { name: 'Tenderness or stiffness', description: 'Especially in the morning, which usually improves with mild activity.' },
      { name: 'Mild swelling or a "bump"', description: 'A thickening of the tendon that may be visible or felt.' }
    ],
    diySupport: [
      'R.I.C.E (Rest, Ice, Compression, Elevation)',
      'Eccentric calf strengthening exercises',
      'Using heel lifts in shoes',
      'Gentle stretching of the calf'
    ],
    products: [
      {
        name: 'Powerstep UltraFlexx Foot Rocker',
        description: 'Ergonomic foot rocker that helps stretch the Achilles tendon and calf muscles effectively.',
        bestFor: 'Best Fit: Tendon stretching and flexibility.',
        link: 'https://amzn.to/3ODWFsW'
      },
      {
        name: 'FOVERA Foot & Calf Stretcher Belt',
        description: 'Designed for safe and controlled stretching of the lower leg muscles and Achilles tendon.',
        bestFor: 'Commonly Used: Relieving tendon tightness.',
        link: 'https://amzn.to/4cuNSCK'
      },
      {
        name: 'Sorgen Ankle support for pain relief',
        description: 'Compression ankle sleeve providing stability and relief for Achilles pain.',
        bestFor: 'Best Fit: Stability and inflammation reduction.',
        link: 'https://amzn.to/4cwfpnl'
      },
      {
        name: 'Adjustable Orthopedic Heel Lift',
        description: 'Customizable heel lifts to reduce tension on the Achilles tendon during daily activities.',
        bestFor: 'Commonly Used: Immediate strain reduction.',
        link: 'https://amzn.to/3QqI2d3'
      },
      {
        name: 'Dr.Ortho Pain Relief Gel Insoles',
        description: 'Soft gel insoles that absorb shock and provide comfort to the heel area.',
        bestFor: 'Commonly Used: Shock absorption and daily comfort.',
        link: 'https://amzn.to/4eI1BYf'
      },
      {
        name: 'Aegon Foot Stretcher Strap',
        description: 'Versatile strap for deep and effective stretching of the foot and Achilles.',
        bestFor: 'Commonly Used: Intensive stretching sessions.',
        link: 'https://amzn.to/41QcPm1'
      },
      {
        name: 'Achilles Heel Compression Padded Sleeve Socks',
        description: 'Padded compression socks that target the Achilles area for maximum support.',
        bestFor: 'Best Fit: Dedicated tendon compression and protection.',
        link: 'https://amzn.to/4u7bnYr'
      }
    ],
    painType: ['Heel Pain', 'Aching'],
    affectedArea: ['Heel', 'Ankle']
  },
  {
    id: 'dry-cracked-heels',
    title: 'Dry & Cracked Heels',
    shortDesc: 'Hard, thick, and cracked skin around the heel area.',
    fullDesc: 'Cracked heels (heel fissures) occur when the skin on the bottom, outer edge of the heel becomes hard, dry, and flaky. This can be painful if the cracks deepen.',
    whatIsIt: 'A common condition where the skin around the rim of the heel becomes thickened (callus) and eventually splits under pressure.',
    causes: [
      'Prolonged standing on hard floors',
      'Wearing open-backed shoes or sandals',
      'Lack of moisture in the skin',
      'Cold, dry weather',
      'Using harsh soaps or long, hot showers'
    ],
    symptoms: [
      { name: 'Thickened, hard skin (callus)', description: 'Yellowish or dark skin patches around the heel edge that feel rough.' },
      { name: 'Visible cracks or fissures', description: 'Splits in the skin that can range from fine lines to deep, painful cracks.' },
      { name: 'Itchy or flaky skin', description: 'The skin feels very dry and may flake off during movement.' },
      { name: 'Pain while walking', description: 'Deep cracks that reach the sensitive layers of the skin, potentially leading to bleeding.' }
    ],
    diySupport: [
      'Apply urea-based heel balms twice daily',
      'Soak feet in lukewarm water for 15-20 minutes',
      'Gently use a pumice stone on callused areas',
      'Wear moisturizing heel socks overnight',
      'Stay hydrated to maintain skin elasticity'
    ],
    products: [
      {
        name: 'Bodywise Urea Foot Cream Roll',
        description: 'Easy-to-apply roll-on with urea to soften thick skin and repair deep cracks.',
        bestFor: 'Best Fit: Convenient application and intensive repair.',
        link: 'https://amzn.to/3OMQ5jH'
      },
      {
        name: 'Foottex Cracked Heel Cream',
        description: 'Potent formula designed to heal dry and cracked heels effectively.',
        bestFor: 'Commonly Used: Deeply moisturizing severe fissures.',
        link: 'https://amzn.to/4sZoQAp'
      },
      {
        name: 'Fixderma Footbetik Cream',
        description: 'Dermatologist-recommended cream for intensive hydration and skin repair.',
        bestFor: 'Best Fit: Ultra-dry skin and persistent cracking.',
        link: 'https://amzn.to/4cNsg3o'
      },
      {
        name: 'Tifanso Moisturizing Heel Socks',
        description: 'Gel-lined socks that lock in moisture and soften hard heels while you sleep.',
        bestFor: 'Best Fit: Overnight intensive treatment.',
        link: 'https://amzn.to/4t1fFQ9'
      },
      {
        name: 'Krack Heel Repair Cream',
        description: 'A classic and trusted solution for soothing and healing cracked skin.',
        bestFor: 'Commonly Used: Quick relief and budget-friendly care.',
        link: 'https://amzn.to/4mN00lQ'
      }
    ],
    painType: ['Sharp Pain', 'Itching', 'Soreness'],
    affectedArea: ['Heel']
  },
  {
    id: 'mortons-neuroma',
    title: "Morton's Neuroma",
    shortDesc: "Pain in the ball of the foot, often between the 3rd and 4th toes.",
    fullDesc: "Morton's neuroma is a painful condition that affects the ball of your foot, most commonly the area between your third and fourth toes.",
    whatIsIt: "It involves a thickening of the tissue around one of the nerves leading to your toes. It can feel like you're standing on a pebble in your shoe.",
    causes: [
      'Wearing high heels or tight shoes',
      'High-impact athletic activities (running, tennis)',
      'Foot deformities (bunions, flat feet, high arches)'
    ],
    symptoms: [
      { name: 'Burning pain in the ball of the foot', description: 'A sharp, burning sensation that may radiate into your toes.' },
      { name: 'Numbness or tingling in the toes', description: 'A feeling of "pins and needles" or loss of sensation in the affected toes.' },
      { name: 'The feeling of standing on a pebble', description: 'A persistent sensation that there is something inside your shoe when nothing is there.' },
      { name: 'Pain that worsens with activity or tight shoes', description: 'Pressure on the forefoot exacerbates the nerve irritation.' }
    ],
    diySupport: [
      'Switching to shoes with a wide toe box',
      'Using metatarsal pads',
      'Icing the area to reduce inflammation',
      'Resting and avoiding high-impact sports'
    ],
    products: [
      {
        name: 'Herbal Detox Foot Pads',
        description: 'Natural detox patches infused with herbal extracts to help soothe nerve pain and improve circulation.',
        bestFor: 'Commonly Used: Nightly recovery and detoxification.',
        link: 'https://amzn.to/4mZP3gZ'
      },
      {
        name: 'Digolex Gel Pads',
        description: 'Advanced metatarsal gel cushions designed to offload pressure from the neuroma site.',
        bestFor: 'Best Fit: Impact absorption and nerve relief.',
        link: 'https://amzn.to/4w1Vq7I'
      },
      {
        name: 'Fomibobri Ball of Foot Cushions',
        description: 'Ultra-soft cushions that provide a therapeutic barrier for the metatarsal heads.',
        bestFor: 'Commonly Used: Walking comfort and friction reduction.',
        link: 'https://amzn.to/4unQ5Gg'
      },
      {
        name: 'Wonder Care Silicone Toe Separators',
        description: 'Medical-grade silicone separators that help realign toes and reduce pressure on the interdigital nerve.',
        bestFor: 'Best Fit: Toe alignment and space correction.',
        link: 'https://amzn.to/3QCGZqw'
      }
    ],
    painType: ['Ball of Foot Pain', 'Numbness', 'Burning'],
    affectedArea: ['Ball of Foot', 'Toes']
  },
  {
    id: 'heel-spurs',
    title: 'Heel Spurs',
    shortDesc: 'Bony protrusions caused by calcium deposits on the heel bone.',
    fullDesc: 'A heel spur is a calcium deposit causing a bony protrusion on the underside of the heel bone. They are often associated with plantar fasciitis.',
    whatIsIt: 'Imagine a tiny, sharp hook of bone growing under your heel. While sometimes painless, they can cause chronic heel pain when inflamed.',
    causes: [
      'Strains on foot muscles and ligaments',
      'Stretching of the plantar fascia',
      'Repeated tearing of the membrane that covers the heel bone',
      'Age-related wear and tear'
    ],
    symptoms: [
      { name: 'Sharp pain like a knife in the heel', description: 'Usually most severe when first standing up in the morning.' },
      { name: 'Dull ache in the heel throughout the day', description: 'Persistent discomfort that lingers after long periods of activity.' },
      { name: 'Visible protrusion under the heel', description: 'In some cases, the bony growth can be felt through the skin.' },
      { name: 'Inflammation and swelling at the front of the heel', description: 'The tissue around the spur becomes irritated and painful.' }
    ],
    diySupport: [
      'Using orthotic inserts with heel cutouts',
      'Stretching exercises for the calves and feet',
      'Wearing properly fitting shoes with shock-absorbent soles',
      'Rest and physical therapy'
    ],
    products: [
      {
        name: 'Relieve Heel Pain for Heel Spur',
        description: 'Specialized orthotic inserts designed to cradle the heel and offload pressure from bony spurs.',
        bestFor: 'Best Fit: Acute heel pain management.',
        link: 'https://amzn.to/4ucazSa'
      },
      {
        name: 'Purastep Silicone Gel Pads',
        description: 'Dual-density silicone pads that provide intensive shock absorption for the heel strike.',
        bestFor: 'Commonly Used: Long durations of standing.',
        link: 'https://amzn.to/4d1B9GN'
      },
      {
        name: 'Dr. Scholl\'s Orthotics Insole',
        description: 'Clinically proven insoles for heavy-duty support and relief from heel spur discomfort.',
        bestFor: 'Best Fit: Reliable daily arch and heel support.',
        link: 'https://amzn.to/3QxvKj9'
      },
      {
        name: 'Heel Cup Sleeve',
        description: 'Compression sleeves with integrated heel cups to provide stable support and cushioning.',
        bestFor: 'Commonly Used: Active movement and stability.',
        link: 'https://amzn.to/4eSNrDJ'
      }
    ],
    painType: ['Heel Pain', 'Sharp Pain'],
    affectedArea: ['Heel']
  },
  {
    id: 'metatarsalgia',
    title: 'Metatarsalgia',
    shortDesc: 'Pain and inflammation in the ball of your foot.',
    fullDesc: "Metatarsalgia is a condition in which the ball of your foot becomes inflamed and painful. You might experience it if you participate in activities that involve running and jumping.",
    whatIsIt: "It is often considered a symptom of other conditions rather than a specific disease itself. It results from excessive pressure on the metatarsal heads.",
    causes: [
      'Intense training or activity',
      'Certain foot shapes (high arches or long second toes)',
      'Foot deformities (hammertoes, bunions)',
      'Excess weight',
      'Poorly fitting shoes'
    ],
    symptoms: [
      { name: 'Sharp, aching or burning pain in the ball of the foot', description: 'The part of the sole just behind your toes feels highly sensitive.' },
      { name: 'Pain that worsens when you stand, run, or walk barefoot', description: 'Direct pressure on the ball of the foot increases the discomfort.' },
      { name: 'A feeling of having a pebble in your shoe', description: 'A common sensation caused by the inflammation of the metatarsal area.' },
      { name: 'Numbness or tingling in your toes', description: 'Pressure on the nerves in the ball of the foot can affect sensation in the toes.' }
    ],
    diySupport: [
      'Resting and elevating your foot after activity',
      'Applying ice packs to the affected area',
      'Wearing shoes with good support and cushioning',
      'Using metatarsal pads to redistribute weight'
    ],
    products: [
      {
        name: 'Heavy Duty Support Metatarsal Pain Relief Insole',
        description: 'Rigid orthotics engineered for maximum weight distribution away from the metatarsal heads.',
        bestFor: 'Best Fit: High-impact pressure relief.',
        link: 'https://amzn.to/4eSNrDJ'
      },
      {
        name: 'Metatarsal Pad',
        description: 'Classic felt metatarsal pads that lift the transverse arch to relieve burning pain.',
        bestFor: 'Best Fit: Direct offloading of the ball of the foot.',
        link: 'https://amzn.to/48wakJc'
      },
      {
        name: 'Metatarsal Gel Sleeves',
        description: 'Elastic sleeves with integrated gel cushions for a secure and comfortable fit.',
        bestFor: 'Commonly Used: Versatile daily use in any shoe.',
        link: 'https://amzn.to/4tGDwFL'
      },
      {
        name: 'Footlogics Metatarsalgic Orthotic Insole',
        description: 'Podiatrist-designed insoles targeting metatarsal pain with a built-in metatarsal raise.',
        bestFor: 'Best Fit: Structural correction and long-term relief.',
        link: 'https://amzn.to/4cFvK9k'
      }
    ],
    painType: ['Ball of Foot Pain', 'Aching', 'Burning'],
    affectedArea: ['Ball of Foot']
  },
  {
    id: 'hammertoes',
    title: 'Hammertoes',
    shortDesc: 'Abnormal bend in the middle joint of a toe.',
    fullDesc: "A hammertoe is a deformity that causes your toe to bend or curl downward instead of pointing forward. This deformity can affect any toe, but most often it affects the second or third toe.",
    whatIsIt: "It usually starts as a mild deformity and gets worse over time. In the early stages, hammertoes are flexible and can be corrected with simple measures.",
    causes: [
      'Inappropriate footwear (tight or pointed shoes)',
      'Trauma to the toe',
      'Imbalance in toe muscles',
      'Arthritis or other medical conditions'
    ],
    symptoms: [
      { name: 'Bending of the toe downward', description: 'The middle joint of the toe sticks up, and the tip points down.' },
      { name: 'Corns or calluses on the top of the middle joint', description: 'Caused by rubbing against the top of the shoe.' },
      { name: 'Pain in the toe joint where it meets the foot', description: 'Difficulty moves the toe or finding comfortable shoes.' },
      { name: 'Swelling and redness at the joint', description: 'The affected joint may become inflamed and tender.' }
    ],
    diySupport: [
      'Switching to shoes with deep toe boxes',
      'Using toe splints or regulators',
      'Performing toe exercises (picking up marbles)',
      'Using non-medicated corn pads'
    ],
    products: [
      {
        name: 'Anzailala 2pcs Hammer Toe Corrector',
        description: 'Soft and adjustable splints that gently pull the hammered toe into a neutral position.',
        bestFor: 'Best Fit: Flexible hammertoe correction.',
        link: 'https://amzn.to/4uoOmk2'
      },
      {
        name: 'Wonder Care Silicone Toe Separator',
        description: 'Big toe corrector and separator patches designed for post-surgical or preventative care.',
        bestFor: 'Commonly Used: Joint alignment and pressure relief.',
        link: 'https://amzn.to/4w2rlow'
      },
      {
        name: 'Foot Alignment Socks',
        description: 'Therapeutic socks with separated toe spacers to stretch and realign contracted toes.',
        bestFor: 'Best Fit: Overnight rest and active stretching.',
        link: 'https://amzn.to/4tDqkBz'
      }
    ],
    painType: ['Toe Pain', 'Joint Pain'],
    affectedArea: ['Toes']
  },
  {
    id: 'sesamoiditis',
    title: 'Sesamoiditis',
    shortDesc: 'Inflammation of the small bones under the big toe joint.',
    fullDesc: 'Sesamoiditis is a form of tendonitis that affects the sesamoid bones—two tiny bones under the big toe joint that act like pulleys for tendons.',
    whatIsIt: 'It is a common overuse injury in dancers, runners, and people with high arches. Because these bones are so small, inflammation can be incredibly persistent.',
    causes: [
      'Repeated impact on the ball of the foot',
      'Wearing high heels or thin-soled shoes',
      'Increased activity level in high-impact sports',
      'Having high arches'
    ],
    symptoms: [
      { name: 'Pain under the big toe joint', description: 'Pain that develops gradually and focuses on the bottom of the big toe.' },
      { name: 'Difficulty bending and straightening the big toe', description: 'The tendon around the sesamoid bones becomes stiff and inflamed.' },
      { name: 'Swelling and bruising', description: 'In acute cases, the area around the sesamoid bones may become noticeably inflamed.' },
      { name: 'Pain when walking barefoot or on hard surfaces', description: 'Lack of cushioning exacerbates the pressure on the sesamoid bones.' }
    ],
    diySupport: [
      'Applying the R.I.C.E protocol (Rest, Ice, Compression, Elevation)',
      'Wearing low-heeled, cushioned shoes',
      'Using a "dancer\'s pad" to offload the joint',
      'Taping the big toe to restrict movement'
    ],
    products: [
      {
        name: 'Kimihome Dancer Pads 8 Count Gel Cushions',
        description: 'High-grade gel pads designed with a U-shaped cutout to offload the sesamoid bones.',
        bestFor: 'Targeted sesamoid joint protection.',
        link: 'https://amzn.to/42K03FP'
      },
      {
        name: 'Silicone Forefoot Pad',
        description: 'Comprehensive forefoot cushioning to reduce direct impact on the big toe joint.',
        bestFor: 'Dancing and athletic performance.',
        link: 'https://amzn.to/4efcSPC'
      },
      {
        name: 'Offloading Boot',
        description: 'Medical-grade walking boot to completely immobilize the sesamoid joint for healing.',
        bestFor: 'Severe inflammation or fractures.',
        link: 'https://amzn.to/4n6vFiC'
      },
      {
        name: 'ZenToes Ball of Foot Pads',
        description: 'Durable gel cushions that provide consistent relief for the balls of the feet.',
        bestFor: 'Daily impact management.',
        link: 'https://amzn.to/4tLLH3U'
      }
    ],
    painType: ['Big Toe Pain', 'Aching', 'Sharp Pain'],
    affectedArea: ['Ball of Foot']
  },
  {
    id: 'diabetic-neuropathy',
    title: 'Diabetic Neuropathy',
    shortDesc: 'Nerve damage that can occur if you have diabetes.',
    fullDesc: 'Diabetic neuropathy is a type of nerve damage that can occur if you have diabetes. High blood sugar can injure nerves throughout your body, but it most often damages nerves in your legs and feet.',
    whatIsIt: 'It is a serious complication of diabetes that can lead to loss of sensation. This is a critical condition because injuries can go unnoticed, potentially leading to infections or ulcers.',
    causes: [
      'High blood sugar levels over long periods',
      'Vessel damage causing reduced oxygen to nerves',
      'Genetic factors',
      'Inflammation in the nerves'
    ],
    symptoms: [
      { name: 'Numbness or reduced ability to feel pain', description: 'Inability to detect temperature changes or sharp objects.' },
      { name: 'Tingling or burning sensation', description: 'A persistent "pins and needles" feeling that often worsens at night.' },
      { name: 'Sharp pains or cramps', description: 'Sudden, intense nerve pains that can be debilitating.' },
      { name: 'Increased sensitivity to touch', description: 'For some, even the weight of a bedsheet can be painful (allodynia).' }
    ],
    diySupport: [
      'Checking your feet every single day for cuts or blisters',
      'Keeping blood sugar levels within target range',
      'Washing and drying feet carefully',
      'Never walking barefoot, even indoors'
    ],
    products: [
      {
        name: 'Bamboo Compression Socks',
        description: 'Ultra-soft socks that provide graduated compression to improve leg circulation and reduce nerve swelling.',
        bestFor: 'Managing edema and neuropathy pain.',
        link: 'https://amzn.to/3QJFNBC'
      },
      {
        name: 'Bamboo Ankle Socks',
        description: 'Odour-free, breathable socks with seamless construction to prevent friction-induced ulcers.',
        bestFor: 'Sensitive feet and daily diabetic care.',
        link: 'https://amzn.to/4mWiPDe'
      }
    ],
    painType: ['Numbness', 'Burning', 'Tingling'],
    affectedArea: ['Full Foot', 'Toes']
  }
];

// --- Components ---

const SymptomItem: React.FC<{ symptom: Symptom }> = ({ symptom }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <li 
      className="text-sm flex items-start gap-3 text-brand-taupe group relative cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
      <span className="border-b border-dotted border-brand-gold/40 group-hover:border-brand-gold transition-colors flex items-center gap-1.5">
        {symptom.name}
        <HelpCircle className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </span>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 bottom-full left-0 mb-4 w-72 bg-brand-brown/95 backdrop-blur-md text-brand-beige p-5 rounded-[1.5rem] shadow-2xl text-[11px] leading-relaxed pointer-events-none border border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-brand-gold/20 rounded-lg text-brand-gold">
                <Info className="w-3 h-3" />
              </div>
              <p>{symptom.description}</p>
            </div>
            <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-brand-brown/95 rotate-45 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

const ProductRating: React.FC<{ productId: string; conditionId: string; user: FirebaseUser | null }> = ({ productId, conditionId, user }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = async (value: number) => {
    if (!user) return;
    setRating(value);
    try {
      await addDoc(collection(db, 'productFeedback'), {
        userId: user.uid,
        productId,
        conditionId,
        rating: value,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, 'create', '/productFeedback');
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 mt-4 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100"
      >
        <CheckCircle2 className="w-3 h-3" /> Thanks for your feedback!
      </motion.div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-brand-brown/5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60 mb-2">Was this recommendation helpful?</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!user}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => handleRate(star)}
            className={`transition-all ${!user ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 active:scale-95'}`}
          >
            <Star 
              className={`w-4 h-4 transition-colors ${
                (hover || rating || 0) >= star 
                  ? 'fill-brand-orange text-brand-orange' 
                  : 'text-brand-taupe/30'
              }`} 
            />
          </button>
        ))}
        {!user && (
          <span className="text-[9px] text-brand-taupe/40 ml-2 italic">Login to rate</span>
        )}
      </div>
    </div>
  );
};

const Navbar: React.FC<{ user: FirebaseUser | null; onLogoClick?: () => void }> = ({ user, onLogoClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Analysis', href: '#quiz' },
    { name: 'Myths', href: '#myth-busters' },
    { name: 'Conditions', href: '#explore' },
    { name: 'Framework', href: '#compare' },
    ...(user ? [{ name: 'Journal', href: '#journal' }] : []),
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled ? 'py-4' : 'py-6 md:py-8'}`}>
      <div className={`absolute inset-0 transition-opacity duration-700 ${isScrolled ? 'opacity-100' : 'opacity-0'} bg-white/80 backdrop-blur-2xl border-b border-brand-brown/5 shadow-luxury`} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10 flex items-center justify-between">
        <div 
          onClick={onLogoClick} 
          className="group cursor-pointer flex items-center gap-2"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onLogoClick?.()}
        >
          <AnimatePresence mode="wait">
            {onLogoClick && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="lg:hidden"
              >
                <ChevronLeft className="w-6 h-6 text-brand-brown group-hover:text-brand-orange transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
          <Logo isScrolled={isScrolled} className={onLogoClick ? "hidden lg:flex" : "flex"} />
          <Logo isScrolled={isScrolled} className={onLogoClick ? "flex lg:hidden scale-75 origin-left" : "hidden"} />
        </div>

        <div className="hidden lg:flex items-center gap-1 p-1 bg-brand-brown/5 rounded-full backdrop-blur-xl border border-brand-brown/5 shadow-soft">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-taupe hover:text-brand-brown hover:bg-white transition-all duration-500"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <motion.button 
              onClick={handleLogout}
              whileHover={{ scale: 1.05, backgroundColor: "#E87C2E" }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-3 px-6 py-3 bg-brand-brown text-brand-beige rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </motion.button>
          ) : (
            <motion.button 
              onClick={handleLogin}
              whileHover={{ scale: 1.05, backgroundColor: "#2D1D13" }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-3 px-6 py-3 bg-brand-orange text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl shadow-brand-orange/20"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Access
            </motion.button>
          )}

          <motion.button 
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.1, backgroundColor: "#E87C2E" }}
            whileTap={{ scale: 0.9 }}
            className="p-3 md:p-4 bg-brand-brown text-brand-beige rounded-xl md:rounded-2xl transition-all lg:hidden shadow-xl"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay - Shopify Editions Style */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-brand-brown text-brand-beige lg:hidden"
          >
            <div className="absolute top-0 right-0 p-10">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="h-full flex flex-col justify-center px-12 pb-20 overflow-y-auto">
              <div className="mb-16 mt-20">
                <Logo className="invert brightness-200" />
              </div>
              
              <div className="space-y-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-5xl sm:text-7xl font-display font-bold tracking-tighter hover:text-brand-orange transition-colors"
                  >
                    {link.name}<span className="text-brand-orange">.</span>
                  </motion.a>
                ))}
              </div>

              <div className="mt-20 pt-12 border-t border-white/5 flex flex-col gap-8">
                {user ? (
                   <div className="flex items-center gap-4">
                     {user.photoURL ? (
                       <img src={user.photoURL} className="w-12 h-12 rounded-2xl" referrerPolicy="no-referrer" alt="" />
                     ) : (
                       <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                         <UserIcon className="w-6 h-6" />
                       </div>
                     )}
                     <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">{user.displayName}</span>
                       <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest text-brand-orange text-left">Logout Session</button>
                     </div>
                   </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="w-full py-6 bg-brand-orange text-white rounded-3xl font-display font-bold text-xl shadow-2xl active:scale-95"
                  >
                    Specialist Access
                  </button>
                )}
                <div className="flex items-center gap-6 opacity-40">
                  <Instagram className="w-6 h-6" />
                  <Twitter className="w-6 h-6" />
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.4em]">MMXXIV Edition</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ConditionCard: React.FC<{ 
  condition: Condition; 
  onQuickView: () => void;
  onLearnMore: () => void;
  isComparing: boolean;
  onToggleCompare: () => void;
}> = ({ condition, onQuickView, onLearnMore, isComparing, onToggleCompare }) => {
  return (
    <motion.div
      whileHover={{ 
        y: -16, 
        rotateX: -2,
        rotateY: 2,
        boxShadow: "0 50px 100px -20px rgba(45, 36, 30, 0.2)" 
      }}
      className={`group relative overflow-hidden bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border-2 transition-all duration-700 flex flex-col h-full ${
        isComparing ? 'border-brand-orange shadow-luxury' : 'border-brand-brown/5 shadow-soft hover:border-brand-orange/20'
      } perspective-1000`}
    >
      {/* Index Number - Editorial Detail */}
      <div className="absolute top-6 sm:top-12 right-6 sm:right-12 text-4xl sm:text-6xl font-display font-black text-brand-brown/5 group-hover:text-brand-orange/10 transition-colors duration-700 select-none">
        0{condition.id}
      </div>

      <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10 relative z-10">
        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${
          isComparing ? 'bg-brand-orange text-white scale-110' : 'bg-brand-beige text-brand-orange group-hover:bg-brand-orange group-hover:text-white group-hover:rotate-12 group-hover:scale-110'
        } shadow-lg`}>
          <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-brand-orange mb-2 sm:mb-3 group-hover:tracking-[0.6em] transition-all">Clinical Profile</span>
        <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-brand-brown leading-[1.1] sm:leading-[0.95] tracking-[-0.03em] mb-4 sm:mb-8 group-hover:text-brand-orange transition-colors">
          {condition.title}
        </h3>

        <p className="text-sm sm:text-lg text-brand-taupe/70 leading-relaxed font-light mb-6 sm:mb-12 border-l-2 border-brand-orange/20 pl-4 sm:pl-6 group-hover:border-brand-orange transition-colors">
          {condition.shortDesc}
        </p>
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              onClick={onToggleCompare}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${
                isComparing 
                  ? 'bg-brand-orange text-white shadow-lg' 
                  : 'bg-brand-beige text-brand-taupe hover:bg-brand-brown hover:text-white'
              }`}
            >
              {isComparing ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {isComparing ? 'Selected' : 'Compare'}
            </motion.button>
            
            <motion.button 
              onClick={onQuickView}
              whileHover={{ scale: 1.02, backgroundColor: "#E8A552", color: "#FFFFFF" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center py-5 bg-brand-beige text-brand-taupe rounded-2xl transition-all shadow-sm"
              title="Quick Analytics"
            >
              <BookOpen className="w-5 h-5" />
            </motion.button>
          </div>
          
          <motion.button 
            onClick={onLearnMore}
            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(232, 124, 46, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="group/btn relative overflow-hidden bg-brand-brown text-brand-beige py-6 rounded-2xl text-[12px] font-bold uppercase tracking-[0.4em] shadow-xl transition-all text-center flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 bg-brand-orange translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10">Full Protocol</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ConditionDetailView: React.FC<{ condition: Condition; user: FirebaseUser | null; onBack: () => void }> = ({ condition, user, onBack }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const sectionLabel = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["Intro", "Science", "Causes", "Symptoms", "Care"]
  );

  const progressPercent = useTransform(scrollYProgress, (v) => Math.round(v * 100));

  const [percent, setPercent] = useState(0);
  const [currentSection, setCurrentSection] = useState("Intro");

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPercent(Math.round(latest * 100));
  });

  useMotionValueEvent(sectionLabel, "change", (latest) => {
    setCurrentSection(latest);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-brand-beige/30 pt-24 md:pt-32 pb-12 md:pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex items-center gap-2 text-brand-brown/40 text-[10px] uppercase tracking-[0.2em] mb-4 overflow-x-auto whitespace-nowrap pb-2">
          <button onClick={onBack} className="hover:text-brand-orange transition-colors">Home</button>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <button onClick={onBack} className="hover:text-brand-orange transition-colors">Explore</button>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-brand-brown font-bold truncate">{condition.title}</span>
        </div>

        <motion.button 
          onClick={onBack}
          whileHover={{ x: -10 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 text-brand-brown hover:text-brand-orange transition-all duration-300 mb-8 md:mb-12 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-brown/10 flex items-center justify-center group-hover:border-brand-orange/30 group-hover:bg-brand-orange/5 transition-all">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-40">Previous</span>
            <span className="text-sm md:text-base font-display font-bold">Back to Explore</span>
          </div>
        </motion.button>

        {/* Full-width Header */}
        <div className="mb-12 md:mb-20 px-2 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="h-px w-8 sm:w-12 bg-brand-orange" />
            <span className="text-brand-orange font-bold uppercase tracking-[0.25em] text-[8px] sm:text-[10px]">Clinical Protocol Profile</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-display font-bold text-brand-brown mb-6 sm:mb-8 leading-tight tracking-tight">
            {condition.title}
          </h1>
          <p className="text-base sm:text-xl md:text-2xl leading-relaxed text-brand-taupe/70 font-light max-w-4xl">
            {condition.fullDesc}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-16">
          {/* Main Content Area - Products (8 columns) */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] sm:rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shadow-sm">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-3xl font-display font-bold text-brand-brown">Curated Relief Gear</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {condition.products.map((product, i) => (
                <div key={i} className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-brown/5 shadow-soft hover:shadow-luxury transition-all duration-500 group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 sm:mb-6 text-brand-brown/40 font-bold text-[8px] sm:text-xs uppercase tracking-widest">
                      Item 0{i + 1}
                  </div>
                  
                  <h4 className="text-lg sm:text-xl font-display font-bold text-brand-brown mb-2 sm:mb-3 group-hover:text-brand-orange transition-colors">{product.name}</h4>
                  <p className="text-xs sm:text-sm text-brand-taupe/70 mb-8 sm:mb-10 leading-relaxed flex-grow">{product.description}</p>
                  
                  <div className="mt-auto space-y-6 sm:space-y-8">
                    <ProductRating productId={product.name} conditionId={condition.id} user={user} />
                    <motion.a 
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, backgroundColor: "#E87C2E" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-brand-brown text-white py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-3 sm:gap-4 group/btn shadow-lg"
                    >
                      Amazon Protocol <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-2 transition-transform" />
                    </motion.a>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Section */}
            <div className="mt-12 md:mt-16 bg-brand-brown p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-brand-beige shadow-luxury relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full -mr-[300px] -mt-[300px] blur-[140px]" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mb-8">
                  <HelpCircle className="w-8 h-8 text-brand-orange" />
                </div>
                <h3 className="text-4xl font-display font-bold mb-6">Need more clarity?</h3>
                <p className="text-lg opacity-70 mb-10 leading-relaxed font-light max-w-2xl">If these interventions don't yield results within a few weeks, a clinical consultation is advised. Revisit our framework for next steps.</p>
                <div className="flex flex-wrap gap-6">
                  <motion.a 
                    href="#quiz" 
                    whileHover={{ scale: 1.05, backgroundColor: "#F7F5F0", color: "#E87C2E" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-brand-orange text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-brand-orange/20"
                  >
                    Start Assessment
                  </motion.a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Science & Information (4 columns) */}
          <div className="lg:col-span-4 order-1 lg:order-2" ref={contentRef}>
            <div className="sticky top-32 space-y-10">
              <div className="bg-white p-8 rounded-[2.5rem] border border-brand-brown/5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">{currentSection}</span>
                  <span className="text-[10px] font-bold text-brand-taupe/40 font-mono italic">{percent}% read</span>
                </div>
                <div className="h-1.5 w-full bg-brand-brown/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-orange origin-left rounded-full"
                    style={{ scaleX: scrollYProgress }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <section className="bg-white p-10 rounded-[3rem] border border-brand-brown/5 shadow-soft">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                      <Info className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-brand-brown">Diagnosis</h2>
                  </div>
                  <p className="text-sm text-brand-taupe/80 leading-relaxed mb-8 font-light italic opacity-80 border-l-2 border-brand-orange/20 pl-6">
                    {condition.whatIsIt}
                  </p>
                  
                  <div className="pt-8 border-t border-brand-brown/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-6">Pathology Roots</h4>
                    <ul className="space-y-4">
                      {condition.causes.map((cause, i) => (
                        <li key={i} className="text-[12px] flex items-start gap-4 text-brand-taupe leading-snug">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 opacity-40 shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                  <section className="bg-brand-beige/30 p-10 rounded-[3rem] border border-brand-brown/5">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        <Activity className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-brand-brown">Clinical Signs</h2>
                    </div>
                    <ul className="space-y-4">
                      {condition.symptoms.map((symptom, i) => (
                        <SymptomItem key={i} symptom={symptom} />
                      ))}
                    </ul>
                  </section>

                <section className="bg-brand-brown text-brand-beige p-10 rounded-[3rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-8 underline decoration-brand-orange/30 underline-offset-8 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Bio-Hacking Steps
                  </h3>
                  <div className="space-y-4">
                    {condition.diySupport.map((tip, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                        </div>
                        <span className="text-[12px] font-light leading-relaxed">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <div className="p-8 text-center bg-brand-beige/20 rounded-[2.5rem]">
                  <p className="text-[10px] text-brand-taupe/50 leading-relaxed">
                    Comfoot earns from qualifying purchases. This supports our independent clinical research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(product.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white p-10 rounded-[2.5rem] border border-brand-brown/5 shadow-soft hover:shadow-xl transition-all flex flex-col gap-6 group relative overflow-hidden hover:border-brand-orange/20 h-[520px]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-orange/10 transition-colors" />
      
      <div className="h-14 w-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-500 shadow-inner">
        <Zap className="w-7 h-7" />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <h4 className="font-display font-bold text-2xl mb-3 text-brand-brown group-hover:text-brand-orange transition-colors flex items-center gap-2">
          <Zap className="w-5 h-5 shrink-0 text-brand-orange" /> {product.name}
        </h4>
        <p className="text-base leading-relaxed text-brand-taupe/90 font-light line-clamp-4">{product.description}</p>
      </div>
      
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange bg-brand-orange/5 w-fit px-4 py-1.5 rounded-full border border-brand-orange/10">
        {product.bestFor}
      </div>
      
      <div className="mt-auto flex gap-3">
        <motion.a 
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02, backgroundColor: "#E87C2E" }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-brand-brown text-brand-beige text-center py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          View Details <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.a>
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.05, backgroundColor: "#2D1D13", color: "#F7F5F0" }}
          whileTap={{ scale: 0.95 }}
          className="px-6 bg-brand-beige text-brand-brown rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          title="Share Product"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Share</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ConditionModal: React.FC<{ condition: Condition; user: FirebaseUser | null; onClose: () => void }> = ({ condition, user, onClose }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Focus management: focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-brand-brown/60 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <motion.div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-brand-beige w-full max-w-6xl max-h-[96vh] md:max-h-[92vh] overflow-y-auto md:overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative flex flex-col md:flex-row border border-white/20 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button / Back Action */}
        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 group/close z-20 flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl hover:bg-brand-brown hover:text-white transition-all duration-300"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Dismiss</span>
          <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform" />
        </button>

        {/* Left Side: Editorial Content */}
        <div className="flex-1 md:overflow-y-auto p-6 sm:p-8 md:p-14 bg-white/40 custom-scrollbar">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="h-px w-6 sm:w-8 bg-brand-orange/40" />
              <span className="text-brand-orange font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px]">Condition Profile</span>
            </div>
            
            <h2 id="modal-title" className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-brand-brown mb-4 sm:mb-6 leading-tight">
              {condition.title}
            </h2>
            
            <p id="modal-description" className="text-base sm:text-xl leading-relaxed text-brand-taupe mb-8 sm:mb-12 font-light">
              {condition.fullDesc}
            </p>
 
            <div className="space-y-8 sm:space-y-12">
              <section>
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-orange mb-3 sm:mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" /> The Science
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-brand-taupe/90 bg-brand-orange/5 p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-brand-orange/10">
                  {condition.whatIsIt}
                </p>
              </section>
 
              <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
                <section>
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-orange mb-3 sm:mb-4">Common Causes</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {condition.causes.map((cause, i) => (
                      <li key={i} className="text-xs sm:text-sm flex items-start gap-3 text-brand-taupe">
                        <div className="w-1 h-1 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-3 sm:mb-4 flex items-center gap-2">
                    Key Symptoms <HelpCircle className="w-3 h-3 opacity-50" />
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {condition.symptoms.map((symptom, i) => (
                      <SymptomItem key={i} symptom={symptom} />
                    ))}
                  </ul>
                </section>
              </div>
 
              <section>
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-orange mb-3 sm:mb-4">Self-Care Protocols</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {condition.diySupport.map((tip, i) => (
                    <span key={i} className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-orange border border-brand-orange/10 shadow-sm">
                      {tip}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
 
        {/* Right Side: Curated Products (Affiliate Section) */}
        <div className="w-full md:w-[420px] bg-brand-beige p-6 sm:p-8 md:p-10 md:overflow-y-auto border-t md:border-t-0 md:border-l border-brand-brown/5 custom-scrollbar">
          <div className="sticky top-0 bg-brand-beige z-10 pb-4 sm:pb-6 mb-4 sm:mb-6 border-bottom border-brand-brown/5">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <ShieldCheck className="text-brand-orange w-4 h-4 sm:w-5 sm:h-5" />
              <h3 className="text-lg sm:text-xl font-display font-bold text-brand-brown">Curated Support</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-brand-taupe/70">Curated solutions for {condition.title}.</p>
          </div>
 
          <div className="space-y-6">
            {condition.products.map((product, i) => {
              const [copied, setCopied] = useState(false);
              
              const handleShare = (e: React.MouseEvent) => {
                e.preventDefault();
                navigator.clipboard.writeText(product.link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              };

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-brand-brown/5 shadow-sm hover:shadow-md transition-all group hover:border-brand-orange/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange bg-brand-orange/5 px-3 py-1 rounded-full border border-brand-orange/10">
                      Recommended
                    </span>
                  </div>
                  
                  <h4 className="font-display font-bold text-lg text-brand-brown mb-2 group-hover:text-brand-orange transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0 text-brand-orange" /> {product.name}
                  </h4>
                  <p className="text-sm text-brand-taupe/80 leading-relaxed mb-4">
                    {product.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <a 
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-brand-brown text-brand-beige py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-orange transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      View on Amazon <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleShare}
                      className="px-4 bg-brand-beige text-brand-brown rounded-xl hover:bg-brand-brown hover:text-brand-beige transition-all shadow-sm flex items-center justify-center gap-2"
                      title="Share Product"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ProductRating productId={product.name} conditionId={condition.id} user={user} />
                </motion.div>
              );
            })}
          </div>
 
          {/* Transparency Disclosure */}
          <div className="mt-12 p-6 rounded-2xl bg-brand-orange/5 border border-brand-orange/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">Transparency Note</span>
            </div>
            <p className="text-[10px] text-brand-taupe/70 leading-relaxed italic">
              Comfoot is supported by its audience. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. This helps us continue providing free foot health resources.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{ 
            y: [null, (Math.random() - 0.5) * 100 + "px"],
            x: [null, (Math.random() - 0.5) * 100 + "px"],
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-1 h-1 bg-brand-orange rounded-full"
          style={{ 
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            filter: "blur(1px)"
          }}
        />
      ))}
    </div>
  );
};

const ScrollProgressFootprints = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Number of footprints to show in the side track
  const footprintCount = 12;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col items-center gap-6 pointer-events-none">
      <div className="relative h-64 w-8 flex flex-col items-center justify-between">
        {/* Track Line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-brand-brown/10" />
        
        {/* Footprints */}
        {[...Array(footprintCount)].map((_, i) => {
          const stepProgress = (i / (footprintCount - 1)) * 100;
          const isActive = scrollProgress >= stepProgress;
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                opacity: isActive ? 1 : 0.1,
                scale: isActive ? 1.1 : 0.8,
                color: isActive ? "#F27D26" : "#2D241E",
                x: isLeft ? -6 : 6
              }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <Footprints 
                className={`w-4 h-4 transition-colors duration-500 ${isLeft ? '-scale-x-100' : ''}`} 
                style={{ transform: `rotate(${isLeft ? -15 : 15}deg) ${isLeft ? 'scaleX(-1)' : ''}` }}
              />
            </motion.div>
          );
        })}

        {/* Moving Indicator Footprint */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-20 text-brand-orange"
          animate={{ 
            top: `${scrollProgress}%`,
            x: (scrollProgress % 10 > 5) ? 8 : -8,
            rotate: (scrollProgress % 10 > 5) ? 15 : -15,
            scaleX: (scrollProgress % 10 > 5) ? 1 : -1
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="relative">
            <Footprints className="w-6 h-6 drop-shadow-lg" />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-brand-orange/20 rounded-full blur-md"
            />
          </div>
        </motion.div>
      </div>
      
      <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-taupe/40 [writing-mode:vertical-rl] rotate-180">
        Progress
      </div>
    </div>
  );
};

interface FootprintProps {
  step: {
    id: number;
    isLeft: boolean;
    y: number;
    xOffset: number;
    rotate: number;
  };
  scrollY: any;
}

const Footprint: React.FC<FootprintProps> = ({ step, scrollY }) => {
  const targetY = step.y;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
  
  // Fade in as it approaches the center of the viewport, then fade out
  const opacity = useTransform(
    scrollY,
    [targetY - viewportHeight * 0.8, targetY - viewportHeight * 0.4, targetY + viewportHeight * 0.2, targetY + viewportHeight * 0.6],
    [0, 0.06, 0.06, 0]
  );
  
  // Scale up as it appears
  const scale = useTransform(
    scrollY,
    [targetY - viewportHeight * 0.8, targetY - viewportHeight * 0.4],
    [0.7, 1]
  );

  // Parallax effect: shift the footprint vertically relative to scroll
  const yOffset = useTransform(
    scrollY,
    [targetY - viewportHeight, targetY + viewportHeight],
    [40, -40]
  );

  return (
    <motion.div
      style={{
        opacity,
        scale,
        y: yOffset,
        left: step.isLeft ? `calc(6% + ${step.xOffset}px)` : `calc(94% + ${step.xOffset}px)`,
        top: step.y,
        position: 'absolute',
        rotate: step.rotate,
        x: '-50%',
        transformOrigin: 'center',
      }}
      className="text-brand-brown"
    >
      <div style={{ transform: step.isLeft ? 'scaleX(-1)' : 'none' }}>
        <Footprints className="w-16 h-16" />
      </div>
      {/* Subtle glow */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-brand-orange/5 rounded-full blur-2xl -z-10"
      />
    </motion.div>
  );
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

const LoadingScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    className="fixed inset-0 z-[200] bg-brand-beige flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="relative mb-12">
      <motion.div
        initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-48 h-48 bg-brand-brown rounded-[3.5rem] flex items-center justify-center shadow-luxury p-8"
      >
        <motion.div
          animate={{ 
            y: [-4, 4, -4],
            rotate: [-2, 2, -2]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Footprints className="w-24 h-24 text-brand-orange" />
        </motion.div>
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-brand-orange/40 blur-[80px] rounded-full -z-10"
      />
      {/* Decorative scanning line */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-1 bg-brand-orange/40 blur-sm z-30 pointer-events-none"
      />
    </div>
    
    <div className="overflow-hidden flex flex-col items-center max-w-sm">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h2 className="text-5xl font-display font-black text-brand-brown tracking-tighter mb-2">
          COM<span className="text-brand-orange">FOOT</span>
        </h2>
      </motion.div>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.6, duration: 1.2, ease: "easeInOut" }}
        className="h-1 bg-brand-brown/5 mt-4 rounded-full relative overflow-hidden w-64"
      >
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-brand-orange w-1/3"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="flex flex-col items-center gap-3 mt-8"
      >
         <div className="flex gap-4">
           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}><Activity className="w-5 h-5 text-brand-orange" /></motion.div>
           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}><Zap className="w-5 h-5 text-brand-gold" /></motion.div>
           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}><ShieldCheck className="w-5 h-5 text-brand-brown" /></motion.div>
         </div>
         <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-brand-brown/40">
           Calibrating your movement
         </span>
      </motion.div>
    </div>
  </motion.div>
);

const LazyImage = ({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0 z-10" />}
      <img
        src={src}
        alt={alt}
        className={`${imgClassName || 'w-full h-full object-cover'} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};

const WalkingFeet = ({ className }: { className?: string }) => {
  return (
    <div className={`flex gap-16 ${className}`}>
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 5, 0],
          rotate: [0, -5, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1]
        }}
      >
        <Footprints className="w-14 h-14 text-brand-orange/30 drop-shadow-2xl" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, -5, 0],
          rotate: [0, 5, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
          delay: 1.25
        }}
      >
        <Footprints className="w-14 h-14 text-brand-orange/30 drop-shadow-2xl -scale-x-100" />
      </motion.div>
    </div>
  );
};

const ViewSkeleton = () => (
  <div className="min-h-screen pt-32 section-padding space-y-16 animate-in fade-in duration-1000">
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
      <div className="flex-1 space-y-8 w-full">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          <Skeleton className="h-16 w-48 rounded-2xl" />
          <Skeleton className="h-16 w-48 rounded-2xl" />
        </div>
      </div>
      <div className="flex-1 w-full relative">
        <Skeleton className="aspect-[4/5] rounded-[4rem] shadow-luxury" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
           <motion.div
             animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             <Activity className="w-32 h-32 text-brand-brown" />
           </motion.div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-6 p-8 bg-white rounded-[3rem] border border-brand-brown/5">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  </div>
);

const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 perspective-1000 mt-12 lg:mt-0 min-h-[500px] flex items-center justify-center">
      <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center">
        {/* Central Abstract Glyph */}
        <motion.div
          animate={{ 
            rotateY: [0, 10, 0, -10, 0],
            rotateX: [0, -5, 0, 5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-72 h-72 md:w-96 md:h-96 z-20"
        >
          {/* Main abstract form representing the arch/sole concept */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/40 via-brand-brown/10 to-transparent rounded-[4rem] blur-2xl opacity-60" />
          <div className="absolute inset-0 border border-brand-brown/5 rounded-[4rem] backdrop-blur-sm shadow-luxury flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            
            {/* Inner abstract geometry */}
            <div className="relative w-[80%] h-[80%] border border-brand-brown/10 rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="h-1 w-12 bg-brand-orange/10 rounded-full" />
                </div>
                <div className="w-4 h-4 rounded-full border border-brand-brown/10" />
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-brand-brown/5 rounded-full blur-[40px] rotate-45" />
              
              {/* Central Footprint Silhouette */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-brown">
                  {/* Heel */}
                  <path d="M50 140C50 151.046 58.9543 160 70 160C81.0457 160 90 151.046 90 140C90 128.954 81.0457 120 70 120C58.9543 120 50 128.954 50 140Z" fill="currentColor" />
                  {/* Arch/Sole */}
                  <path d="M65 125C45 110 35 90 40 60C45 30 75 20 95 30C115 40 105 70 95 90C85 110 80 120 65 125Z" fill="currentColor" />
                  {/* Toes */}
                  <circle cx="45" cy="25" r="10" fill="currentColor" />
                  <circle cx="65" cy="15" r="8" fill="currentColor" />
                  <circle cx="85" cy="12" r="7" fill="currentColor" />
                  <circle cx="102" cy="15" r="6" fill="currentColor" />
                  <circle cx="115" cy="25" r="5" fill="currentColor" />
                </svg>
              </motion.div>

              <div className="flex flex-col gap-2 relative z-10">
                <div className="w-24 h-4 bg-brand-brown/5 rounded-full" />
                <div className="w-16 h-2 bg-brand-brown/5 rounded-full opacity-40" />
              </div>

              {/* Grid dots */}
              <div className="absolute top-0 right-0 p-4 grid grid-cols-3 gap-1 opacity-20">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-brand-brown rounded-full" />
                ))}
              </div>
            </div>
            
            {/* Animated Sole Contour (Abstract SVG) */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-10 pointer-events-none p-12">
              <motion.path
                d="M50,150 Q75,140 100,150 T150,150 Q160,100 150,50 Q100,60 50,50 Q40,100 50,150"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, delay: 0.5 }}
                className="text-brand-brown"
              />
            </svg>
          </div>
        </motion.div>

        {/* Floating Data Bubbles */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-4 md:-right-12 z-30 bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-luxury border border-white/40 max-w-[180px]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-brown">Certified</span>
          </div>
          <p className="text-[10px] text-brand-taupe/60 leading-relaxed font-light">Advanced biomechanical validation for every sole profile.</p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -left-4 md:-left-12 z-30 bg-brand-brown text-white p-4 md:p-6 rounded-3xl shadow-luxury border border-white/10 max-w-[160px]"
        >
          <div className="text-2xl font-display mb-1 italic">Soulful</div>
          <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] leading-relaxed">Redefining the architecture of human movement.</p>
        </motion.div>

        {/* Decorative Ring */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[120%] aspect-square border-[0.5px] border-brand-brown rounded-full" />
          <div className="absolute w-[140%] aspect-square border-[0.5px] border-brand-brown rounded-full opacity-50" />
        </div>
      </div>
    </div>
  );
};

const WalkingTrail = () => {
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Generate steps with more organic placement
  const steps = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    isLeft: i % 2 === 0,
    y: i * 320 + 700, // Spacing
    xOffset: Math.sin(i * 0.4) * 25, // Organic path wobble
    rotate: (i % 2 === 0 ? -15 : 15) + (Math.sin(i) * 8)
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden lg:block">
      {steps.map((step) => (
        <Footprint key={step.id} step={step} scrollY={smoothScrollY} />
      ))}
    </div>
  );
};

const revealVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  // Filter States
  const [painFilter, setPainFilter] = useState<string>('All');
  const [areaFilter, setAreaFilter] = useState<string>('All');

  // Derive unique filter options
  const allPainTypes = ['All', ...Array.from(new Set(CONDITIONS.flatMap(c => c.painType)))];
  const allAreas = ['All', ...Array.from(new Set(CONDITIONS.flatMap(c => c.affectedArea)))];

  const filteredConditions = CONDITIONS.filter(condition => {
    const matchesPain = painFilter === 'All' || condition.painType.includes(painFilter);
    const matchesArea = areaFilter === 'All' || condition.affectedArea.includes(areaFilter);
    return matchesPain && matchesArea;
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    try {
      await setDoc(doc(db, 'emails', newsletterEmail), {
        email: newsletterEmail,
        createdAt: new Date().toISOString()
      });

      setNewsletterStatus('success');
      setNewsletterMessage('Welcome to the community!');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage('Failed to connect to server.');
    }
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const compareConditions = CONDITIONS.filter(c => compareList.includes(c.id));

  // Prevent scroll ONLY when modal or comparison is open (not in detail view)
  useEffect(() => {
    if ((selectedCondition && view === 'home') || showComparison) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedCondition, showComparison, view]);

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  if (view === 'detail' && selectedCondition) {
    return (
      <div className="min-h-screen bg-brand-beige/50">
        <Navbar 
          user={user} 
          onLogoClick={() => {
            setView('home');
            setSelectedCondition(null);
          }} 
        />
        <ConditionDetailView 
          condition={selectedCondition} 
          user={user}
          onBack={() => {
            setView('home');
            setSelectedCondition(null);
          }} 
        />
        <footer className="bg-brand-beige text-brand-taupe pt-32 pb-12 px-6 border-t border-brand-brown/5 relative overflow-hidden">
          {/* Subtle Background Texture */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D241E 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="pt-12 border-t border-brand-brown/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-brand-taupe/40">
                <span>&copy; {new Date().getFullYear()} Comfoot</span>
                <a href="#" className="hover:text-brand-brown transition-colors">About Company</a>
                <a href="#" className="hover:text-brand-brown transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-brown transition-colors">Terms of Service</a>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-taupe/40">
                <span>Made with</span>
                <Activity className="w-3 h-3 text-brand-orange" />
                <span>for your soles</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-brand-beige/50 font-sans">
      <AnimatePresence mode="wait">
        {isInitialLoading && <LoadingScreen />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading && !isInitialLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-beige/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ViewSkeleton />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Floating Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[15%] left-[-5%] w-[30%] h-[30%] bg-brand-orange/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[60%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[20%] h-[20%] bg-brand-brown/10 rounded-full blur-[80px] animate-bounce-slow" />
      </div>

      <Navbar 
        user={user} 
        onLogoClick={() => {
          setView('home');
          setSelectedCondition(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <ScrollProgressFootprints />
      <WalkingTrail />

      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={() => {
            localStorage.setItem('onboarding_completed', 'true');
            setShowOnboarding(false);
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCondition && (
          <ConditionModal 
            condition={selectedCondition} 
            user={user}
            onClose={() => setSelectedCondition(null)} 
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header id="home" className="relative min-h-screen flex items-center justify-center bg-brand-beige/50 overflow-hidden pt-20">
        {/* Designer Background Elements - More Dynamic */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-brand-orange/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -70, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] bg-brand-gold/10 rounded-full blur-[150px]" 
          />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-brand-brown/5 rounded-full blur-[100px]" />
        </div>
 
        <div className="max-w-7xl mx-auto px-4 md:px-12 w-full grid lg:grid-cols-2 gap-12 lg:gap-32 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center lg:text-left flex flex-col items-center lg:items-start pt-10 lg:pt-0"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-brand-brown text-brand-beige rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-6 md:mb-12 border border-white/10"
            >
              Walking Reimagined • Elite
            </motion.div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 md:mb-8 leading-[1.1] md:leading-[1] tracking-[-0.04em] font-display font-black text-brand-brown">
              COMFOOT: <br />
              <span className="text-brand-orange inline-block italic font-bold">where comfort meets your soul<span className="text-brand-brown">.</span></span>
            </h1>
            

            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto px-4 sm:px-0">
              <motion.a
                whileHover={{ scale: 1.05, backgroundColor: "#2D241E" }}
                whileTap={{ scale: 0.95 }}
                href="#quiz"
                className="group w-full sm:w-auto px-10 py-5 bg-brand-orange text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] shadow-xl shadow-brand-orange/20 transition-all text-center flex items-center justify-center gap-3"
              >
                Start Analysis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </motion.a>
              <motion.a 
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
                href="#about"
                className="group flex items-center gap-3 text-brand-brown font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] py-4"
              >
                Our Philosophy
                <div className="w-10 h-10 rounded-full border border-brand-brown/10 flex items-center justify-center group-hover:bg-brand-brown group-hover:text-white transition-all transform group-hover:scale-110">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* New Interactive Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="relative lg:block"
          >
            <HeroVisual />
            
            {/* Background elements for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
              <div className="absolute inset-0 bg-brand-gold/5 blur-[100px] rounded-full animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* Floating Particles for more activity */}
        <FloatingParticles />

        {/* Soulful floating tag */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 2 }}
          className="absolute left-12 bottom-12 hidden lg:flex flex-col gap-1 items-start"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-brand-orange/40">Established MMXXIV</span>
          <span className="text-sm font-display font-medium text-brand-brown/60 italic tracking-tight">"Where Comfort meets your soul."</span>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-px h-16 bg-gradient-to-b from-brand-orange to-transparent" />
          <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-brand-taupe/40 [writing-mode:vertical-rl] rotate-180">Scroll</span>
        </motion.div>
      </header>

      {/* Why Comfoot - Bento Grid Section */}
      <section className="py-24 md:py-40 bg-brand-beige/50 relative overflow-hidden">
        <div className="section-padding relative z-10 px-4 md:px-12">
          <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
            {/* Featured Mission Bento - 2026 Style */}
            <div className="lg:col-span-8 bg-brand-brown text-brand-beige p-8 md:p-24 rounded-[2.5rem] md:rounded-[4rem] flex flex-col justify-between relative overflow-hidden group shadow-luxury min-h-[450px] md:min-h-[600px]">
              <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-brand-orange/10 rounded-full -mr-[200px] md:-mr-[300px] -mt-[200px] md:-mt-[300px] blur-[100px] md:blur-[140px] group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-4 md:px-6 py-1.5 md:py-2 bg-white/5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-8 md:mb-12 border border-white/10 italic text-white/40">
                  Mission Statement • Edition 2.6
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-7xl font-display font-bold mb-6 md:mb-8 leading-[1.1] md:leading-[1] tracking-[-0.04em]">
                  Where Comfort <br />
                  <span className="text-brand-orange italic font-light drop-shadow-2xl">meets your soul.</span>
                </h2>
                <p className="text-base md:text-xl opacity-60 max-w-xl leading-relaxed font-light font-sans mt-4 md:mt-6">
                  We combine clinical precision with soulful lifestyle integration to help you reclaim every step in India's unique urban terrain.
                </p>
              </div>
              
              <div className="mt-10 md:mt-16 flex flex-wrap gap-8 md:gap-12 relative z-10">
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="text-3xl md:text-4xl font-display font-bold text-brand-orange">Global</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Steps Analyzed</span>
                </div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="text-3xl md:text-4xl font-display font-bold text-brand-gold">Pro</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Clinical Patterns</span>
                </div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="text-3xl md:text-4xl font-display font-bold text-white">Latest</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Updates</span>
                </div>
              </div>
            </div>

            {/* Side Column - Editorial Accents (Shopify 2026 Style) */}
            <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 40px 80px -15px rgba(216, 116, 42, 0.15)" }}
                className="flex-1 bg-brand-orange text-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] group relative overflow-hidden flex flex-col justify-between min-h-[250px] md:min-h-[300px] shadow-luxury transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl w-fit mb-8 md:mb-12 backdrop-blur-md">
                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold leading-[1] mb-4 md:mb-6 tracking-[-0.03em]">Clinical <br />Foundation.</h3>
                  <p className="text-white/80 font-light leading-relaxed text-sm">
                    Every data point is validated against certified orthopedics and global kinetic standards.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 40px 80px -15px rgba(232, 165, 82, 0.15)" }}
                className="flex-1 bg-brand-gold text-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] group relative overflow-hidden flex flex-col justify-between min-h-[250px] md:min-h-[300px] shadow-luxury transition-all duration-500"
              >
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl w-fit mb-8 md:mb-12 backdrop-blur-md">
                    <Zap className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold leading-[1] mb-4 md:mb-6 tracking-[-0.03em]">Rapid <br />Intervention.</h3>
                  <p className="text-white/80 font-light leading-relaxed text-sm">
                    Direct access to immediate DIY protocols for acute plantar and heel discomfort.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-12 bg-white p-8 md:p-24 rounded-[2.5rem] md:rounded-[4rem] border border-brand-brown/5 shadow-soft flex flex-col lg:flex-row gap-12 lg:gap-20 items-center group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-brand-beige rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
               <div className="flex-1 relative z-10">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <span className="w-8 md:w-12 h-px bg-brand-orange" />
                  <span className="text-brand-orange font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px]">Curated Gear</span>
                </div>
                <h3 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold text-brand-brown mb-6 md:mb-8 leading-[1.1] md:leading-[1] tracking-tighter">
                  Handpicked <br />Science-First <span className="text-brand-gold italic font-medium">Solutions.</span>
                </h3>
                <p className="text-sm md:text-xl text-brand-taupe/60 leading-relaxed font-light max-w-2xl mb-8 md:mb-12">
                  We meticulously research every footcare product in the Indian market to bring you only the most effective tools.
                </p>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {['Custom Insoles', 'Electric Massagers', 'Compression Sleeves', 'Arch Supports'].map(tag => (
                    <span key={tag} className="px-4 md:px-8 py-2 md:py-4 bg-brand-beige rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-brand-brown border border-brand-brown/5 hover:bg-brand-orange hover:text-white transition-all cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-96 aspect-square bg-brand-beige rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center relative group overflow-hidden border border-brand-brown/5 shadow-inner">
                <div className="absolute inset-0 bg-brand-orange/5 group-hover:bg-brand-orange/10 transition-all duration-700" />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <ExternalLink className="w-16 h-16 md:w-24 md:h-24 text-brand-orange group-hover:scale-110 transition-transform duration-700" />
                </motion.div>
                <div className="absolute bottom-6 md:bottom-10 inset-x-0 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-taupe/40">Marketplace Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MythBusters />

      <FootProblemQuiz />

      {user && <FootJournal />}
      
      {/* Testimonials Section */}
      <section className="py-40 bg-brand-brown text-brand-beige relative overflow-hidden">
        <div className="section-padding relative z-10">
        <div className="flex flex-col items-center text-center mb-32">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-px bg-brand-orange" />
              <span className="text-brand-orange font-bold uppercase tracking-[0.6em] text-[10px]">User Stories</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-black leading-[1] tracking-[-0.04em] mb-8">
              RELIEF FOR <br />
              <span className="text-brand-orange italic font-bold">EVERYONE<span className="text-brand-beige">.</span></span>
            </h2>
            <p className="text-base md:text-lg opacity-60 max-w-2xl mx-auto font-light leading-relaxed">Join many who have reclaimed their mobility with our structured protocols.</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-orange/40 mt-6 italic">These are sample reviews based on common clinical feedback</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                name: "Anjali Sharma",
                role: "Teacher, New Delhi",
                text: "Standing for 6 hours a day was becoming impossible. The Plantar Fasciitis protocol changed my life in just 3 weeks.",
                condition: "Success Case"
              },
              {
                name: "Vikram Mehta",
                role: "IT Professional, Bangalore",
                text: "I didn't even realize I had flat feet until I took the quiz. The arch support exercises are simple and actually work.",
                condition: "Optimization"
              },
              {
                name: "Dr. Rajesh Iyer",
                role: "Orthopedic Surgeon, Mumbai",
                text: "Comfoot provides accurate, structured information that bridges the gap between clinical advice and lifestyle.",
                condition: "Clinical Verdict"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 flex flex-col gap-10 group"
              >
                <div className="flex gap-1.5 text-brand-orange">
                  {[...Array(5)].map((_, i) => <Zap key={i} className="w-4 h-4 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />)}
                </div>
                <p className="text-3xl leading-tight font-light italic opacity-70 group-hover:opacity-100 transition-opacity">"{t.text}"</p>
                <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-brand-beige">{t.name}</h4>
                    <p className="text-[10px] opacity-40 uppercase tracking-[0.4em] mt-1">{t.role}</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-4 py-2 bg-brand-beige/5 rounded-full border border-white/5">
                    {t.condition}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Selection */}
      <section id="explore" className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-gold/5 rounded-full blur-[120px] -mr-20 -mt-20" />
        
        <div className="section-padding relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-px bg-brand-orange" />
                <span className="text-brand-orange font-bold uppercase tracking-[0.6em] text-[10px]">The Diagnostics</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-brand-brown leading-[1] tracking-[-0.04em]">
                CHOOSE <br />
                <span className="text-brand-orange italic font-bold">CONDITION<span className="text-brand-brown">.</span></span>
              </h2>
              <p className="text-base md:text-lg text-brand-taupe/60 mt-6 font-light leading-relaxed max-w-xl">
                Deep-dive clinical analysis on common urban foot issues to find relief that fits your lifestyle.
              </p>
            </div>
            
            {/* Filter UI */}
            <div className="flex flex-col gap-6 md:items-end">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60 ml-2">Type of Pain</label>
                  <div className="flex flex-wrap gap-2">
                    {allPainTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setPainFilter(type)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          painFilter === type 
                            ? 'bg-brand-orange text-white border-brand-orange shadow-md' 
                            : 'bg-white text-brand-taupe border-brand-brown/10 hover:border-brand-orange/40'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60 ml-2">Affected Area</label>
                <div className="flex flex-wrap gap-2">
                  {allAreas.map(area => (
                    <button
                      key={area}
                      onClick={() => setAreaFilter(area)}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        areaFilter === area 
                          ? 'bg-brand-brown text-brand-beige border-brand-brown shadow-md' 
                          : 'bg-white text-brand-taupe border-brand-brown/10 hover:border-brand-orange/40'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-24 h-24 rounded-full border border-brand-brown/10 flex items-center justify-center text-brand-brown/20 animate-spin-slow">
                <Activity className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredConditions.length > 0 ? (
                filteredConditions.map((condition, idx) => (
                  <motion.div
                    key={condition.id}
                    layout
                    custom={idx}
                    variants={revealVariants}
                    initial="hidden"
                    whileInView="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <ConditionCard 
                      condition={condition} 
                      onQuickView={() => setSelectedCondition(condition)}
                      onLearnMore={() => {
                        setSelectedCondition(condition);
                        setView('detail');
                      }}
                      isComparing={compareList.includes(condition.id)}
                      onToggleCompare={() => toggleCompare(condition.id)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <div className="w-20 h-20 bg-brand-beige rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="w-10 h-10 text-brand-taupe/20" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-brand-brown mb-2">No conditions found</h3>
                  <p className="text-brand-taupe/60">Try adjusting your filters to find what you're looking for.</p>
                  <button 
                    onClick={() => { setPainFilter('All'); setAreaFilter('All'); }}
                    className="mt-8 text-brand-orange font-bold uppercase tracking-widest text-[10px] hover:underline"
                  >
                    Reset all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Comparison Floating Bar */}
      <AnimatePresence>
        {compareList.length > 0 && !showComparison && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-2xl"
          >
            <div className="bg-brand-brown text-brand-beige p-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {compareConditions.map((c, i) => (
                    <motion.div 
                      key={c.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 rounded-full bg-brand-orange border-2 border-brand-brown flex items-center justify-center text-[10px] font-bold shadow-lg"
                      title={c.title}
                    >
                      {c.title.charAt(0)}
                    </motion.div>
                  ))}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-0.5">Comparison List</p>
                  <p className="text-xs opacity-70">{compareList.length} condition{compareList.length > 1 ? 's' : ''} selected</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCompareList([])}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:text-brand-orange transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setShowComparison(true)}
                  disabled={compareList.length < 2}
                  className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    compareList.length >= 2 
                      ? 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-lg active:scale-95' 
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  Compare Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <ConditionComparison 
            conditions={compareConditions}
            onClose={() => setShowComparison(false)}
            onSelectCondition={(condition) => {
              setSelectedCondition(condition);
              setView('detail');
              setShowComparison(false);
            }}
          />
        )}
      </AnimatePresence>

      <section id="compare" className="py-40 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FAF9F6]/50 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#2D241E 2px, transparent 2px)', backgroundSize: '80px 80px' }} />
        
        <div className="section-padding relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-gold/10 text-brand-gold rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-10 border border-brand-gold/20">
                Decision Framework
              </div>
              <h2 className="text-5xl md:text-8xl font-display font-bold text-brand-brown leading-[0.9] tracking-[-0.05em]">
                Not Sure What <br />
                <span className="text-brand-gold italic font-light lowercase">you need?</span>
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-brand-taupe/60 max-w-md leading-relaxed font-light font-sans">
              A curated navigation through clinical patterns to find your optimal support protocol.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CONDITIONS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                viewport={{ once: true }}
                className="group relative bg-[#F9F6F2] p-12 rounded-[4rem] border border-brand-brown/5 hover:border-brand-orange/20 transition-all duration-700 min-h-[450px] flex flex-col justify-between"
              >
                <div className="absolute top-12 right-12 text-5xl font-display font-black text-brand-brown/[0.03] group-hover:text-brand-orange/5 transition-colors">
                  {i + 1}
                </div>
                
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-orange shadow-soft mb-12 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-brand-brown mb-4 tracking-tight leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-brand-taupe/60 font-light text-base leading-relaxed line-clamp-2">
                    {c.shortDesc}
                  </p>
                </div>

                <div className="pt-12 border-t border-brand-brown/5">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-brand-orange">Priority Gear</span>
                      <span className="text-base font-medium text-brand-brown">{c.products[0].name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCondition(c);
                        setView('detail');
                      }}
                      className="group/select flex items-center justify-between py-6 px-10 bg-brand-brown text-brand-beige rounded-3xl text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-brand-orange transition-all duration-500 shadow-xl"
                    >
                      Protocol
                      <ArrowRight className="w-4 h-4 group-hover/select:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-brand-brown text-brand-beige relative overflow-hidden">
        {/* Designer Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-brand-orange/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-brand-gold/20 blur-[100px] rounded-full" />
        </div>

        <div className="section-padding relative z-10">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-12 bg-brand-gold" />
                <span className="text-brand-gold font-bold uppercase tracking-[0.25em] text-[10px]">Our Philosophy</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-display font-bold mb-10 leading-[0.95] tracking-tight">
                Crafting <span className="text-brand-gold italic">Wellness</span> for Every Step.
              </h2>
              <div className="space-y-8 text-xl leading-relaxed opacity-80 font-light">
                <p>
                  Comfoot is a focused foot wellness platform that believes in education-first guidance. We understand that foot pain isn't just a physical discomfort—it affects your mobility, your productivity, and your overall quality of life.
                </p>
                <p>
                  Our mission is to help you understand the root cause of your foot problems before recommending structured support options. We curate high-quality products that provide real relief, helping you make informed decisions for your sole.
                </p>
              </div>
              
              <div className="mt-12 p-8 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                <p className="font-display text-3xl font-bold text-brand-gold italic leading-tight">
                  “Educate First. <br />Monetize Responsibly.”
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-4 opacity-40">The Comfoot Manifesto</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-brand-beige/5 rounded-[3rem] flex flex-col items-center justify-center p-16 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-brand-gold/5 group-hover:bg-brand-gold/10 transition-all duration-700" />
                <div className="text-center space-y-8 relative z-10">
                  <div className="w-24 h-24 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-8 border border-brand-gold/30">
                    <HelpCircle className="w-10 h-10 text-brand-gold" />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-brand-beige">Have Questions?</h3>
                  <p className="text-lg opacity-70 font-light leading-relaxed">Our team is here to help you navigate your foot wellness journey with care and guidance.</p>
                  <div className="flex flex-col items-center gap-6">
                    <a href="mailto:hello@comfoot.in" className="bg-brand-gold text-brand-brown px-12 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-brand-beige hover:text-brand-brown transition-all shadow-xl active:scale-95">
                      Contact Us
                    </a>
                    <a 
                      href="https://www.instagram.com/comfoot._/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-brand-gold hover:text-brand-beige transition-all group/insta px-6 py-2 rounded-full border border-brand-gold/20 hover:border-brand-beige/40"
                    >
                      <Instagram className="w-4 h-4 group-hover/insta:rotate-12 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">@comfoot._</span>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Abstract floating shapes */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-[#FAF9F6] text-brand-taupe pt-40 pb-16 px-6 border-t border-brand-brown/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D241E 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 mb-32">
            <div className="lg:col-span-5">
              <Logo className="mb-12" />
              <p className="text-2xl max-w-sm leading-relaxed text-brand-brown/70 font-light mb-12 tracking-tight">
                Reimagining the future of <span className="text-brand-brown font-medium italic">foot wellness</span> through data, curation, and structured guidance.
              </p>
              <div className="flex items-center gap-6">
                {[Twitter, Linkedin, Instagram, Mail].map((Icon, i) => (
                  <motion.a 
                    key={i}
                    whileHover={{ y: -4, color: "#D8742A" }}
                    href="#" 
                    className="text-brand-taupe/40 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-7 grid md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-8">
                <h4 className="text-brand-brown font-bold uppercase tracking-[0.4em] text-[10px]">Ecosystem</h4>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">
                  <li><a href="#home" className="hover:text-brand-orange transition-colors">Platform Home</a></li>
                  <li><a href="#explore" className="hover:text-brand-orange transition-colors">Diagnostics</a></li>
                  <li><a href="#compare" className="hover:text-brand-orange transition-colors">Comparison Engine</a></li>
                  <li><a href="#about" className="hover:text-brand-orange transition-colors">About Company</a></li>
                  <li><a href="#about" className="hover:text-brand-orange transition-colors">Our Ethos</a></li>
                </ul>
              </div>

              <div className="flex flex-col gap-8">
                <h4 className="text-brand-brown font-bold uppercase tracking-[0.4em] text-[10px]">Knowledge</h4>
                <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60">
                  <li><a href="#" className="hover:text-brand-orange transition-colors">Scientific Journals</a></li>
                  <li><a href="#" className="hover:text-brand-orange transition-colors">Product Studies</a></li>
                  <li><a href="#" className="hover:text-brand-orange transition-colors">Community Forum</a></li>
                  <li><a href="#" className="hover:text-brand-orange transition-colors">Partner Program</a></li>
                </ul>
              </div>

              <div className="flex flex-col gap-8">
                <h4 className="text-brand-brown font-bold uppercase tracking-[0.4em] text-[10px]">The Journal</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/40 leading-relaxed mb-4">
                  Weekly insights into elite foot health and curated tech.
                </p>
                <form className="relative group" onSubmit={handleNewsletterSubmit}>
                  <input 
                    type="email" 
                    placeholder="PROTOCOL@COMFOOT.IN" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterStatus === 'loading'}
                    className="w-full bg-white border-b-2 border-brand-brown/10 py-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-brand-orange transition-colors disabled:opacity-50 placeholder:text-brand-taupe/20 px-4"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="absolute right-0 bottom-3 text-brand-orange p-2 hover:bg-brand-orange/10 rounded-full transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {newsletterMessage && (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[9px] font-bold uppercase tracking-widest mt-4 ${newsletterStatus === 'success' ? 'text-emerald-600' : 'text-brand-orange'}`}
                      >
                        {newsletterMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-brand-brown/5 gap-8">
            <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.4em] text-brand-taupe/40">
              <span>© Comfoot Labs</span>
              <span className="hidden md:block italic">Where Comfort meets your soul</span>
              <button 
                onClick={() => setShowAdmin(true)} 
                className="hover:text-brand-brown transition-colors flex items-center gap-2 group/console"
              >
                Access Console
                <ArrowRight className="w-2.5 h-2.5 group-hover/console:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.4em] text-brand-taupe/60">
              <a href="#" className="hover:text-brand-orange transition-colors">Privacy Charter</a>
              <a href="#" className="hover:text-brand-orange transition-colors">Usage Terms</a>
              <a href="#" className="hover:text-brand-orange transition-colors">Diagnostics Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
