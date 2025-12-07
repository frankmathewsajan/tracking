"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your firebase config
import { useAuth } from "@/providers/AuthProvider"; // Import your EXISTING AuthProvider

// Define the shape of your Firestore User Data
export interface UserProfile {
  name: string;
  email: string;
  role: string; 
  clubIds: { clubId: string; department: string }[];
  photoURL?: string;
  createdAt: any;
  rating?: "Pawn" | "Knight" | "Rook";
  points?: number;
  lastDailyClaimAt?: any;
}

export function useUserProfile() {
  const { user: authUser } = useAuth(); // Get the UID from your existing AuthProvider
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. If not logged in yet, do nothing (or reset)
    if (!authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 2. Reference the document: users/{uid}
    const userDocRef = doc(db, "users", authUser.uid);

    // 3. Listen for real-time changes
    const unsub = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          // Success: We found their profile
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Edge Case: They logged in (Auth), but have no Firestore doc yet
          console.warn("User logged in, but no profile found in 'users' collection.");
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch user profile:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // 4. Cleanup listener when component unmounts or user logs out
    return () => unsub();
    
  }, [authUser]); // Re-run this effect if the Auth User changes

  return { profile, loading, error };
}