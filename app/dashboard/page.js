"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch("/api/patients")
      .then(r => r.json())
      .then(setPatients);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <Link href="/dashboard/add-patient" className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Patient</Link>
        <Link href="/dashboard/prescription/new" className="ml-3 bg-green-600 text-white px-4 py-2 rounded">+ New Prescription</Link>
      </div>

      <h2 className="font-semibold mb-2">Patients ({patients.length})</h2>
      <ul className="space-y-2">
        {patients.map(p => (
          <li key={p.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-medium">{p.name} — {p.age} yrs</div>
              <div className="text-sm text-gray-600">{p.contact}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/prescriptions/${p.id}`} className="text-sm px-3 py-1 border rounded">History</Link>
              <Link href={`/dashboard/prescription/new?patientId=${p.id}`} className="bg-indigo-600 text-white px-3 py-1 rounded">Prescribe</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
