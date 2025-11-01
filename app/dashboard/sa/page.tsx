"use client";

import DashboardNavbar from '@/components/common/dashboard-navbar'
import { useAuth } from '@/providers/AuthProvider';
import React, { useState, useEffect } from 'react'
import { Plus, Users, UserCircle, Calendar, Briefcase, X, Edit, Trash } from 'lucide-react';

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

const Page = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);
  const [deletingClubName, setDeletingClubName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    departments: '',
    adminIds: '',
    memberIds: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs/get-clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      const data: Club[] = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        departments: formData.departments.split(',').map(d => d.trim()),
        adminIds: formData.adminIds.split(',').map(a => a.trim()),
        memberIds: formData.memberIds.split(',').map(m => m.trim()),
      };
      const response = await fetch('/api/clubs/create-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create club');
      setFormData({ name: '', departments: '', adminIds: '', memberIds: '' });
      setIsModalOpen(false);
      fetchClubs(); 
    } catch (error) {
      console.error('Error creating club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingClub.id,
        name: formData.name,
        departments: formData.departments.split(',').map(d => d.trim()),
        adminIds: formData.adminIds.split(',').map(a => a.trim()),
        memberIds: formData.memberIds.split(',').map(m => m.trim()),
      };
      const response = await fetch('/api/clubs/modify-club', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update club');
      setFormData({ name: '', departments: '', adminIds: '', memberIds: '' });
      setIsEditModalOpen(false);
      setEditingClub(null);
      fetchClubs();
    } catch (error) {
      console.error('Error updating club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      departments: club.departments.join(', '),
      adminIds: club.adminIds.join(', '),
      memberIds: club.memberIds.join(', '),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (clubId: string, clubName: string) => {
    setDeletingClubId(clubId);
    setDeletingClubName(clubName);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingClubId) return;
    try {
      const response = await fetch('/api/clubs/delete-club', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingClubId }),
      });
      if (!response.ok) throw new Error('Failed to delete club');
      fetchClubs();
      setIsDeleteModalOpen(false);
      setDeletingClubId(null);
      setDeletingClubName('');
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Failed to delete club. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
          <DashboardNavbar user={user} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tighter text-gray-800">
                        Super Admin <span className="text-indigo-600">Dashboard</span>
                    </h1>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Club
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {clubs.map((club) => (
                        <div key={club.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col border-t-4 border-indigo-500">
                            <div className="p-6 grow">
                                <div className="flex justify-between items-start mb-5">
                                    <h2 className="text-2xl font-bold text-gray-800">{club.name}</h2>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => openEditModal(club)}
                                        className="text-indigo-500 hover:text-indigo-700"
                                      >
                                          <Edit className="h-5 w-5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(club.id, club.name)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                          <Trash className="h-5 w-5" />
                                      </button>
                                    </div>
                                </div>
                                
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

                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-indigo-500" />
                                        Members ({club.memberIds.length})
                                    </h3>
                                    <div className="space-y-1.5 text-sm text-gray-600 max-h-24 overflow-y-auto pr-2">
                                        {club.memberIds.map(member => <p key={member} className="truncate">{member}</p>)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-b-xl mt-auto px-6 py-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                Created: {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </main>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Club</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Club Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Departments (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.departments}
                      onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Admin Emails (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.adminIds}
                      onChange={(e) => setFormData({ ...formData, adminIds: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Member Emails (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.memberIds}
                      onChange={(e) => setFormData({ ...formData, memberIds: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Club'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isEditModalOpen && editingClub && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Edit Club</h2>
                  <button onClick={() => { setIsEditModalOpen(false); setEditingClub(null); }} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Club Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Departments (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.departments}
                      onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Admin Emails (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.adminIds}
                      onChange={(e) => setFormData({ ...formData, adminIds: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Member Emails (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.memberIds}
                      onChange={(e) => setFormData({ ...formData, memberIds: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsEditModalOpen(false); setEditingClub(null); }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Club'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Confirm Delete</h2>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete the club <strong>{deletingClubName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
  )
}

export default Page