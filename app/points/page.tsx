"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FaChessPawn, FaChessBishop, FaChessKnight, FaChessRook, FaCrown, FaLock, FaCode, FaRobot, FaGithub, FaCircleCheck, FaServer, FaBrain, FaGitAlt, FaTerminal, FaDocker, FaAws, FaPaperPlane, FaXmark, FaNetworkWired, FaCloud, FaDatabase, FaGlobe, FaCalendarCheck } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import DashboardNavbar from "@/components/common/dashboard-navbar";

// --- RANK CONFIGURATION ---
const BADGES = [
  { label: "Pawn", band: "0-799", icon: <FaChessPawn />, grad: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900", bars: 4, base: 0, next: 800 },
  { label: "Bishop", band: "800-1199", icon: <FaChessBishop />, grad: "bg-gradient-to-br from-violet-200 to-violet-400 text-violet-900", bars: 4, base: 800, next: 1200 },
  { label: "Knight", band: "1200-1999", icon: <FaChessKnight />, grad: "bg-gradient-to-br from-pink-200 to-pink-400 text-pink-900", bars: 6, base: 1200, next: 2000 },
  { label: "Rook", band: "2000+", icon: <FaChessRook />, grad: "bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900", bars: 1, base: 2000, next: null }
];

const QUESTS = [
  // --- CORE SKILLS ---
  { id: 'git-1', title: "Git Fundamentals", type: 'core', minRank: 'Pawn', pts: 150, desc: "Init, Stage, Commit, and Push to GitHub.", icon: <FaGitAlt /> },
  { id: 'git-2', title: "Branching Strategy", type: 'core', minRank: 'Bishop', pts: 350, desc: "Feature branch workflow & Pull Request review.", icon: <FaGithub /> },

  // --- WEB DEV PATH ---
  { id: 'web-1', title: "Semantic Portfolio", type: 'web', minRank: 'Pawn', pts: 200, desc: "Responsive site using HTML5 & Flexbox/Grid.", icon: <FaCode /> },
  { id: 'web-2', title: "JS Dom Manipulation", type: 'web', minRank: 'Pawn', pts: 250, desc: "Interactive ToDo list with LocalStorage.", icon: <FaCode /> },
  { id: 'web-3', title: "React Components", type: 'web', minRank: 'Bishop', pts: 400, desc: "Single Page App (SPA) with React Hooks.", icon: <FaCode /> },
  { id: 'web-4', title: "Next.js Architecture", type: 'web', minRank: 'Knight', pts: 700, desc: "App Router, Server Actions, and Auth integration.", icon: <FaServer /> },
  { id: 'web-5', title: "Micro-Frontends", type: 'web', minRank: 'Rook', pts: 1000, desc: "Module Federation or Mono-repo setup (Turborepo).", icon: <FaNetworkWired /> },

  // --- AI / ML PATH ---
  { id: 'ai-1', title: "Data Analysis", type: 'ai', minRank: 'Pawn', pts: 200, desc: "Clean & Visualize data (Pandas/Matplotlib).", icon: <FaRobot /> },
  { id: 'ai-2', title: "Basic Classification", type: 'ai', minRank: 'Pawn', pts: 250, desc: "Scikit-Learn model (Logistic Reg/Decision Tree).", icon: <FaBrain /> },
  { id: 'ai-3', title: "Computer Vision (CNN)", type: 'ai', minRank: 'Bishop', pts: 400, desc: "Classify images using PyTorch or TensorFlow.", icon: <FaRobot /> },
  { id: 'ai-4', title: "Transformer Tuning", type: 'ai', minRank: 'Knight', pts: 700, desc: "Fine-tune BERT/GPT for specific NLP tasks.", icon: <FaBrain /> },
  { id: 'ai-5', title: "LLM Implementation", type: 'ai', minRank: 'Rook', pts: 1000, desc: "Implement RAG (Retrieval Augmented Gen) system.", icon: <FaBrain /> },

  // --- DEVOPS PATH ---
  { id: 'ops-1', title: "Terminal Basics", type: 'ops', minRank: 'Pawn', pts: 200, desc: "Navigation, Permissions (chmod), SSH keys.", icon: <FaTerminal /> },
  { id: 'ops-2', title: "Docker Basics", type: 'ops', minRank: 'Bishop', pts: 350, desc: "Containerize a simple Web/Python application.", icon: <FaDocker /> },
  { id: 'ops-3', title: "CI/CD Pipeline", type: 'ops', minRank: 'Knight', pts: 600, desc: "GitHub Actions workflow to test & lint on push.", icon: <FaServer /> },
  { id: 'ops-4', title: "IaC with Terraform", type: 'ops', minRank: 'Rook', pts: 900, desc: "Provision full infrastructure as code.", icon: <FaCloud /> },
  { id: 'ops-5', title: "Kubernetes Cluster", type: 'ops', minRank: 'Rook', pts: 1200, desc: "Deploy, scale, and manage pods on K8s.", icon: <FaServer /> },

  // --- SYSTEM DESIGN PATH ---
  { id: 'sys-1', title: "Database Design", type: 'sys', minRank: 'Bishop', pts: 350, desc: "Design a Normalized Schema (SQL) for an E-com store.", icon: <FaDatabase /> },
  { id: 'sys-2', title: "Scalability Basics", type: 'sys', minRank: 'Knight', pts: 600, desc: "Implement Load Balancing & Caching (Redis).", icon: <FaNetworkWired /> },
  { id: 'sys-3', title: "Design Twitter", type: 'sys', minRank: 'Knight', pts: 800, desc: "High-level design: Fan-out service & timeline gen.", icon: <FaNetworkWired /> },
  { id: 'sys-4', title: "Distributed Systems", type: 'sys', minRank: 'Rook', pts: 1500, desc: "Implement CAP Theorem logic / Event-Driven Arch.", icon: <FaServer /> },

  // --- CLOUD PATH ---
  { id: 'cloud-1', title: "AWS Core Services", type: 'cloud', minRank: 'Knight', pts: 600, desc: "Deploy a 3-tier app using EC2, RDS, and S3.", icon: <FaAws /> },
  { id: 'cloud-2', title: "Serverless Arch", type: 'cloud', minRank: 'Knight', pts: 700, desc: "Build an API using Lambda, API Gateway & DynamoDB.", icon: <FaCloud /> },
  { id: 'cloud-3', title: "VPC Architect", type: 'cloud', minRank: 'Rook', pts: 1000, desc: "Design Public/Private Subnets, NAT, and Security Groups.", icon: <FaNetworkWired /> },
  { id: 'cloud-4', title: "Global Scale", type: 'cloud', minRank: 'Rook', pts: 1200, desc: "Config CloudFront CDN and Route53 DNS strategies.", icon: <FaGlobe /> },
];

export default function RatingPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [heroIdx, setIdx] = useState(0);
  
  // FILTERS
  const [path, setPath] = useState<'web' | 'ai' | 'ops' | 'sys' | 'cloud'>('web'); 
  const [onlyCurrent, setOnlyCurrent] = useState(false);

  // SUBMISSION & CLAIM STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [repoLink, setRepoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState({ loading: false, msg: "", isErr: false });

  // DATA DERIVATION
  const rating = profile?.rating || "Pawn";
  const pts = profile?.points || 0;
  
  const userRankIdx = BADGES.findIndex(b => b.label === rating);
  const userRankVal = userRankIdx === -1 ? 0 : userRankIdx;
  const view = BADGES[heroIdx] || BADGES[0];
  const isUnlocked = heroIdx <= userRankVal;
  
  // DAILY CLAIM LOGIC
  const claimedToday = profile?.lastDailyClaimAt?.toDate().toDateString() === new Date().toDateString();

  // DYNAMIC GRADIENTS
  let nextGrad = "";
  let barGrad = "";

  if (rating === "Pawn") nextGrad = "bg-gradient-to-r from-violet-200 via-purple-100 to-violet-300 text-violet-900 border-violet-200";
  else if (rating === "Bishop") nextGrad = "bg-gradient-to-r from-pink-200 via-rose-100 to-pink-300 text-pink-900 border-pink-200";
  else nextGrad = "bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-amber-900 border-amber-200";

  if (view.label === "Pawn") barGrad = "bg-gradient-to-r from-violet-400 to-violet-600";
  else if (view.label === "Bishop") barGrad = "bg-gradient-to-r from-pink-400 to-pink-600";
  else barGrad = "bg-gradient-to-r from-amber-400 to-amber-600";

  useEffect(() => { setIdx(userRankVal) }, [rating]);

  const nav = (d: number) => setIdx((i) => (i + d + BADGES.length) % BADGES.length);
  const back = profile?.role === "super_admin" ? "/dashboard/sa" : profile?.role === "admin" ? "/dashboard/c" : "/dashboard/m";
  
  const getFilledBars = () => {
    if (heroIdx < userRankVal) return view.bars; 
    if (heroIdx > userRankVal) return 0;         
    if (view.label === "Rook") return 1;         
    
    const currentPointsInBand = Math.max(0, pts - view.base);
    const bandRange = (view.next || (view.base + 1000)) - view.base; 
    const ptsPerBar = bandRange / view.bars; 
    
    return Math.min(view.bars, Math.floor(currentPointsInBand / ptsPerBar)); 
  };

  const visibleQuests = QUESTS.filter(q => {
    const typeMatch = q.type === 'core' || q.type === path;
    const levelMatch = onlyCurrent ? q.minRank === rating : true;
    return typeMatch && levelMatch;
  });

  const openSubmit = (quest: any) => {
    setSelectedQuest(quest);
    setRepoLink("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    alert("Submitted! An admin will review your work.");
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleClaim = async () => {
    setClaim({ ...claim, loading: true });
    try {
      // Assuming API handles +20 pts
      const res = await fetch("/api/user/points", { method: "POST" });
      const d = await res.json();
      setClaim({ loading: false, msg: res.ok ? d.message : d.error, isErr: !res.ok });
    } catch { setClaim({ loading: false, msg: "Network Error", isErr: true }); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardNavbar user={user} backHref={back} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 font-serif">
        
        {/* CAROUSEL */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl overflow-hidden border border-slate-700">
           <div className="flex justify-between px-4 pt-4">
            <button onClick={() => nav(-1)} className="hover:bg-white/10 rounded-full px-3 text-slate-400 hover:text-white">◀</button>
            <button onClick={() => nav(1)} className="hover:bg-white/10 rounded-full px-3 text-slate-400 hover:text-white">▶</button>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-xl text-4xl shadow-lg transition-all duration-500 ${isUnlocked ? `${view.grad} scale-110 ring-2 ring-white/20` : 'bg-white/10 opacity-40 grayscale'}`}>{view.icon}</div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Rank Tier</p>
                <h2 className={`text-3xl font-bold flex items-center gap-3 ${!isUnlocked && 'opacity-50'}`}>{view.label} {!isUnlocked && <FaLock className="text-lg opacity-40" />}</h2>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: view.bars }).map((_, i) => (
                    <div key={i} className={`h-2.5 w-6 rounded-sm -skew-x-12 border border-white/10 transition-all duration-700 ${i < getFilledBars() ? barGrad : 'bg-white/5'}`} />
                  ))}
                  
                  {isUnlocked && (
                    <span className="ml-2 text-xs text-slate-400 font-mono">
                      {heroIdx < userRankVal ? "COMPLETED" : view.label === "Rook" ? `${pts} pts (MAX)` : `${pts} / ${view.next} pts`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center sm:text-right space-y-3">
              {/* Daily Claim Button - RESTORED */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
                 <button 
                  onClick={handleClaim} 
                  disabled={claim.loading || claimedToday} 
                  className={`px-5 py-2 rounded-full border text-sm font-bold flex items-center gap-2 transition-all ${claimedToday ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}
                 >
                   {claim.loading ? "..." : claimedToday ? (
                     <> <FaCircleCheck /> Claimed (+20)</>
                   ) : (
                     <> <FaCalendarCheck /> Claim Daily (+20)</>
                   )}
                 </button>
                 
                 {rating !== "Rook" && (
                  <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border shadow-sm ${nextGrad}`}>
                    <FaCrown /> Next: {rating === "Pawn" ? "Bishop" : rating === "Bishop" ? "Knight" : "Rook"}
                  </div>
                )}
              </div>
              {claim.msg && <p className={`text-xs ${claim.isErr ? 'text-rose-300' : 'text-emerald-300'}`}>{claim.msg}</p>}
            </div>
          </div>
        </motion.div>

        {/* QUEST BOARD */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quest Board</h3>
              <p className="text-slate-500 text-sm">Select a track. Cloud is locked until Knight.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => setOnlyCurrent(!onlyCurrent)}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${onlyCurrent ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {onlyCurrent ? `Viewing: ${rating} Only` : "Viewing: All Levels"}
              </button>

              <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
                <button onClick={() => setPath('web')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${path === 'web' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Web Dev</button>
                <button onClick={() => setPath('ai')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${path === 'ai' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>AI & ML</button>
                <button onClick={() => setPath('ops')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${path === 'ops' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>DevOps</button>
                <button onClick={() => setPath('sys')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${path === 'sys' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>SysDesign</button>
                <button onClick={() => setPath('cloud')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${path === 'cloud' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cloud</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleQuests.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-400 italic">
                  {path === 'cloud' && (rating === 'Pawn' || rating === 'Bishop') 
                    ? "Cloud Computing unlocks at Knight Rank. Level up to access!"
                    : "No quests available for this filter."}
                </div>
              ) : (
                visibleQuests.map((q) => {
                  const qRankIdx = BADGES.findIndex(b => b.label === q.minRank);
                  const isLocked = qRankIdx > userRankIdx;
                  const isCompleted = qRankIdx < userRankIdx;
                  
                  let iconColor = 'bg-slate-100 text-slate-600';
                  if (path === 'web') iconColor = 'bg-blue-50 text-blue-600';
                  else if (path === 'ai') iconColor = 'bg-purple-50 text-purple-600';
                  else if (path === 'ops') iconColor = 'bg-orange-50 text-orange-600';
                  else if (path === 'sys') iconColor = 'bg-emerald-50 text-emerald-600';
                  else if (path === 'cloud') iconColor = 'bg-sky-50 text-sky-600';

                  return (
                    <motion.div key={q.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative p-5 rounded-xl border transition-all ${isLocked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className={`p-2 rounded-lg text-lg ${q.type === 'core' ? 'bg-slate-100 text-slate-600' : iconColor}`}>
                           {q.icon}
                         </div>
                         <div className={`text-sm font-bold ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>+{q.pts}</div>
                      </div>

                      <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                        {q.title}
                        {isLocked && <FaLock className="text-slate-400 text-xs" />}
                        {isCompleted && <FaCircleCheck className="text-emerald-500 text-xs" />}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${q.minRank === 'Pawn' ? 'bg-slate-100 text-slate-500' : q.minRank === 'Bishop' ? 'bg-violet-100 text-violet-700' : q.minRank === 'Knight' ? 'bg-pink-100 text-pink-700' : 'bg-amber-100 text-amber-700'}`}>
                           {q.minRank} Req.
                         </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">{q.desc}</p>
                      
                      {!isLocked && !isCompleted && (
                        <button 
                          onClick={() => openSubmit(q)}
                          className="w-full py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                          <FaPaperPlane /> Submit Work
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SUBMISSION MODAL */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10">
                <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><FaXmark /></button>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Quest</h3>
                <p className="text-sm text-slate-500 mb-6">You are submitting: <span className="font-semibold text-indigo-600">{selectedQuest?.title}</span></p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Git Repository Link</label>
                    <input 
                      required 
                      type="url" 
                      placeholder="https://github.com/username/repo"
                      value={repoLink}
                      onChange={(e) => setRepoLink(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-amber-800 mb-1">Checklist before submitting:</h4>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
                      <li>Repository must be <b>Public</b>.</li>
                      <li><b>README.md</b> must contain setup instructions.</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50">
                      {submitting ? "Verifying..." : "Submit for Review"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}