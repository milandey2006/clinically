import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const requests = [
  { id: 1, name: "Liam Johnson", medication: "Lisinopril 10mg", date: "Oct 26, 2023" },
  { id: 2, name: "Olivia Davis", medication: "Metformin 500mg", date: "Oct 26, 2023" },
  { id: 3, name: "Noah Martinez", medication: "Atorvastatin 20mg", date: "Oct 25, 2023" },
];

export const PrescriptionRequestsTable = () => {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Pending Prescription Requests</CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review and action new prescription requests.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient Name</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medication</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-gray-100">
                        <AvatarFallback className="text-xs text-gray-600 font-medium">
                          {req.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 dark:text-white">{req.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{req.medication}</td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{req.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs font-medium shadow-sm">
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white h-8 px-3 text-xs font-medium shadow-sm">
                        Deny
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
