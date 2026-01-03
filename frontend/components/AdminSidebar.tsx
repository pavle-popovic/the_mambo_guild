"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaChartLine,
  FaLayerGroup,
  FaGraduationCap,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

interface AdminSidebarProps {
  pendingCount?: number;
}

export default function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/admin", icon: FaChartLine, label: "Dashboard" },
    { href: "/admin/builder", icon: FaLayerGroup, label: "Course Builder" },
    {
      href: "/admin/grading",
      icon: FaGraduationCap,
      label: "Grading Queue",
      badge: pendingCount,
    },
    { href: "#", icon: FaUsers, label: "Students" },
    { href: "#", icon: FaCog, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-mambo-panel border-r border-gray-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Image
          src="/assets/Logo.png"
          alt="The Mambo Inn"
          width={24}
          height={24}
          className="h-6 w-auto logo-img"
          style={{ mixBlendMode: "screen" }}
        />
        <span className="font-bold text-lg tracking-wide text-mambo-text">ADMIN</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-mambo-text"
              }`}
            >
              <Icon className="w-5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-500 hover:text-mambo-text text-sm w-full"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}
