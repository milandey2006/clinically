"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const mockAppointments = [
    {
        id: 1,
        title: "Dr. Sarah Wilson - General Checkup",
        patient: "Alice Johnson",
        time: "09:00 AM - 10:00 AM",
        type: "checkup",
        date: new Date().getDate(), // Today
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    {
        id: 2,
        title: "Dr. Michael Chen - Dental Cleaning",
        patient: "Robert Smith",
        time: "11:30 AM - 12:30 PM",
        type: "dental",
        date: new Date().getDate(), // Today
        color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    },
    {
        id: 3,
        title: "Dr. Emily Davis - Eye Exam",
        patient: "Carol White",
        time: "02:00 PM - 03:00 PM",
        type: "vision",
        date: new Date().getDate() + 1, // Tomorrow
        color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    },
    {
        id: 4,
        title: "Dr. James Brown - Follow-up",
        patient: "David Brown",
        time: "04:00 PM - 04:30 PM",
        type: "followup",
        date: new Date().getDate() + 2, // Day after tomorrow
        color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    },
];

export default function AppointmentsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState("month"); // 'month', 'week', 'day'

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const calendarDays = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20" />);
        }

        // Days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            const dayAppointments = mockAppointments.filter(
                (app) => app.date === day
            );

            calendarDays.push(
                <div
                    key={day}
                    className={cn(
                        "h-32 border-b border-r border-gray-100 dark:border-gray-800 p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 group relative",
                        isToday ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                    )}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span
                            className={cn(
                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                isToday
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                            )}
                        >
                            {day}
                        </span>
                        {dayAppointments.length > 0 && (
                            <span className="text-xs text-gray-400 font-medium">{dayAppointments.length} appts</span>
                        )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)] custom-scrollbar">
                        {dayAppointments.map((app) => (
                            <div
                                key={app.id}
                                className={cn(
                                    "text-xs p-1.5 rounded border truncate cursor-pointer transition-all hover:opacity-80 shadow-sm",
                                    app.color
                                )}
                            >
                                <div className="font-semibold truncate">{app.time.split(" - ")[0]}</div>
                                <div className="truncate opacity-90">{app.patient}</div>
                            </div>
                        ))}
                    </div>

                    {/* Add button on hover */}
                    <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-opacity">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            );
        }

        return calendarDays;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-background rounded-xl shadow-sm border border-gray-200 dark:border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                        Appointments
                    </h1>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrevMonth}
                            className="h-8 w-8 p-0 hover:bg-white dark:hover:bg-gray-700 rounded-md"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToday}
                            className="h-8 px-3 text-sm font-medium hover:bg-white dark:hover:bg-gray-700 rounded-md"
                        >
                            Today
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNextMonth}
                            className="h-8 w-8 p-0 hover:bg-white dark:hover:bg-gray-700 rounded-md"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search appointments..."
                            className="h-9 pl-9 pr-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                        />
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        {["Month", "Week", "Day"].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v.toLowerCase())}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    view === v.toLowerCase()
                                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Appointment
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-border">
                    {days.map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7 overflow-y-auto">
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
}
