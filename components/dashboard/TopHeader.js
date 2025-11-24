"use client";

import { Bell, Search, HelpCircle, Menu, LayoutDashboard, Users, FileText, Calendar, Settings, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { SkiperThemeToggle } from "@/components/SkiperThemeToggle";

export const TopHeader = () => {
  const { user } = useUser();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Users, label: "Patients", href: "/dashboard/patients", active: false },
    { icon: FileText, label: "Prescriptions", href: "/dashboard/prescriptions", active: false },
    { icon: Calendar, label: "Appointments", href: "/dashboard/appointments", active: false },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", active: false },
  ];

  return (
    <header className="h-16 bg-white dark:bg-background border-b border-gray-100 dark:border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="h-16 flex items-center px-6 border-b border-gray-50">
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
                <SheetTitle className="text-xl font-bold text-gray-900">MediPrescribe</SheetTitle>
              </div>
            </div>
            <nav className="flex-1 py-6 px-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${item.active ? "text-blue-600" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-50 space-y-4 mt-auto">
              <Link href="/dashboard/create-prescription" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Prescription
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 max-w-xl ml-4 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients, prescriptions..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <SkiperThemeToggle />
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.fullName || "Doctor"}</p>
            <p className="text-xs text-gray-500">General Practitioner</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
};
