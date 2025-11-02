"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Briefcase, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role?: string;
  clubIds?: string[];
  name?: string;
  department?: string;
  joinedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export default function Page() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async (clubId: string) => {
    try {
      const response = await fetch(`/api/admin/members/get-my-members?clubId=${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data: User[] = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMembers(id);
    }
  }, [id]);

  const groupedMembers = members.reduce((acc, mem) => {
    const dept = mem.department || 'No Department';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(mem);
    return acc;
  }, {} as Record<string, User[]>);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <DashboardNavbar user={user} />
        <main className="p-8">
          <div className="text-center">Loading club dashboard...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <DashboardNavbar user={user} />
        <main className="p-8">
          <div className="text-center text-red-600">Error: {error}</div>
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
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-gray-800">
                Club Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Members of the club, classified by department
              </p>
            </div>
            <Link href={`/dashboard/c/${id}/settings`}>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300">
                <Settings className="h-5 w-5" />
                Settings
              </button>
            </Link>
          </div>

          {/* Members Grouped by Department */}
          <div className="space-y-8">
            {Object.entries(groupedMembers).map(([dept, deptMembers]) => (
              <div key={dept} className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
                  <Briefcase className="h-6 w-6" />
                  {dept.charAt(0).toUpperCase() + dept.slice(1)} ({deptMembers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {deptMembers.map(mem => (
                    <div key={mem.id} className="bg-linear-to-br from-gray-50 to-gray-100 p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{mem.name || 'No Name'}</p>
                          <p className="text-xs text-gray-600">{mem.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><span className="font-medium">Role:</span> {mem.role || 'Member'}</p>
                        <p><span className="font-medium">Joined:</span> {mem.joinedAt ? new Date(mem.joinedAt._seconds * 1000).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}