"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Users, UserCircle, Calendar, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  departments: string[];
  adminIds: string[];
  memberIds: string[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const ClubDashboardPage = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyClubs = async () => {
    try {
      const response = await fetch('/api/admin/clubs/get-my-clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      const data: Club[] = await response.json();
      setClubs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <DashboardNavbar user={user} />
        <main className="p-8">
          <div>Loading your clubs...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <DashboardNavbar user={user} />
        <main className="p-8">
          <div>Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <DashboardNavbar user={user} />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-800">
              My <span className="text-indigo-600">Clubs</span>
            </h1>
          </div>

          {clubs.length === 0 ? (
            <div className="text-center text-gray-500">You are not part of any clubs yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clubs.map((club) => (
                <Link key={club.id} href={`/dashboard/c/${club.id}`}>
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col border-t-4 border-indigo-500">
                    <div className="p-6 grow">
                      <h2 className="text-2xl font-bold text-gray-800 mb-5">{club.name}</h2>

                      {/* Departments */}
                      <div className="mb-5">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-indigo-500" />
                          Departments ({club.departments.length})
                        </h3>
                        <div className="space-y-1.5 text-sm text-gray-600">
                          {club.departments.map(dep => <p key={dep}>{dep}</p>)}
                        </div>
                      </div>

                      <div className="mb-5">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-indigo-500" />
                          Admins ({club.adminIds.length})
                        </h3>
                        <div className="space-y-1.5 text-sm text-gray-600">
                          {club.adminIds.map(admin => <p key={admin} className="truncate">{admin}</p>)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-b-xl mt-auto px-6 py-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Created: {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubDashboardPage;