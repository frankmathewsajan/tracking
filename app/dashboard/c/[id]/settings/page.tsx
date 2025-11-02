"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Users, UserCircle, Calendar, Briefcase, Save, Plus, X } from 'lucide-react';

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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newMember, setNewMember] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchClub = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/clubs/get-my-club?clubId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch club');
      const data: Club = await response.json();
      setClub(data);
      setDepartments(data.departments);
      setMembers(data.memberIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.then(({ id }) => fetchClub(id));
  }, [params]);

  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeDepartment = (dep: string) => {
    setDepartments(departments.filter(d => d !== dep));
  };

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (mem: string) => {
    setMembers(members.filter(m => m !== mem));
  };

  const handleUpdate = async () => {
    if (!club) return;
    setIsUpdating(true);
    try {
      const payload = {
        id: club.id,
        departments,
        memberIds: members,
      };
      
      console.log('Updating club:', payload);
      alert('Update functionality not implemented yet. Add the API route for updating clubs.');
    
    } catch (err) {
      console.error('Error updating club:', err);
      alert('Failed to update club.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <DashboardNavbar user={user} />
        <main className="p-8">
          <div>Loading club details...</div>
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

  if (!club) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <DashboardNavbar user={user} />
        <main className="p-8">
          <div>Club not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <DashboardNavbar user={user} />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-800">
              {club.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Created: {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Departments Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-indigo-500" />
                Departments
              </h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add new department"
                  />
                  <button
                    onClick={addDepartment}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {departments.map(dep => (
                  <div key={dep} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                    <span className="text-sm text-gray-700">{dep}</span>
                    <button
                      onClick={() => removeDepartment(dep)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Members Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-indigo-500" />
                Members
              </h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add new member email"
                  />
                  <button
                    onClick={addMember}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map(mem => (
                  <div key={mem} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                    <span className="text-sm text-gray-700 truncate">{mem}</span>
                    <button
                      onClick={() => removeMember(mem)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admins Section (Read-only) */}
          <div className="bg-white p-6 rounded-2xl shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-indigo-500" />
              Admins
            </h2>
            <div className="space-y-2">
              {club.adminIds.map(admin => (
                <div key={admin} className="bg-gray-100 px-3 py-2 rounded-md">
                  <span className="text-sm text-gray-700 truncate">{admin}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isUpdating ? 'Updating...' : 'Update Club'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}