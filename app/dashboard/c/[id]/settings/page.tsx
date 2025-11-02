"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { UserCircle, Briefcase, Plus, X, Edit } from 'lucide-react';

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
  const [admins, setAdmins] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchClub = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/clubs/get-my-club?clubId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch club');
      const data: Club = await response.json();
      setClub(data);
      setDepartments(data.departments);
      setAdmins(data.adminIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    params.then(({ id }) => fetchClub(id));
  }, [params]);

  const addDepartment = async () => {
    if (!newDepartment.trim() || departments.includes(newDepartment.trim())) return;
    try {
      const res = await fetch('/api/admin/departments/create-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, department: newDepartment.trim() })
      });
      if (res.ok) {
        setDepartments([...departments, newDepartment.trim()]);
        setNewDepartment('');
      } else {
        alert('Failed to add department');
      }
    } catch (error) {
      alert('Error adding department');
    }
  };

  const removeDepartment = async (dep: string) => {
    if (!confirm(`Are you sure you want to delete the department "${dep}"? This will set all members' departments to "no-department".`)) return;
    try {
      const res = await fetch('/api/admin/departments/delete-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, department: dep })
      });
      if (res.ok) {
        setDepartments(departments.filter(d => d !== dep));
      } else {
        alert('Failed to delete department');
      }
    } catch (e) {
      alert('Error deleting department');
    }
  };

  const startEdit = (dep: string) => {
    setEditingDept(dep);
    setEditName(dep);
  };

  const cancelEdit = () => {
    setEditingDept(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim() || editName.trim() === editingDept) {
      cancelEdit();
      return;
    }
    try {
      const res = await fetch('/api/admin/departments/update-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, oldDepartment: editingDept, newDepartment: editName.trim() })
      });
      if (res.ok) {
        setDepartments(departments.map(d => d === editingDept ? editName.trim() : d));
        cancelEdit();
      } else {
        alert('Failed to update department');
      }
    } catch (e) {
      console.error('Error updating department', e);
    }
  };

  const addAdmin = async () => {
    if (!newAdmin.trim() || admins.includes(newAdmin.trim())) return;
    try {
      const res = await fetch('/api/admin/admins/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, email: newAdmin.trim() })
      });
      if (res.ok) {
        setAdmins([...admins, newAdmin.trim()]);
        setNewAdmin('');
      } else {
        alert('Failed to add admin');
      }
    } catch (error) {
      alert('Error adding admin');
    }
  };

  const removeAdmin = async (admin: string) => {
    if (!confirm(`Are you sure you want to remove ${admin} as admin?`)) return;
    try {
      const res = await fetch('/api/admin/admins/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, email: admin })
      });
      if (res.ok) {
        setAdmins(admins.filter(a => a !== admin));
      } else {
        alert('Failed to remove admin');
      }
    } catch (error) {
      alert('Error removing admin');
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
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-800">
              {club.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Created: {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Departments Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2">
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
                    {editingDept === dep ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <button onClick={saveEdit} className="ml-2 text-green-600">Save</button>
                        <button onClick={cancelEdit} className="ml-2 text-gray-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-700">{dep}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(dep)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeDepartment(dep)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admins Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-indigo-500" />
                Admins
              </h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newAdmin}
                    onChange={(e) => setNewAdmin(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add new admin email"
                  />
                  <button
                    onClick={addAdmin}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                    <span className="text-sm text-gray-700 truncate">{admin}</span>
                    <button
                      onClick={() => removeAdmin(admin)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}