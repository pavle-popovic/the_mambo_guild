"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaSearch, FaUser } from "react-icons/fa";

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
  streak_count: number;
  created_at: string;
  role: string;
}

export default function AdminStudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      loadStudents();
    }
  }, [user, authLoading, router]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getStudents(searchTerm || undefined);
      setStudents(data);
    } catch (err: any) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [searchTerm]);

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-mambo-text mb-2">Students</h1>
          <p className="text-gray-400 text-sm">Manage and view all enrolled students</p>
        </header>

        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-mambo-panel border border-gray-800 rounded-lg text-mambo-text placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="bg-mambo-panel border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    XP
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Streak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-900/30 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                            <FaUser className="text-blue-400" />
                          </div>
                          <div>
                            <div className="text-mambo-text font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">{student.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-mambo-text font-medium">
                        {student.xp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400">
                          Level {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {student.streak_count} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

