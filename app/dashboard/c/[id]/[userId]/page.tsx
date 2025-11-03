"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    ClipboardCheck,
    User,
    CalendarDays,
    Plus,
    X,
    Trash,
    Loader,
} from "lucide-react";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { useAuth } from "../../../../../providers/AuthProvider";
import Image from "next/image";

interface ProgressTask {
    progressId: string;
    createdAt: {
        _seconds: number;
        _nanoseconds: number;
    };
    description: string;
    dueDate: {
        _seconds: number;
        _nanoseconds: number;
    };
    givenBy: string;
    status: number;
    title: string;
}

interface UserData {
    email: string;
    name: string;
    photoURL: string | null;
    department: string;
    role: string;
    progress: ProgressTask[];
    departments: string[];
}


const SteppedProgressBar = ({ progress }: { progress: number }) => {
    const segments = 10;
    const filledSegments = Math.round((progress / 100) * segments);
    const color = progress === 100 ? "bg-green-500" : "bg-blue-500";

    return (
        <div className="flex w-full gap-1 h-3">
            {Array.from({ length: segments }).map((_, i) => (
                <div
                    key={i}
                    className={`flex-1 h-full rounded ${i < filledSegments ? color : "bg-gray-200"
                        } transition-all duration-300`}
                />
            ))}
        </div>
    );
};

