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

type FirestoreTimestamp =
  | { seconds: number; nanoseconds?: number }
  | { _seconds: number; _nanoseconds?: number };

interface Applicant {
  id: string;
  appliedAt: FirestoreTimestamp | string | number | null;
  department: string;
  email: string;
  role: string;
  userId: string;
  clubId: string;
  name?: string;
}

export default function Page() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [selectedDepartment, setSelectedDepartment] = useState('');

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

  const fetchApplicants = async (clubId: string) => {
    try {
      const response = await fetch(`/api/admin/members/get-applicants?clubId=${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch applicants');
      const data: Applicant[] = await response.json();
      setApplicants(data);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMembers(id);
      fetchApplicants(id);
    }
  }, [id]);

  const handleAccept = async () => {
    if (!selectedApplicant) return;
    try {
      const res = await fetch('/api/admin/members/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          role: selectedRole,
          department: selectedDepartment
        })
      });
      if (res.ok) {
        alert('Applicant accepted');
        setModalOpen(false);
        fetchApplicants(id);
        fetchMembers(id);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to accept');
      }
    } catch (error) {
      console.error('Error accepting:', error);
      alert('Error accepting');
    }
  };

  const handleReject = async (applicantId: string) => {
    if (!confirm('Are you sure you want to reject this applicant?')) return;
    try {
      const res = await fetch('/api/admin/members/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId })
      });
      if (res.ok) {
        alert('Applicant rejected');
        fetchApplicants(id);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Error rejecting');
    }
  };

  const openAcceptModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setSelectedRole('member');
    setSelectedDepartment(applicant.department);
    setModalOpen(true);
  };

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

          {/* Applicants Section */}
          {applicants.length > 0 && (
            <div className="bg-white p-6 rounded-2xl mt-3 shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-orange-600">
                Applicants ({applicants.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applicants.map(app => (
                  <div key={app.id} className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{app.name || 'No Name'}</p>
                        <p className="text-xs text-gray-600">{app.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 mb-4">
                      <p><span className="font-medium">Department:</span> {app.department.charAt(0).toUpperCase() + app.department.slice(1)}</p>
                      <p>
                        <span className="font-medium">Applied:</span>{" "}
                        {(() => {
                          const a = app.appliedAt;
                          if (!a) return 'Unknown';
                          if (typeof a === 'object') {
                            if ('seconds' in a && typeof (a as { seconds: number }).seconds === 'number') {
                              return new Date((a as { seconds: number }).seconds * 1000).toLocaleDateString();
                            }
                            if ('_seconds' in a && typeof (a as { _seconds: number })._seconds === 'number') {
                              return new Date((a as { _seconds: number })._seconds * 1000).toLocaleDateString();
                            }
                          }
                          if (typeof a === 'number') {
                            return new Date(a * 1000).toLocaleDateString();
                          }
                          if (typeof a === 'string') {
                            const d = new Date(a);
                            return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString();
                          }
                          return 'Unknown';
                        })()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAcceptModal(app)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal for Accept */}
          {modalOpen && selectedApplicant && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-4">Accept Applicant</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={selectedDepartment.charAt(0).toLocaleUpperCase() + selectedDepartment.slice(1)}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}