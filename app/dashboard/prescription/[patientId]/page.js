"use client";
import { useEffect, useState } from "react";

export default function PrescriptionForm() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    }
    fetchPatients();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📝 New Prescription</h2>
      <select
        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
        value={selectedPatient}
        onChange={(e) => setSelectedPatient(e.target.value)}
      >
        <option value="">Select patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Form ka baaki part niche */}
    </div>
  );
}
