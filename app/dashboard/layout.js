import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
