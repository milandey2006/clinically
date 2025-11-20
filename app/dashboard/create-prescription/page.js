import { PrescriptionForm } from "@/components/prescription/PrescriptionForm";

export default function CreatePrescriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Prescription</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to generate a prescription.</p>
      </div>
      
      <PrescriptionForm />
    </div>
  );
}
