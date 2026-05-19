import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  RotateCcw, 
  Activity, 
  Clock, 
  MapPin, 
  Footprints, 
  Zap,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
  Stethoscope,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Types ---

interface Option {
  id: string;
  text: string;
  scores: Record<string, number>;
}

interface Question {
  id: number;
  text: string;
  icon: React.ReactNode;
  options: Option[];
}

interface Result {
  id: string;
  title: string;
  explanation: string;
  causes: string[];
  tips: string[];
  products: Product[];
}

interface Product {
  name: string;
  description: string;
  bestFor: string;
  link: string;
}

// --- Data ---

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Where is the core of your discomfort?",
    icon: <MapPin className="w-6 h-6" />,
    options: [
      { id: 'q1-1', text: "Heel (Sharp pain underneath or at the back)", scores: { heel: 4, achilles: 1, heel_spurs: 3 } },
      { id: 'q1-2', text: "Arch (Deep ache in the middle of the foot)", scores: { flat: 4, plantar: 2 } },
      { id: 'q1-3', text: "All of the ball / Forefoot area", scores: { metatarsalgia: 5, morton: 2 } },
      { id: 'q1-4', text: "Specifically between the 3rd and 4th toes", scores: { morton: 5 } },
      { id: 'q1-5', text: "Big toe joint (Inner edge protrusion)", scores: { bunion: 5 } },
      { id: 'q1-6', text: "Distributed numbness or burning sensation", scores: { diabetic: 5, neuropathy: 4 } },
    ]
  },
  {
    id: 2,
    text: "When do you feel the 'threshold' pain most?",
    icon: <Clock className="w-6 h-6" />,
    options: [
      { id: 'q2-1', text: "First steps in the morning (intense stabbing)", scores: { heel: 5, plantar: 4 } },
      { id: 'q2-2', text: "After sitting for a while, then standing", scores: { heel: 4, plantar: 3 } },
      { id: 'q2-3', text: "Gradually worsening towards evening", scores: { fatigue: 5, flat: 2 } },
      { id: 'q2-4', text: "During high-impact activity (running/jumping)", scores: { achilles: 5, metatarsalgia: 4 } },
      { id: 'q2-5', text: "Constant pain even while off your feet", scores: { complex: 4, diabetic: 3 } },
    ]
  },
  {
    id: 3,
    text: "What is the primary character of the pain?",
    icon: <Zap className="w-6 h-6" />,
    options: [
      { id: 'q3-1', text: "Sharp, like walking on a 'nail' or 'pebble'", scores: { heel: 5, heel_spurs: 4, morton: 4 } },
      { id: 'q3-2', text: "Dull, heavy aching like muscle fatigue", scores: { fatigue: 5, flat: 3 } },
      { id: 'q3-3', text: "Electric, tingling, or burning sensation", scores: { diabetic: 5, morton: 3 } },
      { id: 'q3-4', text: "Stiff and tight (hard to flex the foot)", scores: { achilles: 5, plantar: 2 } },
      { id: 'q3-5', text: "Itchy and tender with skin splitting", scores: { dry_cracked: 6 } },
    ]
  },
  {
    id: 4,
    text: "Examine your most-worn shoes. What do you see?",
    icon: <Footprints className="w-6 h-6" />,
    options: [
      { id: 'q4-1', text: "Inside edge is flattened (Inward collapse)", scores: { flat: 5, fatigue: 2 } },
      { id: 'q4-2', text: "Outside edge is more worn down", scores: { neutral: 2, stress: 3 } },
      { id: 'q4-3', text: "Worn heavily at the very center of the heel", scores: { heel: 4, heel_spurs: 2 } },
      { id: 'q4-4', text: "Wear is even across the whole sole", scores: { neutral: 5 } },
    ]
  },
  {
    id: 5,
    text: "Describe your typical daily movement load.",
    icon: <Activity className="w-6 h-6" />,
    options: [
      { id: 'q5-1', text: "Mostly sedentary (Desk-based office work)", scores: { neutral: 3, stiffness: 2 } },
      { id: 'q5-2', text: "Moderate (Commuting + light walking)", scores: { neutral: 1, fatigue: 2 } },
      { id: 'q5-3', text: "Intense standing (Retail/Healthcare/Teaching)", scores: { fatigue: 5, flat: 2, heel: 2 } },
      { id: 'q5-4', text: "Performance load (Running/Training/Athletics)", scores: { achilles: 4, heel: 2, metatarsalgia: 3 } },
    ]
  },
  {
    id: 6,
    text: "Are there any visible changes to the foot shape?",
    icon: <ShieldAlert className="w-6 h-6" />,
    options: [
      { id: 'q6-1', text: "Big toe joint is bulging or red", scores: { bunion: 6 } },
      { id: 'q6-2', text: "Toe(s) are curling downward (Hammer shape)", scores: { hammertoes: 6 } },
      { id: 'q6-3', text: "Generalized swelling around the ankle", scores: { diabetic: 2, fatigue: 4, inflammation: 3 } },
      { id: 'q6-4', text: "Skin is thick, yellowed, and has fissures", scores: { dry_cracked: 6 } },
      { id: 'q6-5', text: "No visible changes in shape or skin", scores: { neutral: 3 } },
    ]
  },
  {
    id: 7,
    text: "Do you have any systemic health conditions?",
    icon: <Stethoscope className="w-6 h-6" />,
    options: [
      { id: 'q7-1', text: "Diabetes (Type 1 or 2)", scores: { diabetic: 7 } },
      { id: 'q7-2', text: "Rheumatoid or Osteoarthritis", scores: { bunion: 3, complex: 3, fatigue: 2 } },
      { id: 'q7-3', text: "Poor circulation or heart conditions", scores: { diabetic: 4, fatigue: 4 } },
      { id: 'q7-4', text: "No chronic health conditions", scores: { neutral: 3 } },
    ]
  },
  {
    id: 8,
    text: "What is your primary walking surface?",
    icon: <MapPin className="w-6 h-6" />,
    options: [
      { id: 'q8-1', text: "Concrete, Marbles, or Hard Tiled floors", scores: { fatigue: 5, heel: 3, metatarsalgia: 2 } },
      { id: 'q8-2', text: "Soft carpets or gym flooring", scores: { neutral: 3 } },
      { id: 'q8-3', text: "Uneven terrain (Trails/Gravel/Grass)", scores: { achilles: 4, flat: 2 } },
      { id: 'q8-4', text: "Indoors without shoes usually", scores: { flat: 3, heel: 2 } },
    ]
  },
  {
    id: 9,
    text: "Touch the area of pain. Does it feel tender?",
    icon: <Sparkles className="w-6 h-6" />,
    options: [
      { id: 'q9-1', text: "Extremely tender to direct pressure", scores: { heel_spurs: 5, bunion: 4 } },
      { id: 'q9-2', text: "Painful when squeezing the whole foot", scores: { morton: 5, complex: 2 } },
      { id: 'q9-3', text: "Feels better with massage/pressure", scores: { fatigue: 4, flat: 1 } },
      { id: 'q9-4', text: "No tenderness when touched", scores: { neutral: 3, diabetic: 2 } },
    ]
  },
  {
    id: 10,
    text: "What is the visual profile of your arch?",
    icon: <Footprints className="w-6 h-6" />,
    options: [
      { id: 'q10-1', text: "High Arch (Clear tunnel underneath)", scores: { neutral: 1, achilles: 2, stress: 3 } },
      { id: 'q10-2', text: "Low/Flat (Sole fully contacts floor)", scores: { flat: 6, fatigue: 4 } },
      { id: 'q10-3', text: "Normal Arch profile", scores: { neutral: 5 } },
      { id: 'q10-4', text: "Variable (Changes when I stand up)", scores: { flat: 4, neutral: 2 } },
    ]
  },
  {
    id: 11,
    text: "What is your 'Go-To' footwear?",
    icon: <Zap className="w-6 h-6" />,
    options: [
      { id: 'q11-1', text: "Supportive Performance Sneakers", scores: { neutral: 4 } },
      { id: 'q11-2', text: "Thin Flats (Converse, Vans, Ballet flats)", scores: { flat: 5, heel: 4 } },
      { id: 'q11-3', text: "Heels or Narrow Pointed shoes", scores: { bunion: 6, morton: 5, metatarsalgia: 4 } },
      { id: 'q11-4', text: "Open Sandals or Barefoot at home", scores: { dry_cracked: 5, flat: 3 } },
      { id: 'q11-5', text: "Standard Work Boots / Formal Shoes", scores: { fatigue: 5, heel: 2 } },
    ]
  },
  {
    id: 12,
    text: "How does the pain behave after 20 mins of rest?",
    icon: <Clock className="w-6 h-6" />,
    options: [
      { id: 'q12-1', text: "Disappears completely", scores: { fatigue: 6 } },
      { id: 'q12-2', text: "Continues as a dull background ache", scores: { achilles: 3, flat: 3 } },
      { id: 'q12-3', text: "Does not change at all", scores: { complex: 4, diabetic: 3 } },
      { id: 'q12-4', text: "Actually stiffens up and feels worse later", scores: { heel: 6, plantar: 5, achilles: 4 } },
    ]
  }
];

