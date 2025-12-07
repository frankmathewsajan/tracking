"use client";
import { useAuth } from "@/providers/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FaChessPawn, FaChessKnight, FaChessRook, FaCrown } from "react-icons/fa6";
import { motion } from "framer-motion";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { useState } from "react";

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
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  
  const rating = profile?.rating || "Pawn";
  const role = profile?.role;
  const current = BADGES.find(b => b.label === rating) || BADGES[0];
  const isMax = rating === "Rook";
  const points = profile?.points ?? 0;

  // Helpers to check UTC day equality robustly for Timestamp/Date/string
  const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (typeof v.toDate === "function") return v.toDate();
    if (typeof v === "string") return new Date(v);
    if (v instanceof Date) return v;
    return null;
  };

  const isSameUtcDay = (a: Date | null, b: Date) => {
    if (!a) return false;
    return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
  };

  const claimedToday = (() => {
    const last = toDate(profile?.lastDailyClaimAt);
    return isSameUtcDay(last, new Date());
  })();
  
  // Logic helpers
  const backPath = role === "super_admin" ? "/dashboard/sa" : role === "admin" ? "/dashboard/c" : "/dashboard/m";
  const nextGradient = rating === "Pawn" ? "bg-gradient-to-r from-[#eec0a8] via-pink-100 to-[#dc84d5] text-[#7d1f73]" : "bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-amber-900";

  const handleClaim = async () => {
    setClaiming(true);
    setClaimMessage(null);
    setClaimError(null);
    try {
      const res = await fetch("/api/user/points", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setClaimError(data?.error || data?.message || "Unable to claim now");
      } else {
        setClaimMessage(data?.message || "Daily points claimed");
      }
    } catch (error) {
      setClaimError("Network error. Try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <DashboardNavbar user={user} backHref={backPath} />
      
      {/* Font-serif applied HERE only, so Navbar stays clean */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12 font-serif">
        
        {/* HERO */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-3xl">{current.icon}</div>
            <div>
              <p className="text-slate-300 text-sm font-medium tracking-wider uppercase">Current Rank</p>
              <h2 className="text-2xl font-bold">{current.label}</h2>
              <p className="text-slate-300 text-sm">{current.band} • {points} pts total</p>
            </div>
          </div>
          <div className="text-center sm:text-right space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
              <button
                onClick={handleClaim}
                disabled={claiming || claimedToday}
                className="inline-flex items-center justify-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {claiming ? "Claiming..." : claimedToday ? "Claimed" : "Claim daily +10"}
              </button>
              {!isMax && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${nextGradient}`}>
                  <FaCrown /> Progress to {rating === "Pawn" ? "Knight" : "Rook"}
                </div>
              )}
            </div>
            <p className="text-slate-200 text-xs">{!isMax ? "Complete tasks to rank up" : "Max rank achieved"}</p>
            {claimMessage && <p className="text-emerald-200 text-xs">{claimMessage}</p>}
            {claimError && <p className="text-rose-200 text-xs">{claimError}</p>}
          </div>
        </motion.div>

        {/* TIERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3">How to Earn Points</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {EARN.map((m) => (
              <div key={m.t} className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm">
                <div className="text-blue-600 font-bold text-base">+{m.pts}</div>
                <h4 className="font-semibold text-slate-800 text-sm leading-tight">{m.t}</h4>
                <p className="text-slate-500 text-[11px]">{m.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}