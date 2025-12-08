"use client";
import { useAuth } from "@/providers/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FaChessPawn, FaChessKnight, FaChessRook, FaCrown } from "react-icons/fa6";
import { motion } from "framer-motion";
import DashboardNavbar from "@/components/common/dashboard-navbar";

const BADGES = [
  { label: "Pawn", band: "0-1199", icon: <FaChessPawn className="text-slate-600" />, color: "bg-slate-50", ring: "ring-slate-900/20", txt: "text-slate-900", note: "Opening piece, 1 point", sub: "Basic moves, foundation" },
  { label: "Knight", band: "1200-1999", icon: <FaChessKnight className="text-purple-600" />, color: "bg-purple-50", ring: "ring-purple-500/20", txt: "text-purple-900", note: "Tactical piece, 3 points", sub: "Strategic thinking" },
  { label: "Rook", band: "2000+", icon: <FaChessRook className="text-amber-600" />, color: "bg-amber-50", ring: "ring-amber-500/20", txt: "text-amber-900", note: "Anchor piece, 5 points", sub: "Masterful control" }
];

const EARN = [
  { pts: "10", t: "Daily Login", d: "Daily consistency bonus" },
  { pts: "20", t: "Personal Tasks", d: "Capped at 200 pts (approved)" },
  { pts: "100", t: "Club Tasks", d: "Per approved task (100%)" },
  { pts: "!!", t: "Random Events", d: "Surprise bonuses" }
];

export default function RatingPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  const rating = profile?.rating || "Pawn";
  const role = profile?.role;
  const current = BADGES.find(b => b.label === rating) || BADGES[0];
  const isMax = rating === "Rook";
  
  // Logic helpers
  const backPath = role === "super_admin" ? "/dashboard/sa" : role === "admin" ? "/dashboard/c" : "/dashboard/m";
  const nextGradient = rating === "Pawn" ? "bg-linear-to-r from-[#eec0a8] via-pink-100 to-[#dc84d5] text-[#7d1f73]" : "bg-linear-to-r from-amber-200 via-yellow-100 to-amber-300 text-amber-900";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <DashboardNavbar user={user} backHref={backPath} />
      
      {/* Font-serif applied HERE only, so Navbar stays clean */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12 font-serif">
        
        {/* HERO */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-12 p-4 bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-3xl">{current.icon}</div>
            <div>
              <p className="text-slate-300 text-xs font-medium tracking-wider uppercase">Current Rank</p>
              <h2 className="text-2xl font-bold">{current.label}</h2>
              <p className="text-slate-400 text-xs">{current.band} points</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            {!isMax && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm mb-1 ${nextGradient}`}>
                <FaCrown /> Progress to {rating === "Pawn" ? "Knight" : "Rook"}
              </div>
            )}
            <p className="text-slate-400 text-xs">{!isMax ? "Complete tasks to rank up" : "Max rank achieved"}</p>
          </div>
        </motion.div>

        {/* TIERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {BADGES.map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`${b.color} rounded-2xl border ${b.label === rating ? `border-slate-900 shadow-lg ring-2 ${b.ring}` : 'border-slate-200'} p-5 hover:shadow-md transition-all`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl">{b.icon}</span>
                {b.label === rating && <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-full">Current</span>}
              </div>
              <h4 className={`text-xl font-bold ${b.txt}`}>{b.label}</h4>
              <p className="text-lg font-bold text-slate-800 mb-2">{b.band}</p>
              <p className="text-slate-600 text-sm">{b.note}</p>
              <p className="text-slate-500 text-xs italic mt-1">{b.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* EARNINGS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">How to Earn Points</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {EARN.map((m) => (
              <div key={m.t} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-sm">
                <div className="text-blue-600 font-bold text-lg">+{m.pts}</div>
                <h4 className="font-semibold text-slate-800 text-sm leading-tight">{m.t}</h4>
                <p className="text-slate-500 text-xs">{m.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}