"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { addPatient, updatePatient, getPatients } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { VoiceInput } from "@/components/ui/voice-input";

function AddPatientForm() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    age: "",
    gender: ""
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      const fetchPatient = async () => {
        const patients = await getPatients();
        const patient = patients.find(p => p.id === parseInt(editId));
        if (patient) {
          setInitialData(patient);
          setFormData({
            name: patient.name || "",
            contact: patient.contact || "",
            age: patient.age?.toString() || "",
            gender: patient.gender || ""
          });
        }
      };
      fetchPatient();
    }
  }, [editId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("contact", formData.contact);
    submitFormData.append("age", formData.age);
    submitFormData.append("gender", formData.gender);
    
    let result;
    if (isEditing) {
      result = await updatePatient(parseInt(editId), submitFormData);
    } else {
      result = await addPatient(submitFormData);
    }
    
    setLoading(false);
    
    if (result.success) {
      alert(isEditing ? "Patient updated successfully!" : "Patient added successfully!");
      router.push("/dashboard/patients");
    } else {
      alert("Failed to save patient: " + result.message);
    }
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Patient" : "Add New Patient"}</h1>
        <p className="text-muted-foreground">{isEditing ? "Update patient details." : "Register a new patient to the system."}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Enter the patient's personal details below. Use the microphone icon to speak instead of typing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <div className="flex gap-2">
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                  <VoiceInput onTranscript={(text) => handleFieldChange("name", text)} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium">Contact Number</label>
                <div className="flex gap-2">
                  <Input 
                    id="contact" 
                    placeholder="+1 234 567 890" 
                    value={formData.contact}
                    onChange={(e) => handleFieldChange("contact", e.target.value)}
                  />
                  <VoiceInput onTranscript={(text) => handleFieldChange("contact", text)} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium">Age</label>
                <div className="flex gap-2">
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="32" 
                    value={formData.age}
                    onChange={(e) => handleFieldChange("age", e.target.value)}
                  />
                  <VoiceInput onTranscript={(text) => handleFieldChange("age", text)} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                <div className="flex gap-2">
                  <Input 
                    id="gender" 
                    placeholder="Male/Female/Other" 
                    value={formData.gender}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                  />
                  <VoiceInput onTranscript={(text) => handleFieldChange("gender", text)} />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEditing ? "Update Patient" : "Save Patient")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddPatientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPatientForm />
    </Suspense>
  );
}