const RESULTS: Record<string, Result> = {
  flat: {
    id: 'flat',
    title: "Flat Feet / Overpronation Impact",
    explanation: "Your answers indicate that your arches may not be providing the necessary structural support, leading to overpronation (inward rolling). This misalignment can cause chain-reaction pain in your ankles, knees, and lower back.",
    causes: [
      "Inherited structural foot defects",
      "Aging or injury causing tendon wear",
      "Prolonged standing on unyielding surfaces",
      "Pregnancy or sudden weight changes"
    ],
    tips: [
      "Switch to footwear with rigid mid-soles",
      "Perform arch-activation exercises daily",
      "Avoid barefoot walking on hard tiles",
      "Replace worn-out shoes that lean inward"
    ],
    products: [
      {
        name: "Frido Rigid Arch Support Insole",
        description: "Best-in-class semi-rigid orthotic designed to lift collapsed arches and stabilize the foot.",
        bestFor: "Best Fit: Flat Feet & Structural Support",
        link: "https://amzn.in/d/066diPwp"
      },
      {
        name: "Boldfit Arch Support",
        description: "Comfortable silicone/gel support inserts for rapid fatigue relief during long hours.",
        bestFor: "Daily Comfort & Low Impact",
        link: "https://amzn.in/d/0bgzXhjD"
      }
    ]
  },
  heel: {
    id: 'heel',
    title: "Plantar Fasciitis / Acute Heel Pain",
    explanation: "The stabbing sensation during your first morning steps is a strong indicator of Plantar Fasciitis—inflammation of the ligament connecting your heel to your toes. Your foot likely tightens overnight, and 're-tears' upon the first step.",
    causes: [
      "Excessive strain from running or jumping",
      "Tight calf muscles pulling on the heel bone",
      "Worn-out footwear with zero heel cushioning",
      "Sudden increase in walking distance"
    ],
    tips: [
      "Roll a frozen bottle under your arch for 10 mins nightly",
      "Perform wall-stretches for your calves before bed",
      "Wear supportive slippers indoors; avoid being barefoot",
      "Use heel cups to absorb initial shock during walking"
    ],
    products: [
      {
        name: "Frido Plantar Insole",
        description: "Clinically contoured insoles with a deep heel cradle and medical-grade EVA cushioning.",
        bestFor: "Best Fit: Plantar Fasciitis & Heel Spurs",
        link: "https://amzn.to/4rZCbsz"
      },
      {
        name: "Foot Massager Roller",
        description: "Ergonomic wooden roller for myofascial release of the plantar ligament.",
        bestFor: "Essential Recovery Tool",
        link: "https://amzn.to/4aFri8e"
      }
    ]
  },
  fatigue: {
    id: 'fatigue',
    title: "Work-Related Muscle Fatigue",
    explanation: "Standing on hard floors for 6+ hours causes 'static load' where blood pools in the lower extremities and muscles become oxygen-starved. This leads to that heavy, dull ache you experience in the evening.",
    causes: [
      "Static standing in retail/healthcare environments",
      "Hard surface impact without energy-return",
      "Poorly fitted, heavy work boots",
      "Lack of weight-shifting movement"
    ],
    tips: [
      "Elevate your feet above heart level for 15 mins daily",
      "Invest in 'Energy-Return' specialized insoles",
      "Compression socks are highly recommended for circulation",
      "Take micro-breaks to perform ankle circles"
    ],
    products: [
      {
        name: "Doctor Extra Soft Sports Shoes",
        description: "Maximum cushioning footwear designed for those standing on their feet all day.",
        bestFor: "Best Fit: Standing Jobs & Urban Commute",
        link: "https://amzn.to/3OCx4R9"
      },
      {
        name: "Compression Support Sleeves",
        description: "Improves lymphatic drainage and reduces evening swelling.",
        bestFor: "Commonly Used: Soreness & Swelling",
        link: "https://amzn.to/4b0AXHN"
      }
    ]
  },
  bunion: {
    id: 'bunion',
    title: "Bunion Management (Hallux Valgus)",
    explanation: "Your results suggest the big toe joint is being pushed out of alignment. This is often progressive and exacerbated by footwear that squeezes the forefoot, leading to a visible 'bump' and joint inflammation.",
    causes: [
      "Years of wearing narrow or pointed footwear",
      "Genetic ligament laxity",
      "Arthritic joint changes",
      "Repetitive stress on the forefoot"
    ],
    tips: [
      "Immediately switch to shoes with a extra-wide toe box",
      "Use silicone separators to reduce friction between toes",
      "Icing the joint after activity can reduce redness",
      "Night splints may help slow progression of the angle"
    ],
    products: [
      {
        name: "Frido Bunion Corrector",
        description: "Adjustable orthopedic brace to maintain proper toe alignment during sleep or rest.",
        bestFor: "Best Fit: Nightly Correction",
        link: "https://amzn.to/4sW7nZN"
      },
      {
        name: "Silicone Toe Separators",
        description: "Soft gel separators that divide the 1st and 2nd toes to relieve joint pressure.",
        bestFor: "Daily Wear & Friction Relief",
        link: "https://amzn.to/4cKDWDM"
      }
    ]
  },
  diabetic: {
    id: 'diabetic',
    title: "Diabetic Foot & Neuropathy Care",
    explanation: "This is a sensitive category. Numbness or tingling suggests your nerves may be affected by circulation or glucose levels. Protecting your feet from undetected injuries is the highest priority.",
    causes: [
      "Peripheral neuropathy from blood sugar levels",
      "Reduced signal of pain, heat, or cold",
      "Compromised circulation in lower limbs"
    ],
    tips: [
      "Use a mirror to check the bottom of your feet daily for cuts",
      "Always wear moisture-wicking, non-binding socks",
      "Never walk barefoot, even for a few steps",
      "Wash feet in lukewarm water; never use hot water"
    ],
    products: [
      {
        name: "Fixderma Foobetik Cream",
        description: "Intensive moisturizing cream specifically formulated for diabetic skin to prevent cracks.",
        bestFor: "Best Fit: Diabetic Skin Health",
        link: "https://amzn.to/4cNsg3o"
      },
      {
        name: "Kitcoz Foot Cream Roll-on",
        description: "Easy application moisture barrier to prevent diabetic heel fissures.",
        bestFor: "Essential Skin Protection",
        link: "https://amzn.to/4mSq9zN"
      }
    ]
  },
  dry_cracked: {
    id: 'dry_cracked',
    title: "Cracked Heel Fissures",
    explanation: "Hardened skin around the heel has lost its elasticity and is splitting under your body weight. This is more than a cosmetic issue; deep cracks can bleed and become infected.",
    causes: [
      "Open-back shoes causing skin to expand sideways",
      "Lack of essential lipid moisture in the skin",
      "Extreme dry weather or hot showers"
    ],
    tips: [
      "Apply urea-based creams twice a day",
      "Exfoliate GENTLY after a 15-minute soak",
      "Wear cotton socks after applying cream to lock in moisture",
      "Avoid wearing flip-flops for long periods"
    ],
    products: [
      {
        name: "Bodywise Urea Cream",
        description: "10%+ Urea concentration to chemically dissolve hard skin and heal cracks.",
        bestFor: "Best Fit: Severely Cracked Heels",
        link: "https://amzn.to/3OMQ5jH"
      },
      {
        name: "Gel-Lined Heel Socks",
        description: "Overnight therapy socks that provide a moist healing environment.",
        bestFor: "Intensive Overnight Repair",
        link: "https://amzn.to/4t1fFQ9"
      }
    ]
  },
  achilles: {
    id: 'achilles',
    title: "Achilles Tendinitis Protection",
    explanation: "The pain at the back of your leg signifies the Achilles tendon is under excessive tension. This is an 'overuse' signal from your body, often due to tight calves or sudden activity spikes.",
    causes: [
      "Sudden increase in running distance or speed",
      "Tight calf muscles pulling on the tendon attachment",
      "High-impact landing without proper heel support"
    ],
    tips: [
      "Rest is mandatory; avoid 'pushing through' this pain",
      "Gently stretch your calves using a wall or belt",
      "Use a slight heel lift to take the tension off the tendon",
      "Apply ice to the back of the ankle after activity"
    ],
    products: [
      {
        name: "Powerstep Foot Rocker",
        description: "Allows for safe, controlled eccentric stretching of the Achilles/Calf complex.",
        bestFor: "Best Fit: Recovery & Flexibility",
        link: "https://amzn.to/3ODWFsW"
      },
      {
        name: "Ankle Support Sleeve",
        description: "Medical compression to stabilize the joint and reduce tendon vibration.",
        bestFor: "Commonly Used: Stability & Relief",
        link: "https://amzn.to/4cwfpnl"
      }
    ]
  },
  metatarsalgia: {
    id: 'metatarsalgia',
    title: "Metatarsalgia / Ball-of-Foot Pain",
    explanation: "Inflammation is occurring at the heads of your metatarsal bones (just behind your toes). It often feels like you are walking on a fold in your sock or a small stone.",
    causes: [
      "High-impact activity on hard surfaces",
      "Wearing shoes with high heels or zero forefoot cushioning",
      "High arch structure concentrating weight on the forefoot",
      "Excess body weight putting pressure on the ball of the foot"
    ],
    tips: [
      "Avoid walking barefoot on hard floors",
      "Switch to shoes with a rocker bottom or thick forefoot cushioning",
      "Use metatarsal pads to 'lift' the transverse arch",
      "Ice the ball of the foot after long days"
    ],
    products: [
      {
        name: "Ball of Foot Gel Cushions",
        description: "Targeted gel padding that offloads pressure from the painful metatarsal heads.",
        bestFor: "Best Fit: Forefoot Pain & Burning",
        link: "https://amzn.to/4w1Vq7I"
      },
      {
        name: "Metatarsal Pad Inserts",
        description: "Felt or gel pads that redistribute weight away from the sensitive ball of the foot.",
        bestFor: "Structural Pressure Relief",
        link: "https://amzn.to/48wakJc"
      }
    ]
  },
  morton: {
    id: 'morton',
    title: "Morton's Neuroma Signal",
    explanation: "The localized tingling or 'electric' sensation between your 3rd and 4th toes suggests a nerve is being compressed by the surrounding bones. This is highly influenced by shoe width.",
    causes: [
      "Narrow-toe shoes squeezing the foot bones together",
      "High-heeled shoes shifting all weight to the forefoot",
      "Repetitive impact from running or jumping"
    ],
    tips: [
      "Wear shoes that are wide enough to let your toes wiggle",
      "Avoid high heels over 2 inches entirely for now",
      "Arch support helps create space between the bones in your forefoot",
      "Consult a doctor if numbness persists longer than a week"
    ],
    products: [
      {
        name: "Wide Toe Box Athletic Shoes",
        description: "Shoes designed to allow natural toe splay, preventing bone-on-nerve compression.",
        bestFor: "Best Fit: Neuroma & Compression Relief",
        link: "https://amzn.to/3OCx4R9"
      },
      {
        name: "Gel Toe Separators",
        description: "Soft spacers that gently increase the distance between your metatarsals.",
        bestFor: "Commonly Used: Nerve Decompression",
        link: "https://amzn.to/3QCGZqw"
      }
    ]
  },
  hammertoes: {
    id: 'hammertoes',
    title: "Hammertoe Deformity",
    explanation: "One or more of your toes are curling into a fixed 'V' shape. This is usually caused by an imbalance in the muscles and tendons that keep your toes straight.",
    causes: [
      "Ill-fitting shoes that are too short",
      "Underlying nerve or muscle damage",
      "Genetic predisposition"
    ],
    tips: [
      "Wear shoes with a deep and wide toe box",
      "Use toe crest pads to support the underneath of the curl",
      "Perform toe exercises like picking up marbles or towels",
      "Avoid shoes that narrow at the tip"
    ],
    products: [
      {
        name: "Toe Hallux Valgus Support",
        description: "Supportive braces for managing toe posture and improving alignment.",
        bestFor: "Best Fit: Toe Realignment",
        link: "https://amzn.to/4sXa2m3"
      },
      {
        name: "Comfort Toe Crest Pads",
        description: "Reduces pressure on the tips of hammered toes and eliminates friction.",
        bestFor: "Daily Comfort & Relief",
        link: "https://amzn.to/4unQ5Gg"
      }
    ]
  },
  neutral: {
    id: 'neutral',
    title: "Neutral Maintenance & Wellness",
    explanation: "Great news! Your feet appear to be functioning within a healthy range. Maintaining this balance through proper care is the best way to ensure lifelong mobility.",
    causes: [
      "Balanced gait and mechanics",
      "Proper footwear selection",
      "Good overall lower-body flexibility"
    ],
    tips: [
      "Replace your primary shoes every 6-8 months",
      "Continue with regular lower body stretching",
      "Don't ignore minor aches if they persist for more than 48 hours",
      "Invest in a foot massager for recovery after long days"
    ],
    products: [
      {
        name: "Daily Wellness Massager",
        description: "Simple yet effective tool for maintaining blood flow and muscle flexibility.",
        bestFor: "Best Fit: Prevention & Relaxation",
        link: "https://amzn.to/4aFri8e"
      },
      {
        name: "Premium Comfort Insoles",
        description: "Universal cushioning to add comfort to standard footwear.",
        bestFor: "Everyday Support",
        link: "https://amzn.in/d/0gh0wRDf"
      }
    ]
  },
  complex: {
    id: 'complex',
    title: "Complex Multi-Zone Strain",
    explanation: "Your symptoms across multiple areas suggest that one structural issue may be causing compensatory pain elsewhere. This 'chained' effect requires a professional assessment.",
    causes: [
      "Concurrent conditions (e.g., Flat feet + Bunion)",
      "High compensatory load from chronic misalignment",
      "Recent change in biomechanics (injury/new shoes)"
    ],
    tips: [
      "Consult a Podiatrist for a 3D gait analysis",
      "Switch to high-stability footwear immediately",
      "Bring your most worn shoes to a specialist to analyze wear",
      "Record your pain patterns in the Comfoot Journal for your doctor"
    ],
    products: [
      {
        name: "Ultimate Orthotic Bundle",
        description: "Comprehensive support for the entire foot platform, from heel to ball.",
        bestFor: "Best Fit: Multi-Symptom Relief",
        link: "https://amzn.to/4rZCbsz"
      },
      {
        name: "Professional Podiatry Locator",
        description: "Finding a specialist is the most important next step for complex overlaps.",
        bestFor: "Essential Expert Care",
        link: "https://www.apma.org/findapodiatrist"
      }
    ]
  },
  mixed: {
    id: 'mixed',
    title: "Mixed Symptom Profile",
    explanation: "You have strong indicators for more than one condition. This 'mixed' result is very common when a primary issue (like flat feet) starts affecting the heel or ball of the foot.",
    causes: [
      "Transitioning conditions",
      "Inconsistent footwear support",
      "Mixed activity surfaces"
    ],
    tips: [
      "Choose a 'hybrid' insole that offers both arch and heel support",
      "Rotate between two different pairs of supportive shoes",
      "Focus on whole-foot recovery drills",
      "Pay attention to which activity triggers which symptom"
    ],
    products: [
      {
        name: "All-Day Performance Insole",
        description: "The most versatile support system for those with changing or mixed symptoms.",
        bestFor: "Best Fit: Versatile Daily Support",
        link: "https://amzn.to/4rZCbsz"
      },
      {
        name: "Recovery & Alignment Kit",
        description: "A set of tools including separators and massagers for total foot wellness.",
        bestFor: "Commonly Used: Complete Relief",
        link: "https://amzn.to/4aFri8e"
      }
    ]
  }
};

