"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    X,
    ClipboardCheck,
    User,
    CalendarDays,
    ChevronsUpDown,
    Trash2,
} from "lucide-react";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useParams } from "next/navigation";

// types for tasks and clubs
interface Task {
    id: string;
    createdAt: string;
    department: string;
    description: string;
    title: string;
    dueDate: string; 
    status: number;
    givenBy: "personal" | "club";
}

interface Club {
    id: string;
    name: string;
    departments: string[];
    createdAt: Date;
}

// progress bar component
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

// task card to display each task
const TaskCard = ({
    task,
    onEdit,
    onDelete,
}: {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status < 100;

    return (
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 shadow-sm"
                        aria-label="Edit task"
                    >
                        <Edit2 size={18} />
                    </button>
                    {task.givenBy === "personal" && (
                        <button
                            onClick={() => onDelete(task)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 shadow-sm"
                            aria-label="Delete task"
                        >
                            <Trash2 size={18} />
                    </button>
                    )}
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

            <div className="flex items-center justify-between text-sm">
                <div
                    className={`flex items-center gap-1.5 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                        }`}
                >
                    <CalendarDays size={16} />
                    <span>
                        {isOverdue ? "Overdue" : "Due"}:{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
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

// modal for adding or editing tasks
const TaskModal = ({
    isOpen,
    onClose,
    onSave,
    task,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, "id" | "createdAt" | "department"> & { id?: string }) => void;
    task: Partial<Task> | null;
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState(0);
    const [givenBy, setGivenBy] = useState<"personal" | "club">("personal");

    React.useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setDueDate(task.dueDate || new Date().toISOString().split("T")[0]);
            setStatus(task.status || 0);
            setGivenBy(task.givenBy || "personal");
        } else {
            // Reset for new task
            setTitle("");
            setDescription("");
            setDueDate(new Date().toISOString().split("T")[0]);
            setStatus(0);
            setGivenBy("personal");
        }
    }, [task, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: task?.id,
            title,
            description,
            dueDate,
            status,
            givenBy,
        });
    };

    const isEditing = !!task?.id;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {isEditing ? "Update Progress" : "Add New Task"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEditing && (
                        <>
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="dueDate"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        id="dueDate"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="givenBy"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Task Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="givenBy"
                                            value={givenBy}
                                            onChange={(e) => setGivenBy(e.target.value as "personal" | "club")}
                                            className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="personal">Personal</option>
                                            <option value="club">Club</option>
                                        </select>
                                        <ChevronsUpDown
                                            size={18}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Status/Progress */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Progress: <span className="font-bold text-blue-600">{status}%</span>
                        </label>
                        <input
                            type="range"
                            id="status"
                            min="0"
                            max="100"
                            step="5"
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            <Plus size={18} />
                            {isEditing ? "Update Progress" : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// main page component
export default function Page() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

    const [userClubs, setUserClubs] = useState<string[]>([]);
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [applied, setApplied] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // fetch user clubs and all clubs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clubsRes, allClubsRes] = await Promise.all([
                    fetch('/api/user/clubs/get-my-clubs'),
                    fetch('/api/user/clubs/get-all-clubs')
                ]);
                if (clubsRes.ok) {
                    const clubs = await clubsRes.json();
                    setUserClubs(clubs);
                }
                if (allClubsRes.ok) {
                    const clubs = await allClubsRes.json();
                    setAllClubs(clubs);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // fetch tasks for the club
    useEffect(() => {
        const fetchTasks = async () => {
            if (!user || !id) return;
            try {
                const res = await fetch(`/api/user/tasks/get-task?clubId=${id}&userId=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const allTasks = data.map((t: any) => ({
                        id: t.progressId,
                        createdAt: new Date(t.createdAt._seconds * 1000).toISOString(),
                        department: "Club",
                        description: t.description,
                        title: t.title,
                        dueDate: new Date(t.dueDate._seconds * 1000).toISOString().split('T')[0],
                        status: t.status,
                        givenBy: t.givenBy as "personal" | "club"
                    }));
                    setTasks(allTasks);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, [user, id, refetchTrigger]);

    const clubData = allClubs.find(c => c.id === id);

    const handleApply = async () => {
        if (!selectedDepartment) {
            alert('Please select a department');
            return;
        }
        try {
            const res = await fetch('/api/user/clubs/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubId: id, department: selectedDepartment })
            });
            if (res.ok) {
                setApplied(true);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to apply');
            }
        } catch (error) {
            console.error('Error applying:', error);
            alert('Error applying');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!clubData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-gray-500">Club not found</div>
            </div>
        );
    }

    const isMember = userClubs.includes(id);

    if (!isMember) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Apply to {clubData.name}</h1>
                    {applied ? (
                        <p className="text-green-600 text-center">Application submitted successfully! Waiting for approval.</p>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Department
                                </label>
                                <select
                                    id="department"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose a department</option>
                                    {clubData.departments.map((dept: string) => (
                                        <option key={dept} value={dept}>
                                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleApply}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Filter tasks
    const clubTasks = tasks.filter((task) => task.givenBy === "club");
    const personalTasks = tasks.filter((task) => task.givenBy === "personal");

    const handleOpenModal = (task: Task | null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = async (
        taskData: Omit<Task, "id" | "createdAt" | "department"> & { id?: string }
    ) => {
        if (taskData.id) {
            try {
                const res = await fetch('/api/user/tasks/update-progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ progressId: taskData.id, status: taskData.status }),
                });

                if (res.ok) {
                    setTasks(
                        tasks.map((t) =>
                            t.id === taskData.id ? { ...t, status: taskData.status } : t
                        )
                    );
                } else {
                    const error = await res.json();
                    alert(error.error || 'Failed to update progress');
                }
            } catch (error) {
                console.error('Error updating progress:', error);
                alert('Error updating progress');
            }
        } else {
            // Add new task via API
            const createdAt = {
                _seconds: Math.floor(Date.now() / 1000),
                _nanoseconds: 0,
            };
            const dueDateObj = new Date(taskData.dueDate);
            const dueDate = {
                _seconds: Math.floor(dueDateObj.getTime() / 1000),
                _nanoseconds: 0,
            };

            const payload = {
                userId: user?.uid,
                clubId: id,
                createdAt,
                description: taskData.description,
                dueDate,
                givenBy: taskData.givenBy,
                status: taskData.status,
                title: taskData.title,
            };

            try {
                const res = await fetch('/api/user/tasks/add-task', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    setRefetchTrigger(prev => prev + 1);
                } else {
                    const error = await res.json();
                    alert(error.error || 'Failed to add task');
                }
            } catch (error) {
                console.error('Error adding task:', error);
                alert('Error adding task');
            }
        }
        handleCloseModal();
    };

    const handleDeleteTask = async (task: Task) => {
            try {
                const res = await fetch('/api/user/tasks/delete-personal-task', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ progressId: task.id }),
                });

                if (res.ok) {
                    setTasks(tasks.filter((t) => t.id !== task.id));
                } else {
                    const error = await res.json();
                    alert(error.error || 'Failed to delete task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Error deleting task');
            }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <DashboardNavbar user={user} />
            <div className="max-w-7xl mx-auto space-y-6 p-4">


                {/* Task Sections */}
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Club Tasks */}
                    <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <ClipboardCheck className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-800">
                                Club Tasks ({clubTasks.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {clubTasks.length > 0 ? (
                                clubTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onEdit={handleOpenModal}
                                        onDelete={handleDeleteTask}
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
                            <h2 className="text-xl font-semibold text-gray-800">
                                Personal Tasks ({personalTasks.length})
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {personalTasks.length > 0 ? (
                                personalTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onEdit={handleOpenModal}
                                        onDelete={handleDeleteTask}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No personal tasks added.
                                </p>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            <button
                onClick={() => handleOpenModal(null)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center z-50"
                aria-label="Add new task"
            >
                <Plus size={24} />
            </button>

            {/* Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                task={editingTask}
            />
        </div>
    );
}