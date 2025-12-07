"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "firebase/auth";
import { FaChessPawn, FaChessKnight, FaChessRook } from "react-icons/fa6";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardNavbarProps {
  user: User | null;
  backHref?: string;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user, backHref }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { profile, loading } = useUserProfile();
  
  const rating = profile?.rating || "Pawn";
  const points = profile?.points ?? 0;
  const ratingIcon = rating === "Rook" ? <FaChessRook className="text-amber-500" /> : rating === "Knight" ? <FaChessKnight className="text-[#b023a7]" /> : <FaChessPawn className="text-slate-500" />;
  const ratingText = rating === "Rook" ? "text-amber-700" : rating === "Knight" ? "text-[#b023a7]" : "text-slate-600";
  const isKnight = rating === "Knight";
  const isPawn = rating === "Pawn";
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 left-0 flex w-full items-center justify-between p-4 md:p-8 bg-white border-b border-gray-200">
      {backHref ? (
        <Link href={backHref} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm">
          <span aria-hidden>←</span>
          Back to dashboard
        </Link>
      ) : (
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-tighter">
            Club<span className="text-indigo-600">Sync</span>
          </h1>
        </Link>
      )}
      <div className="relative" >
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={
            isKnight
              ? "flex items-center gap-2 rounded-full bg-linear-to-r from-[#eec0a8] via-pink-100 to-[#dc84d5] px-3 py-2 text-sm font-semibold text-[#7d1f73] shadow-sm transition"
              : isPawn
              ? "flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition"
              : "flex items-center gap-2 rounded-full bg-linear-to-r from-amber-200 via-yellow-100 to-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm transition"
          }
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Image
            src={user?.photoURL || 'https://avatar.iran.liara.run/public'}
            alt="Profile"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
          />
          <span className="flex items-center gap-1">
            {user?.displayName}
            <span className={`flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold shadow-inner ${ratingText}`}>
              {ratingIcon}
              {rating}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 shadow-inner">
              {points} pts
            </span>
          </span>
        </motion.button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onMouseLeave={() => setIsDropdownOpen(false)}
              className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px]"
            >
              <Link
                href="/points"
                className="flex items-center gap-2 w-full text-left py-2 px-4 hover:bg-gray-100 rounded text-slate-700"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaChessKnight size={16} style={{ color: '#b023a7' }} />
                Points
              </Link>
              <button
                className="flex items-center gap-2 w-full text-left py-2 px-4 hover:bg-gray-100 rounded text-red-600"
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default DashboardNavbar;