// --- Component ---

export const FootProblemQuiz: React.FC = () => {
  const [step, setStep] = useState<number>(0); // 0: Start, 1-12: Questions, 13: Result
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({
    heel: 0,
    flat: 0,
    fatigue: 0,
    neutral: 0,
    bunion: 0,
    diabetic: 0,
    achilles: 0,
    dry_cracked: 0,
    complex: 0
  });
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [formSubmitted, setFormSubmitted] = useState({ email: false, contact: false });

  const handleStart = () => setStep(1);

  const handleAnswer = (option: Option) => {
    const newAnswers = { ...answers, [step]: option.text };
    setAnswers(newAnswers);

    const newScores = {
      heel: scores.heel + (option.scores.heel || 0),
      flat: scores.flat + (option.scores.flat || 0),
      fatigue: scores.fatigue + (option.scores.fatigue || 0),
      neutral: scores.neutral + (option.scores.neutral || 0),
      bunion: scores.bunion + (option.scores.bunion || 0),
      diabetic: scores.diabetic + (option.scores.diabetic || 0),
      achilles: scores.achilles + (option.scores.achilles || 0),
      dry_cracked: scores.dry_cracked + (option.scores.dry_cracked || 0),
      complex: scores.complex + (option.scores.complex || 0)
    };
    setScores(newScores);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length + 1);
      saveResultToFirebase(newScores, newAnswers);
    }
  };

  const saveResultToFirebase = async (finalScores: Record<string, number>, finalAnswers: Record<number, string>) => {
    setIsSaving(true);
    try {
      const result = getResultForSaving(finalScores);
      const data = {
        scores: finalScores,
        answers: finalAnswers,
        resultId: result.id,
        resultTitle: result.title,
        timestamp: serverTimestamp()
      };

      // Save to global collection for analytics/leads
      await addDoc(collection(db, 'quiz_results'), {
        userId: auth.currentUser?.uid || null,
        ...data
      });

      // Save to user profile if authenticated
      if (auth.currentUser) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'quizResults'), data);
      }
    } catch (error) {
      console.error("Error saving quiz result to Firebase:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const sendEmailResults = async () => {
    if (!email || !email.includes('@')) return;
    
    setIsSendingEmail(true);
    const result = getResult();
    try {
      const response = await fetch('/api/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resultTitle: result.title,
          explanation: result.explanation,
          tips: result.tips,
          products: result.products
        })
      });
      if (response.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getResultForSaving = (finalScores: Record<string, number>): Result => {
    const sortedScores = (Object.entries(finalScores) as [string, number][]).sort(([, a], [, b]) => b - a);
    const [topCategory] = sortedScores[0];
    return RESULTS[topCategory] || RESULTS.neutral;
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setScores({
      heel: 0,
      flat: 0,
      fatigue: 0,
      neutral: 0,
      bunion: 0,
      diabetic: 0,
      achilles: 0,
      dry_cracked: 0,
      complex: 0
    });
    setEmailSent(false);
    setEmail('');
  };

  const findNearbyPodiatrists = () => {
    const query = "podiatrist near me";
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const getResult = (): Result => {
    const sortedScores = (Object.entries(scores) as [string, number][]).sort(([, a], [, b]) => b - a);
    const [topCategory, topScore] = sortedScores[0];
    const [secondCategory, secondScore] = sortedScores[1];

    // Threshold for "High Score" - if two categories score 7 or more, it's complex
    const HIGH_SCORE_THRESHOLD = 7;

    if (topCategory === 'complex' || (topScore >= HIGH_SCORE_THRESHOLD && secondScore >= HIGH_SCORE_THRESHOLD && topCategory !== 'neutral' && secondCategory !== 'neutral')) {
      const complexResult = { ...RESULTS.complex };
      const topTitle = RESULTS[topCategory]?.title.split(' / ')[0] || topCategory;
      const secondTitle = RESULTS[secondCategory]?.title.split(' / ')[0] || secondCategory;
      complexResult.explanation = `Your assessment shows significant indicators for both ${topTitle} and ${secondTitle}. When symptoms overlap this strongly, it often indicates complex biomechanical factors that require a professional evaluation by a podiatrist.`;
      return complexResult;
    }

    if (topScore > 0 && (topScore - secondScore) <= 2 && topCategory !== 'neutral') {
      return RESULTS.mixed;
    }

    return RESULTS[topCategory] || RESULTS.neutral;
  };

  const handleShare = () => {
    const text = "I just checked my foot health on Comfoot.";
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: 'Comfoot Quiz', text, url });
    } else {
      alert("Copy this to share: " + text + " " + url);
    }
  };

  const currentQuestion = QUESTIONS[step - 1];
  const progress = (step / QUESTIONS.length) * 100;

  return (
    <section id="quiz" className="bg-brand-beige py-24 px-6" aria-labelledby="quiz-title">
      <div className="max-w-4xl mx-auto">
        <div className="sr-only" id="quiz-title">Foot Problem Finder Quiz</div>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-brand-orange/10 rounded-[2rem] mb-8 relative group">
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Footprints className="w-8 h-8 md:w-10 md:h-10 text-brand-orange" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-brand-orange rounded-full blur-xl -z-10"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-brand-brown mb-6 md:mb-8 leading-[1.1] tracking-tight">
                Find Your Foot Solution Instantly
              </h2>
              <p className="text-lg md:text-xl text-brand-taupe/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-light">
                Answer a few precisely crafted questions to receive an expert-guided insight into your foot health.
              </p>
              <p className="text-[10px] sm:text-xs text-brand-taupe/60 max-w-lg mx-auto mb-10 italic uppercase tracking-wider">
                This diagnostic uses clinical data patterns for educational awareness.
              </p>
              <motion.button
                onClick={handleStart}
                aria-label="Start the foot diagnostic quiz"
                whileHover={{ scale: 1.05, backgroundColor: "#E87C2E" }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 bg-brand-brown text-white px-10 py-5 sm:px-12 sm:py-6 rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 shadow-xl hover:shadow-brand-orange/20"
              >
                Start Diagnostic
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {step >= 1 && step <= QUESTIONS.length && (
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 40
              }}
              role="region"
              aria-live="polite"
              className="bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-soft border border-brand-brown/5"
            >
              {/* Progress Bar */}
              <div className="mb-8 md:mb-12">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.2em]">
                    Question {step} of {QUESTIONS.length}
                  </span>
                  <span className="text-[10px] font-bold text-brand-taupe uppercase tracking-widest opacity-40">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div 
                  className="h-2 w-full bg-brand-brown/5 rounded-full overflow-hidden relative"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-brand-orange"
                  />
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row items-center gap-4 mb-8 md:mb-10"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-beige rounded-2xl flex items-center justify-center text-brand-brown shrink-0">
                  {currentQuestion.icon}
                </div>
                <h3 className="text-xl md:text-3xl font-display font-bold text-brand-brown leading-tight text-center sm:text-left">
                  {currentQuestion.text}
                </h3>
              </motion.div>

              <motion.div 
                className="grid gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ 
                      scale: 1.01, 
                      x: 8, 
                      backgroundColor: "rgba(216, 116, 42, 0.05)",
                      borderColor: "rgba(216, 116, 42, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    aria-label={`Select option: ${option.text}`}
                    className="group flex items-center justify-between p-5 sm:p-6 md:p-8 rounded-2xl border-2 border-brand-beige transition-all duration-300 text-left active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-brand-brown/10 group-hover:bg-brand-orange transition-colors" />
                      <span className="text-base sm:text-lg md:text-xl font-medium text-brand-brown group-hover:text-brand-orange transition-colors">
                        {option.text}
                      </span>
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-brand-beige group-hover:border-brand-orange flex items-center justify-center transition-all shrink-0 ml-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {step === 13 && (
            <motion.div
              key="result"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              role="alert"
              aria-live="assertive"
              className="space-y-12"
            >
              {/* Email Results Section */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-brand-orange text-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg md:text-xl font-bold">Email Your Results</h4>
                    <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Get a copy sent to your inbox.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full sm:w-64 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all text-xs sm:text-sm"
                  />
                  <motion.button 
                    onClick={sendEmailResults}
                    disabled={isSendingEmail || emailSent}
                    whileHover={!isSendingEmail && !emailSent ? { scale: 1.05, backgroundColor: "#F7F5F0" } : {}}
                    whileTap={!isSendingEmail && !emailSent ? { scale: 0.95 } : {}}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-brand-orange rounded-xl font-bold transition-all disabled:opacity-50 text-[10px] sm:text-sm uppercase tracking-widest"
                  >
                    {isSendingEmail ? 'Sending' : emailSent ? 'Sent!' : 'Send'}
                  </motion.button>
                </div>
              </motion.div>
              {/* Gemini Deep Analysis Section */}
              {/* Find Podiatrists only */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-brand-brown text-brand-beige rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 md:p-16 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-brand-orange/10 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-3xl" />
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 relative z-10">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-orange rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                      <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-3xl font-display font-bold">Professional Consultation</h3>
                      <p className="text-xs sm:text-base text-brand-beige/70 font-light max-w-sm">While we provide guidance, professional diagnosis is key to long-term foot health.</p>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <motion.button 
                      onClick={findNearbyPodiatrists}
                      whileHover={{ scale: 1.05, backgroundColor: "#D8742A", color: "#FFFFFF" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-white text-brand-brown px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Find Podiatrists
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Result Header */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-soft border border-brand-brown/5 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-brand-orange" />
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-brand-orange/10 rounded-[1.5rem] md:rounded-full mb-6 md:mb-8">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-brand-orange" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-brand-brown mb-4 md:mb-8 leading-tight tracking-tight">
                  {getResult().title}
                </h2>
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-orange mb-4 md:mb-6">The Clinical Core</h3>
                  <p className="text-lg md:text-2xl text-brand-taupe/80 leading-relaxed font-light italic">
                    "{getResult().explanation}"
                  </p>
                </div>
              </motion.div>

              {/* Tips & Causes Grid */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="grid md:grid-cols-2 gap-8"
              >
                <div className="bg-brand-brown text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="p-2 bg-brand-gold/10 rounded-xl shrink-0">
                      <Info className="w-5 h-5 md:w-6 md:h-6 text-brand-gold" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold">Why This Happens</h3>
                  </div>
                  <ul className="space-y-4 md:space-y-5">
                    {getResult().causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-4 text-white/70 text-base md:text-lg font-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2.5 shrink-0" />
                        <span className="leading-relaxed">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-soft border border-brand-brown/5">
                  <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="p-2 bg-brand-orange/10 rounded-xl shrink-0">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-brand-orange" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-brand-brown">Management Tips</h3>
                  </div>
                  <ul className="space-y-4 md:space-y-5">
                    {getResult().tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-4 text-brand-taupe text-base md:text-lg font-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2.5 shrink-0" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Product Recommendations */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="pt-8"
              >
                <div className="text-center mb-12">
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-brand-brown mb-4">
                    Suggested Support Options
                  </h3>
                  <p className="text-brand-taupe/70 font-light">Curated solutions tailored to your specific patterns.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {getResult().products.map((product, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-soft border border-brand-brown/5 flex flex-col group hover:border-brand-orange/20 transition-all"
                    >
                      <div className="inline-block px-4 py-1.5 bg-brand-orange/5 text-brand-orange text-[9px] md:text-[10px] font-bold rounded-full mb-6 self-start uppercase tracking-[0.2em] border border-brand-orange/10">
                        {product.bestFor}
                      </div>
                      <h4 className="text-xl md:text-2xl font-display font-bold text-brand-brown mb-4 group-hover:text-brand-orange transition-colors">{product.name}</h4>
                      <p className="text-sm md:text-base text-brand-taupe/90 mb-8 flex-grow leading-relaxed font-light">
                        {product.description}
                      </p>
                      <motion.a 
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, backgroundColor: "#D8742A" }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`Check support options for ${product.name}`}
                        className="w-full inline-flex items-center justify-center gap-3 bg-brand-brown text-brand-beige py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-lg"
                      >
                        Check Support Options
                        <ArrowRight className="w-4 h-4" />
                      </motion.a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Conversion Features */}
              <div className="bg-brand-beige/80 backdrop-blur-sm rounded-[3rem] p-10 md:p-16 border border-brand-brown/10 space-y-12">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
                  {/* Email Guide */}
                  <div className="space-y-4 sm:space-y-6">
                    <h4 className="text-xl sm:text-2xl font-display font-bold text-brand-brown">Get Your Free Mini Foot Care Guide</h4>
                    <p className="text-sm sm:text-base text-brand-taupe font-light">A structured PDF guide to help you manage your foot wellness at home.</p>
                    {!formSubmitted.email ? (
                      <form 
                        onSubmit={async (e) => { 
                          e.preventDefault(); 
                          try {
                            await addDoc(collection(db, 'leads'), { 
                              type: 'email_guide', 
                              value: email, 
                              resultId: getResult().id,
                              createdAt: new Date().toISOString()
                            });
                            setFormSubmitted(prev => ({ ...prev, email: true })); 
                          } catch (err) {
                            console.error('Failed to submit lead', err);
                          }
                        }}
                        className="flex flex-col gap-3"
                      >
                        <input 
                          type="email" 
                          required
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-brand-brown/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 px-5 sm:px-6 text-xs sm:text-sm focus:outline-none focus:border-brand-orange transition-colors"
                        />
                        <motion.button 
                          type="submit" 
                          whileHover={{ scale: 1.02, backgroundColor: "#B65A1A" }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-brand-orange text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg"
                        >
                          Get Free Guide
                        </motion.button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3 text-brand-orange font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Guide sent to your email!</span>
                      </div>
                    )}
                  </div>

                  {/* Product Links */}
                  <div className="space-y-4 sm:space-y-6">
                    <h4 className="text-xl sm:text-2xl font-display font-bold text-brand-brown">Send Me Product Links</h4>
                    <p className="text-sm sm:text-base text-brand-taupe font-light">Receive direct links to recommended gear on WhatsApp.</p>
                    {!formSubmitted.contact ? (
                      <form 
                        onSubmit={async (e) => { 
                          e.preventDefault(); 
                          try {
                            await addDoc(collection(db, 'leads'), { 
                              type: 'product_links', 
                              value: contactInfo, 
                              resultId: getResult().id,
                              createdAt: new Date().toISOString()
                            });
                            setFormSubmitted(prev => ({ ...prev, contact: true })); 
                          } catch (err) {
                            console.error('Failed to submit lead', err);
                          }
                        }}
                        className="flex flex-col gap-3"
                      >
                        <input 
                          type="text" 
                          required
                          placeholder="Phone Number"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          className="w-full bg-white border border-brand-brown/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 px-5 sm:px-6 text-xs sm:text-sm focus:outline-none focus:border-brand-orange transition-colors"
                        />
                        <motion.button 
                          type="submit" 
                          whileHover={{ scale: 1.02, backgroundColor: "#2D1D13" }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-brand-brown text-brand-beige py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg"
                        >
                          Send Me Links
                        </motion.button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3 text-brand-orange font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Links are on the way!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Share & Restart */}
                <div className="pt-12 border-t border-brand-brown/10 flex flex-col sm:flex-row items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe">Was this helpful?</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={async () => {
                            try {
                              await addDoc(collection(db, 'feedback'), {
                                userId: auth.currentUser?.uid || null,
                                resultId: getResult().id,
                                rating: star,
                                createdAt: new Date().toISOString()
                              });
                              alert("Thank you for your feedback!");
                            } catch (err) {
                              console.error("Failed to save feedback", err);
                            }
                          }}
                          className="p-1 text-brand-taupe hover:text-brand-orange transition-colors"
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <motion.button 
                    onClick={handleShare}
                    whileHover={{ scale: 1.05, color: "#D8742A" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 text-brand-brown font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    Share My Results
                  </motion.button>
                  {auth.currentUser && (
                    <motion.button 
                      onClick={async () => {
                        const result = getResult();
                        try {
                          await addDoc(collection(db, 'users', auth.currentUser!.uid, 'journal'), {
                            date: new Date().toISOString().split('T')[0],
                            painLevel: Math.max(...Object.values(scores)), // Use highest score as proxy
                            symptoms: [result.title],
                            notes: `Quiz Result: ${result.title}. ${result.explanation.substring(0, 100)}...`,
                            activityLevel: 'moderate',
                            userId: auth.currentUser!.uid,
                            createdAt: serverTimestamp()
                          });
                          alert("Saved to your journal!");
                        } catch (err) {
                          console.error("Failed to save to journal", err);
                        }
                      }}
                      whileHover={{ scale: 1.05, color: "#2D1D13" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 text-brand-orange font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Save to Journal
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleRestart}
                    whileHover={{ scale: 1.05, color: "#2D1D13" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 text-brand-taupe font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart Quiz
                  </motion.button>
                </div>
                <div className="text-center mt-8">
                  <p className="text-[9px] text-brand-taupe/40 uppercase tracking-[0.2em] font-bold">
                    Your data helps us train our AI for better recommendations
                  </p>
                </div>
              </div>

              {/* Final Disclaimer */}
              <div className="text-center pt-8">
                <p className="text-[10px] text-brand-taupe/50 leading-relaxed italic max-w-2xl mx-auto">
                  This quiz provides general educational insights and should not be considered medical diagnosis or professional medical advice.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
