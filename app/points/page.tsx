"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FaChessPawn, FaChessBishop, FaChessKnight, FaChessRook, FaCrown, FaLock, FaCode, FaRobot, FaGithub, FaCircleCheck, FaServer, FaBrain, FaGitAlt, FaTerminal, FaDocker, FaAws, FaPaperPlane, FaXmark, FaNetworkWired, FaCloud, FaDatabase, FaGlobe, FaCalendarCheck, FaClock, FaCircleExclamation } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import DashboardNavbar from "@/components/common/dashboard-navbar";

// --- STATIC CONFIGURATION ---
const BADGES = [
  { label: "Pawn", band: "0-799", icon: <FaChessPawn />, grad: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900", bars: 4, base: 0, next: 800 },
  { label: "Bishop", band: "800-1199", icon: <FaChessBishop />, grad: "bg-gradient-to-br from-violet-200 to-violet-400 text-violet-900", bars: 4, base: 800, next: 1200 },
  { label: "Knight", band: "1200-1999", icon: <FaChessKnight />, grad: "bg-gradient-to-br from-pink-200 to-pink-400 text-pink-900", bars: 6, base: 1200, next: 2000 },
  { label: "Rook", band: "2000+", icon: <FaChessRook />, grad: "bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900", bars: 1, base: 2000, next: null }
];

const QUESTS = [
  // --- CORE SKILLS (Pawn & Bishop) ---
  { id: 'git-1', title: "Git Fundamentals", type: 'core', minRank: 'Pawn', pts: 150, desc: "Init, Stage, Commit, Push. Demonstrate version control basics.", icon: <FaGitAlt /> },
  { id: 'git-2', title: "Branching Strategy", type: 'core', minRank: 'Bishop', pts: 350, desc: "Feature branch workflow & Pull Request review.", icon: <FaGithub /> },

  // --- WEB DEV PATH ---
  // Pawn: Pure Basics (Total 450 available here)
  { id: 'web-1', title: "Semantic Portfolio", type: 'web', minRank: 'Pawn', pts: 200, desc: "Responsive site using only HTML5 & CSS Grid/Flexbox.", icon: <FaCode /> },
  { id: 'web-2', title: "JS Dom Manipulation", type: 'web', minRank: 'Pawn', pts: 250, desc: "Interactive ToDo list using Vanilla JS (No frameworks).", icon: <FaCode /> },
  
  // Bishop: Frameworks Start
  { id: 'web-3', title: "React Components", type: 'web', minRank: 'Bishop', pts: 400, desc: "Single Page App (SPA) with React Hooks.", icon: <FaCode /> },
  
  // Knight: Production Eng
  { id: 'web-4', title: "Next.js Architecture", type: 'web', minRank: 'Knight', pts: 700, desc: "App Router, Server Actions, and Auth integration.", icon: <FaServer /> },
  { id: 'web-5', title: "Micro-Frontends", type: 'web', minRank: 'Rook', pts: 1000, desc: "Module Federation or Mono-repo setup (Turborepo).", icon: <FaNetworkWired /> },

  // --- AI / ML PATH (Starts at Bishop) ---
  // Bishop: Foundations
  { id: 'ai-1', title: "Data Analysis", type: 'ai', minRank: 'Bishop', pts: 200, desc: "Clean & Visualize data using Pandas/Matplotlib.", icon: <FaRobot /> },
  { id: 'ai-2', title: "Basic Classification", type: 'ai', minRank: 'Bishop', pts: 250, desc: "Scikit-Learn model (Logistic Reg/Decision Tree).", icon: <FaBrain /> },
  { id: 'ai-3', title: "Computer Vision (CNN)", type: 'ai', minRank: 'Bishop', pts: 400, desc: "Classify images using PyTorch or TensorFlow.", icon: <FaRobot /> },
  
  // Knight: Advanced
  { id: 'ai-4', title: "Transformer Tuning", type: 'ai', minRank: 'Knight', pts: 700, desc: "Fine-tune BERT/GPT for specific NLP tasks.", icon: <FaBrain /> },
  { id: 'ai-5', title: "LLM Implementation", type: 'ai', minRank: 'Rook', pts: 1000, desc: "Implement RAG system.", icon: <FaBrain /> },

  // --- OPS & SYSTEM PATH ---
  // Pawn: Command Line Mastery (Total 200 pts)
  { id: 'ops-1', title: "Terminal Survival", type: 'ops', minRank: 'Pawn', pts: 200, desc: "Navigation (cd, ls), File Mgmt (cp, mv, rm, rmdir), Network (ping, curl).", icon: <FaTerminal /> },
  
  // Bishop: Containers & DB
  { id: 'ops-2', title: "Docker Basics", type: 'ops', minRank: 'Bishop', pts: 350, desc: "Containerize a simple Web/Python application.", icon: <FaDocker /> },
  { id: 'sys-1', title: "Database Design", type: 'sys', minRank: 'Bishop', pts: 350, desc: "Design a Normalized Schema (SQL).", icon: <FaDatabase /> },

  // Knight: DevOps & Scale
  { id: 'ops-3', title: "CI/CD Pipeline", type: 'ops', minRank: 'Knight', pts: 600, desc: "GitHub Actions workflow to test & lint on push.", icon: <FaServer /> },
  { id: 'sys-2', title: "Scalability Basics", type: 'sys', minRank: 'Knight', pts: 600, desc: "Implement Load Balancing & Caching (Redis).", icon: <FaNetworkWired /> },
  { id: 'sys-3', title: "Design Twitter", type: 'sys', minRank: 'Knight', pts: 800, desc: "High-level design: Fan-out service & timeline gen.", icon: <FaNetworkWired /> },
  
  // Rook: Infrastructure
  { id: 'ops-4', title: "IaC with Terraform", type: 'ops', minRank: 'Rook', pts: 900, desc: "Provision full infrastructure as code.", icon: <FaCloud /> },
  { id: 'ops-5', title: "Kubernetes Cluster", type: 'ops', minRank: 'Rook', pts: 1200, desc: "Deploy, scale, and manage pods on K8s.", icon: <FaServer /> },
  { id: 'sys-4', title: "Distributed Systems", type: 'sys', minRank: 'Rook', pts: 1500, desc: "CAP Theorem logic / Event-Driven Arch.", icon: <FaServer /> },

  // --- CLOUD PATH (Knight+) ---
  { id: 'cloud-1', title: "AWS Core Services", type: 'cloud', minRank: 'Knight', pts: 600, desc: "Deploy a 3-tier app using EC2, RDS, and S3.", icon: <FaAws /> },
  { id: 'cloud-2', title: "Serverless Arch", type: 'cloud', minRank: 'Knight', pts: 700, desc: "Build an API using Lambda, API Gateway.", icon: <FaCloud /> },
  { id: 'cloud-3', title: "VPC Architect", type: 'cloud', minRank: 'Rook', pts: 1000, desc: "Design Public/Private Subnets, NAT.", icon: <FaNetworkWired /> },
  { id: 'cloud-4', title: "Global Scale", type: 'cloud', minRank: 'Rook', pts: 1200, desc: "Config CloudFront CDN and Route53.", icon: <FaGlobe /> },
];

export default function RatingPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [heroIdx, setIdx] = useState(0);
  const [path, setPath] = useState<'web'|'ai'|'ops'|'sys'|'cloud'>('web'); 
  const [onlyCurrent, setOnlyCurrent] = useState(false);
  const [modal, setModal] = useState({ open: false, quest: null as any });
  const [repoLink, setRepoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState({ loading: false, msg: "", isErr: false });
  const [submissions, setSubmissions] = useState<Record<string, string>>({}); 

  const rating = profile?.rating || "Pawn";
  const pts = profile?.points || 0;
  const userRankIdx = BADGES.findIndex(b => b.label === rating);
  const view = BADGES[heroIdx] || BADGES[0];
  const isUnlocked = heroIdx <= (userRankIdx === -1 ? 0 : userRankIdx);
  const claimedToday = profile?.lastDailyClaimAt?.toDate().toDateString() === new Date().toDateString();

  const gradients = {
    Pawn: { next: "bg-gradient-to-r from-violet-200 via-purple-100 to-violet-300 text-violet-900", bar: "bg-gradient-to-r from-violet-400 to-violet-600" },
    Bishop: { next: "bg-gradient-to-r from-pink-200 via-rose-100 to-pink-300 text-pink-900", bar: "bg-gradient-to-r from-pink-400 to-pink-600" },
    Knight: { next: "bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-amber-900", bar: "bg-gradient-to-r from-amber-400 to-amber-600" },
    Rook: { next: "hidden", bar: "bg-gradient-to-r from-amber-400 to-amber-600" } 
  };
  const theme = gradients[rating as keyof typeof gradients] || gradients.Pawn;
  const barTheme = gradients[view.label as keyof typeof gradients]?.bar || gradients.Pawn.bar;

  useEffect(() => { setIdx(userRankIdx === -1 ? 0 : userRankIdx) }, [rating]);

  useEffect(() => {
    if (!user) return;
    const fetchSubs = async () => {
      try {
        const res = await fetch("/api/user/points/submissions");
        if (res.ok) setSubmissions((await res.json()).submissions);
      } catch (e) { console.error(e); }
    };
    fetchSubs();
  }, [user]);

  const handleClaim = async () => {
    setClaim({ ...claim, loading: true });
    try {
      const res = await fetch("/api/user/points/daily-claim", { method: "POST" });
      const d = await res.json();
      setClaim({ loading: false, msg: res.ok ? d.message : d.error, isErr: !res.ok });
    } catch { setClaim({ loading: false, msg: "Network Error", isErr: true }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/points/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId: modal.quest?.id, questTitle: modal.quest?.title, points: modal.quest?.pts, track: modal.quest?.type, repoLink })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSubmissions(prev => ({ ...prev, [modal.quest.id]: 'pending' })); 
      setModal({ open: false, quest: null }); setRepoLink("");
      alert("Submitted successfully!");
    } catch (e: any) { alert(e.message); } finally { setSubmitting(false); }
  };

  const nav = (d: number) => setIdx((i) => (i + d + BADGES.length) % BADGES.length);
  const getFilledBars = () => {
    if (heroIdx < userRankIdx) return view.bars;
    if (heroIdx > userRankIdx) return 0;
    if (view.label === "Rook") return 1;
    return Math.min(view.bars, Math.floor(Math.max(0, pts - view.base) / ((view.next || 3000) - view.base) * view.bars));
  };

  const visibleQuests = QUESTS.filter(q => (q.type === 'core' || q.type === path) && (!onlyCurrent || q.minRank === rating));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardNavbar user={user} backHref={profile?.role === "super_admin" ? "/dashboard/sa" : profile?.role === "admin" ? "/dashboard/c" : "/dashboard/m"} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 font-serif">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl overflow-hidden border border-slate-700">
          <div className="flex justify-between px-4 pt-4">
            <button onClick={() => nav(-1)} className="hover:bg-white/10 rounded-full px-3 text-slate-400 hover:text-white">◀</button>
            <button onClick={() => nav(1)} className="hover:bg-white/10 rounded-full px-3 text-slate-400 hover:text-white">▶</button>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-xl text-4xl shadow-lg transition-all ${isUnlocked ? `${view.grad} scale-110 ring-2 ring-white/20` : 'bg-white/10 opacity-40 grayscale'}`}>{view.icon}</div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Rank Tier</p>
                <h2 className={`text-3xl font-bold flex items-center gap-3 ${!isUnlocked && 'opacity-50'}`}>{view.label} {!isUnlocked && <FaLock className="text-lg opacity-40" />}</h2>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: view.bars }).map((_, i) => <div key={i} className={`h-2.5 w-6 rounded-sm -skew-x-12 border border-white/10 transition-all duration-700 ${i < getFilledBars() ? barTheme : 'bg-white/5'}`} />)}
                  {isUnlocked && <span className="ml-2 text-xs text-slate-400 font-mono">{heroIdx < userRankIdx ? "COMPLETED" : view.label === "Rook" ? `${pts} pts` : `${pts} / ${view.next}`}</span>}
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
                 <button onClick={handleClaim} disabled={claim.loading || claimedToday} className={`px-5 py-2 rounded-full border text-sm font-bold flex items-center gap-2 transition-all ${claimedToday ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}>
                   {claim.loading ? "..." : claimedToday ? <><FaCircleCheck /> Claimed (+20)</> : <><FaCalendarCheck /> Claim Daily</>}
                 </button>
                 {rating !== "Rook" && <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border shadow-sm ${theme.next}`}><FaCrown /> Next Rank</div>}
              </div>
              {claim.msg && <p className={`text-xs ${claim.isErr ? 'text-rose-300' : 'text-emerald-300'}`}>{claim.msg}</p>}
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div><h3 className="text-xl font-bold text-slate-900">Quest Board</h3><p className="text-slate-500 text-sm">Select a track. Cloud & AI unlock at higher ranks.</p></div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button onClick={() => setOnlyCurrent(!onlyCurrent)} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${onlyCurrent ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>{onlyCurrent ? `Viewing: ${rating} Only` : "Viewing: All Levels"}</button>
              <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
                {['web', 'ai', 'ops', 'sys', 'cloud'].map((t) => <button key={t} onClick={() => setPath(t as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${path === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleQuests.length === 0 ? <div className="col-span-2 text-center py-10 text-slate-400 italic">{(path === 'cloud' && (rating === 'Pawn' || rating === 'Bishop')) || (path === 'ai' && rating === 'Pawn') ? `${path.toUpperCase()} unlocks at higher ranks.` : "No quests available."}</div> : visibleQuests.map((q) => {
                  const qRankIdx = BADGES.findIndex(b => b.label === q.minRank);
                  const isLocked = qRankIdx > userRankIdx;
                  const status = submissions[q.id]; 
                  const isApproved = status === 'approved';
                  const isPending = status === 'pending';
                  const isRejected = status === 'rejected';
                  
                  let iconColor = 'bg-slate-100 text-slate-600';
                  if (isApproved) iconColor = 'bg-emerald-100 text-emerald-600';
                  else if (path === 'web') iconColor = 'bg-blue-50 text-blue-600';
                  else if (path === 'ai') iconColor = 'bg-purple-50 text-purple-600';
                  else if (path === 'ops') iconColor = 'bg-orange-50 text-orange-600';
                  else if (path === 'sys') iconColor = 'bg-emerald-50 text-emerald-600';
                  else if (path === 'cloud') iconColor = 'bg-sky-50 text-sky-600';

                  return (
                    <motion.div key={q.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative p-5 rounded-xl border transition-all ${isLocked ? 'bg-slate-50 border-slate-100 opacity-60' : isApproved ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'}`}>
                      <div className="flex justify-between items-start mb-2">
                         <div className={`p-2 rounded-lg text-lg ${iconColor}`}>{q.icon}</div>
                         <div className={`text-sm font-bold ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>+{q.pts}</div>
                      </div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                        {q.title} {isLocked && <FaLock className="text-slate-400 text-xs" />} {isApproved && <FaCircleCheck className="text-emerald-500 text-sm" />}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${q.minRank === 'Pawn' ? 'bg-slate-100 text-slate-500' : q.minRank === 'Bishop' ? 'bg-violet-100 text-violet-700' : q.minRank === 'Knight' ? 'bg-pink-100 text-pink-700' : 'bg-amber-100 text-amber-700'}`}>{q.minRank}</span>
                         {isPending && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><FaClock size={10} /> Reviewing</span>}
                         {isRejected && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700"><FaCircleExclamation size={10} /> Changes Req.</span>}
                         {isApproved && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Completed</span>}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">{q.desc}</p>
                      {!isLocked && !isApproved && !isPending && <button onClick={() => setModal({ open: true, quest: q })} className="w-full py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"><FaPaperPlane /> {isRejected ? "Resubmit Work" : "Submit Work"}</button>}
                      {isPending && <button disabled className="w-full py-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"><FaClock /> Waiting...</button>}
                    </motion.div>
                  );
              })}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {modal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal({ open: false, quest: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10">
                <button onClick={() => setModal({ open: false, quest: null })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><FaXmark /></button>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Quest</h3>
                <p className="text-sm text-slate-500 mb-6">Submitting: <span className="font-semibold text-indigo-600">{modal.quest?.title}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Git Link</label><input required type="url" placeholder="https://github.com/..." value={repoLink} onChange={(e) => setRepoLink(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3"><h4 className="text-xs font-bold text-amber-800 mb-1">Checklist:</h4><ul className="text-xs text-amber-700 space-y-1 list-disc pl-4"><li>Repo is <b>Public</b>.</li><li><b>README</b> has instructions.</li></ul></div>
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal({ open: false, quest: null })} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button><button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50">{submitting ? "..." : "Submit"}</button></div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}