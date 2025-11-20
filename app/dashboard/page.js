import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { PrescriptionRequestsTable } from "@/components/dashboard/PrescriptionRequestsTable";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import Link from "next/link";

import { getDoctorProfile } from "@/app/actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  const profile = await getDoctorProfile();
  const doctorName = profile?.name || user?.fullName || "Doctor";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, {doctorName}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apsos;s a summary of your activity for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/create-prescription">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-5">
              Create New Prescription
            </Button>
          </Link>
          <Button variant="outline" className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm h-10 px-5">
            Add New Patient
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Prescriptions (Month)" 
          value="124" 
          change={5.2} 
          trend="up" 
        />
        <StatCard 
          title="Pending Requests" 
          value="8" 
          change={2.1} 
          trend="up" 
        />
        <StatCard 
          title="Today's Appointments" 
          value="15" 
          change={-1.5} 
          trend="down" 
        />
        <StatCard 
          title="New Messages" 
          value="3" 
          change={1.8} 
          trend="up" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PrescriptionRequestsTable />
        </div>
        <div>
          <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
}