const EditDueDateModal = ({
    isOpen,
    onClose,
    onSubmit,
    currentDueDate,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newDueDate: string) => void;
    currentDueDate: string;
    isLoading: boolean;
}) => {
    const [dueDate, setDueDate] = useState(currentDueDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dueDate && !isLoading) {
            onSubmit(dueDate);
        }
    };

    useEffect(() => {
        setDueDate(currentDueDate);
    }, [currentDueDate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Edit Due Date</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader size={16} className="animate-spin" />}
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TaskCard = ({
    task,
    onEditDueDate,
    onDeleteTask,
}: {
    task: ProgressTask;
    onEditDueDate: (progressId: string, currentDueDate: string) => void;
    onDeleteTask: (progressId: string) => void;
}) => {
    const isOverdue = new Date(task.dueDate._seconds * 1000) < new Date() && task.status < 100;

    return (
        <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">{task.title}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEditDueDate(task.progressId, new Date(task.dueDate._seconds * 1000).toISOString().split('T')[0])}
                        className="text-blue-500 hover:text-blue-700 text-sm hover:cursor-pointer"
                    >
                        Edit Due Date
                    </button>
                    <button
                        onClick={() => onDeleteTask(task.progressId)}
                        className="text-red-500 hover:text-red-700 text-sm hover:cursor-pointer"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{task.description}</p>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">Progress</span>
                    <span
                        className={`text-sm font-semibold ${task.status === 100 ? "text-green-600" : "text-blue-600"
                            }`}
                    >
                        {task.status}%
                    </span>
                </div>
                <SteppedProgressBar progress={task.status} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                <div
                    className={`flex items-center gap-1.5 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                        } mb-2 sm:mb-0`}
                >
                    <CalendarDays size={16} />
                    <span>
                        {isOverdue ? "Overdue" : "Due"}:{" "}
                        {new Date(task.dueDate._seconds * 1000).toLocaleDateString('en-GB')}
                    </span>
                </div>
                {task.status === 100 && (
                    <span className="text-green-600 font-medium text-xs px-2 py-0.5 bg-green-50 rounded-full">
                        Completed
                    </span>
                )}
            </div>
        </div>
    );
};


const AddTaskModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: { title: string; description: string; dueDate: string }) => void;
    isLoading: boolean;
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && description && dueDate && !isLoading) {
            onSubmit({ title, description, dueDate });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add New Task</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader size={16} className="animate-spin" />}
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RemoveMemberModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Remove Member</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>
                <p className="text-gray-700 mb-6">
                    Are you sure you want to remove this member from the club? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader size={16} className="animate-spin" />}
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteTaskModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Delete Task</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>
                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader size={16} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Page() {
    const params = useParams<{ id: string; userId: string }>();
    const { id, userId } = params;
    const { user } = useAuth();

    const [data, setData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<{ progressId: string; currentDueDate: string } | null>(null);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    // Loading states for actions
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);

    const [isEditingDepartment, setIsEditingDepartment] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState("");

    useEffect(() => {
        if (data) {
            setSelectedDepartment(data.department);
        }
    }, [data]);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/admin/members/get-member-info?userId=${userId}&clubId=${id}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                setError(`Error: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            setError(`Fetch error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && userId) {
            fetchData();
        }
    }, [id, userId]);

    const handleUpdateDepartment = async () => {
        if (!selectedDepartment) return;
        setIsUpdatingDepartment(true);

        try {
            const response = await fetch('/api/admin/members/update-department', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, clubId: id, department: selectedDepartment }),
            });

            if (response.ok) {
                fetchData();
                setIsEditingDepartment(false);
            } else {
                setError('Failed to update department');
            }
        } catch (err) {
            setError('Error updating department');
        } finally {
            setIsUpdatingDepartment(false);
        }
    };

    const handleAddTask = async (task: { title: string; description: string; dueDate: string }) => {
        setIsAddingTask(true);
        const createdAt = new Date();
        const dueDateObj = new Date(task.dueDate);

        const payload = {
            clubId: id,
            userId,
            createdAt: {
                _seconds: Math.floor(createdAt.getTime() / 1000),
                _nanoseconds: 0,
            },
            description: task.description,
            dueDate: {
                _seconds: Math.floor(dueDateObj.getTime() / 1000),
                _nanoseconds: 0,
            },
            title: task.title,
        };

        try {
            const response = await fetch('/api/admin/tasks/give-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                fetchData();
                setIsModalOpen(false);
            } else {
                setError('Failed to add task');
            }
        } catch (err) {
            setError('Error adding task');
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleEditDueDate = (progressId: string, currentDueDate: string) => {
        setEditingTask({ progressId, currentDueDate });
        setIsEditModalOpen(true);
    };

    const handleUpdateDueDate = async (newDueDate: string) => {
        if (!editingTask) return;
        setIsUpdatingDueDate(true);

        const dueDateObj = new Date(newDueDate);
        const payload = {
            progressId: editingTask.progressId,
            newDueDate: {
                _seconds: Math.floor(dueDateObj.getTime() / 1000),
                _nanoseconds: 0,
            },
        };

        try {
            const response = await fetch('/api/admin/tasks/update-duedate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                fetchData();
                setIsEditModalOpen(false);
                setEditingTask(null);
            } else {
                setError('Failed to update due date');
            }
        } catch (err) {
            setError('Error updating due date');
        } finally {
            setIsUpdatingDueDate(false);
        }
    };

    const handleRemoveMember = async () => {
        setIsRemovingMember(true);
        const payload = { clubId: id, userId };

        try {
            const response = await fetch('/api/admin/members/remove-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                window.location.href = `/dashboard/c/${id}`;
            } else {
                setError('Failed to remove member');
            }
        } catch (err) {
            setError('Error removing member');
        } finally {
            setIsRemovingMember(false);
        }
    };

    const handleDeleteTask = (progressId: string) => {
        setDeletingTaskId(progressId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDeleteTask = async () => {
        if (!deletingTaskId) return;
        setIsDeletingTask(true);

        try {
            const response = await fetch('/api/admin/tasks/delete-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progressId: deletingTaskId }),
            });

            if (response.ok) {
                fetchData();
                setIsDeleteModalOpen(false);
                setDeletingTaskId(null);
            } else {
                setError('Failed to delete task');
            }
        } catch (err) {
            setError('Error deleting task');
        } finally {
            setIsDeletingTask(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-gray-500 flex items-center gap-2">
                    <Loader size={24} className="animate-spin" />
                    Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-gray-500">No data available</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <DashboardNavbar user={user} />
            <div className="max-w-7xl mx-auto space-y-6 p-4">
                {/* User Info Section */}
                <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {data.photoURL ? (
                                <Image
                                    src={data.photoURL}
                                    alt={data.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                    width={64}
                                    height={64}
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={32} className="text-gray-500" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{data.name}</h1>
                                <p className="text-gray-600">{data.email}</p>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                                    <span className="text-sm text-gray-500">
                                        Department: 
                                        {isEditingDepartment ? (
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="ml-1 px-2 py-1 border border-gray-300 rounded"
                                                disabled={isUpdatingDepartment}
                                            >
                                                {data.departments.map((dept) => (
                                                    <option key={dept} value={dept}>
                                                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-medium ml-1">{data.department.charAt(0).toUpperCase() + data.department.slice(1)}</span>
                                        )}
                                        {!isEditingDepartment ? (
                                            <button
                                                onClick={() => setIsEditingDepartment(true)}
                                                className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="ml-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                                                <button
                                                    onClick={handleUpdateDepartment}
                                                    className="text-green-500 hover:text-green-700 text-sm flex items-center gap-1"
                                                    disabled={isUpdatingDepartment}
                                                >
                                                    {isUpdatingDepartment && <Loader size={12} className="animate-spin" />}
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingDepartment(false);
                                                        setSelectedDepartment(data.department);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                    disabled={isUpdatingDepartment}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Role: <span className="font-medium capitalize">{data.role}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsRemoveModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:cursor-pointer w-full sm:w-auto"
                        >
                            <Trash size={16} />
                            Remove Member
                        </button>
                    </div>
                </section>

                {/* Tasks Section */}
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Club Tasks */}
                    <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                            <div className="flex items-center gap-3">
                                <ClipboardCheck className="text-blue-600" size={24} />
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    Club Tasks ({data.progress.filter(t => t.givenBy === "club").length})
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer w-full sm:w-auto"
                            >
                                <Plus size={16} />
                                Add Task
                            </button>
                        </div>
                        <div className="space-y-4">
                            {data.progress.filter(t => t.givenBy === "club").length > 0 ? (
                                data.progress.filter(t => t.givenBy === "club").map((task, index) => (
                                    <TaskCard
                                        key={index}
                                        task={task}
                                        onEditDueDate={handleEditDueDate}
                                        onDeleteTask={handleDeleteTask}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No club tasks assigned.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Personal Tasks */}
                    <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="text-green-600" size={24} />
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                Personal Tasks ({data.progress.filter(t => t.givenBy === "personal").length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {data.progress.filter(t => t.givenBy === "personal").length > 0 ? (
                                data.progress.filter(t => t.givenBy === "personal").map((task, index) => (
                                    <TaskCard
                                        key={index}
                                        task={task}
                                        onEditDueDate={handleEditDueDate}
                                        onDeleteTask={handleDeleteTask}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No personal tasks.
                                </p>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            <AddTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTask}
                isLoading={isAddingTask}
            />

            {editingTask && (
                <EditDueDateModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdateDueDate}
                    currentDueDate={editingTask.currentDueDate}
                    isLoading={isUpdatingDueDate}
                />
            )}

            <RemoveMemberModal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                onConfirm={handleRemoveMember}
                isLoading={isRemovingMember}
            />

            <DeleteTaskModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteTask}
                isLoading={isDeletingTask}
            />
        </div>
    );
    //sd
}