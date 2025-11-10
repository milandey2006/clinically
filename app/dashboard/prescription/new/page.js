"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function NewPrescription() {
  const search = useSearchParams();
  const presetPatientId = search.get("patientId") || "";
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: presetPatientId,
    diagnosis: "",
    medicines: [{ name: "", dosage: "", duration: "" }],
    advice: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetch("/api/patients").then(r=>r.json()).then(setPatients);
  }, []);

  function updateMedicine(idx, key, val) {
    const m = [...form.medicines];
    m[idx][key] = val;
    setForm({ ...form, medicines: m });
  }
  function addRow() {
    setForm({ ...form, medicines: [...form.medicines, { name: "", dosage: "", duration: "" }] });
  }
  function removeRow(i) {
    const m = form.medicines.filter((_, idx) => idx !== i);
    setForm({ ...form, medicines: m });
  }

  async function handleSave(e) {
    e.preventDefault();
    await fetch("/api/prescriptions", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form),
    });
    alert("Saved");
    router.push("/dashboard");
  }

  // Create a printable PDF of a prescription area
  async function handlePDF() {
    const el = document.getElementById("prescription-preview");
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF('p','pt','a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`prescription_${Date.now()}.pdf`);
  }

  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-4">New Prescription</h1>

      <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
        <select value={form.patientId} onChange={e=>setForm({...form, patientId: e.target.value})} required className="border p-2">
          <option value="">Select patient</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name} — {p.age}</option>)}
        </select>

        <textarea placeholder="Diagnosis" value={form.diagnosis} onChange={e=>setForm({...form, diagnosis: e.target.value})} className="w-full border p-2" />

        <div>
          <div className="font-medium mb-2">Medicines</div>
          {form.medicines.map((m, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input placeholder="Name" value={m.name} onChange={e=>updateMedicine(idx,'name',e.target.value)} className="border p-2 flex-1" />
              <input placeholder="Dosage" value={m.dosage} onChange={e=>updateMedicine(idx,'dosage',e.target.value)} className="border p-2 w-32" />
              <input placeholder="Duration" value={m.duration} onChange={e=>updateMedicine(idx,'duration',e.target.value)} className="border p-2 w-28" />
              {idx>0 && <button type="button" onClick={()=>removeRow(idx)} className="px-3">Remove</button>}
            </div>
          ))}
          <button type="button" onClick={addRow} className="bg-gray-200 px-3 py-1 rounded">Add row</button>
        </div>

        <textarea placeholder="Advice / Notes" value={form.advice} onChange={e=>setForm({...form, advice: e.target.value})} className="w-full border p-2" />

        <div className="flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" onClick={handlePDF} className="bg-green-600 text-white px-4 py-2 rounded">Download PDF</button>
        </div>
      </form>

      {/* preview area — what will go into PDF */}
      <div id="prescription-preview" className="mt-8 p-6 border w-[600px] bg-white text-black">
        <div className="text-right text-sm">Clinic Name</div>
        <h2 className="text-xl font-bold">{patients.find(p=>p.id==form.patientId)?.name || "Patient name"}</h2>
        <div className="mb-2">{form.diagnosis}</div>
        <div>
          <strong>Medicines</strong>
          <ul className="list-disc ml-6">
            {form.medicines.map((m, i) => <li key={i}>{m.name} — {m.dosage} — {m.duration}</li>)}
          </ul>
        </div>
        <div className="mt-4"><strong>Advice:</strong><div>{form.advice}</div></div>
        <div className="mt-6 text-sm">Doctor signature</div>
      </div>
    </div>
  );
}
