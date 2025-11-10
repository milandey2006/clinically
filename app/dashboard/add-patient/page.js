"use client";
import { useState } from "react";

export default function AddPatientPage() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("✅ Patient added successfully!");
      setForm({ name: "", age: "", gender: "", contact: "" });
    } else {
      alert("❌ Error adding patient!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Add New Patient</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Patient Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition"
        >
          Save
        </button>
      </form>
    </div>
  );
}
