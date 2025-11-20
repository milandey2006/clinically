import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const StatCard = ({ title, value, change, trend = "up" }) => {
  const isPositive = trend === "up";
  
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`flex items-center mt-4 text-sm font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          <span>{change > 0 ? "+" : ""}{change}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
