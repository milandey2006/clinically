import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

const appointments = [
  { id: 1, time: "10:00", period: "AM", name: "Sophia Rodriguez", type: "Follow-up Visit" },
  { id: 2, time: "10:30", period: "AM", name: "James Wilson", type: "Annual Check-up" },
  { id: 3, time: "11:00", period: "AM", name: "Isabella Moore", type: "New Patient" },
];

export const UpcomingAppointments = () => {
  return (
    <Card className="border-none shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Appointments</CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your schedule for the rest of today.</p>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="flex items-start gap-4 group">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 min-w-[70px] text-center">
                <div className="text-sm font-bold text-blue-700 dark:text-blue-400">{apt.time}</div>
                <div className="text-xs font-medium text-blue-500 dark:text-blue-300">{apt.period}</div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{apt.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{apt.type}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 -mt-1">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800">
          <Button variant="link" className="w-full text-blue-600 font-medium hover:text-blue-700 h-auto p-0">
            View All Appointments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
