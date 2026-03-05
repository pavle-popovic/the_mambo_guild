"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaChartLine,
  FaLayerGroup,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaVideo,
  FaUserCheck,
} from "react-icons/fa";

interface AdminSidebarProps {
  coachingPendingCount?: number;
}

export default function AdminSidebar({
  coachingPendingCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/admin", icon: FaChartLine, label: "Dashboard" },
    { href: "/admin/live", icon: FaVideo, label: "Live Meetings" },
    { href: "/admin/builder", icon: FaLayerGroup, label: "Course Builder" },
    {
      href: "/admin/coaching",
      icon: FaUserCheck,
      label: "Coaching Queue",
      badge: coachingPendingCount,
    },
    { href: "/admin/students", icon: FaUsers, label: "Students" },
    { href: "/admin/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-mambo-panel border-r border-white/10 flex flex-col fixed left-0 top-0 h-screen z-10">
      <div className="p-6 flex items-center gap-3">
        <Image
          src="/assets/Logo.png"
          alt="The Mambo Guild"
          width={24}
          height={24}
          className="h-6 w-auto logo-img"
          style={{ mixBlendMode: "screen" }}
        />
        <span className="font-bold text-lg tracking-wide text-mambo-text">ADMIN</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Exact match for dashboard, prefix match for sub-pages
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-mambo-text"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-500 hover:text-mambo-text text-sm w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
        >
          <FaSignOutAlt className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
