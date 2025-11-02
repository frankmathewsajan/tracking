"use client";

import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion"; // Removed framer-motion
import { useAuth } from "../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Users, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  departments: string[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchMyClubs = async () => {
    try {
      const res = await fetch("/api/user/clubs/get-all-clubs");
      if (!res.ok) throw new Error("Failed to fetch clubs");
      const data: Club[] = await res.json();
      setClubs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClubs();
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <DashboardNavbar user={user} />
        <main className="flex flex-1 items-center justify-center">
          {/* Replaced motion spinner with Tailwind animate-spin */}
          <div
            className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
          />
        </main>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <DashboardNavbar user={user} />
        <main className="flex flex-1 items-center justify-center text-red-600 font-semibold">
          {error}
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <DashboardNavbar user={user} />

      <main className="flex-1 w-full px-6 py-10 md:px-12 lg:px-20">
    
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
          >
            {clubs.map((club) => {

              return (
                <div key={club.id}>
                  <Link href={`/dashboard/m/${club.id}`}>
                    <div
                      className="flex flex-col rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div
                        className="bg-indigo-600 text-white p-6"
                      >
                        <h2 className="text-2xl font-bold mb-1">{club.name}</h2>
                        <p className="text-sm opacity-90">click to open</p>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                            Departments ({club.departments.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {club.departments.map((dep) => (
                              <span
                                key={dep}
                                className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {dep.charAt(0).toUpperCase() + dep.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                          <Calendar className="h-4 w-4" />
                          Created{" "}
                          {new Date(
                            club.createdAt._seconds * 1000
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 mt-20 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ClubSync
      </footer>
    </div>
  );
}