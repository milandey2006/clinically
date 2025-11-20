"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Calendar, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Patients", href: "/dashboard/patients" },
  { icon: FileText, label: "Prescriptions", href: "/dashboard/prescriptions" },
  { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-background border-r border-gray-100 dark:border-border flex flex-col h-screen fixed left-0 top-0 z-30 hidden md:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-50 dark:border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M12 6v12m-6-6h12" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">MediPrescribe</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          // For dashboard, only match exact path. For others, match if path starts with href
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard"
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
        <Link href="/dashboard/create-prescription" className="block w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Prescription
          </Button>
        </Link>

        <div className="flex items-center gap-3 pt-2">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName || "Doctor"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">General Practitioner</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
