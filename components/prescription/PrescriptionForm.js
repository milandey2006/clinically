"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Download, Save, Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { getPatients, createPrescription } from "@/app/actions";
import { useRouter } from "next/navigation";
import { calculateFollowUp } from "@/lib/follow-up-logic";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { VoiceInput } from "@/components/ui/voice-input";
import { PrescriptionPreview } from "@/components/prescription/PrescriptionPreview";

export const PrescriptionForm = () => {
  const [patient, setPatient] = useState({ id: null, name: "", age: "", gender: "", date: new Date().toISOString().split('T')[0] });
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", alias: "", dosage: "", frequency: "", duration: "" }]);
  const [advice, setAdvice] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [visitType, setVisitType] = useState("first");
  const [followUpSuggestion, setFollowUpSuggestion] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [patientsList, setPatientsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const prescriptionRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleString());

    // Fetch patients
    const fetchPatients = async () => {
      const data = await getPatients();
      setPatientsList(data);
    };
    fetchPatients();
  }, []);

  const handlePatientSelect = (currentValue) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);

    const selectedPatient = patientsList.find((p) => p.name.toLowerCase() === currentValue.toLowerCase());
    if (selectedPatient) {
      setPatient({
        ...patient,
        id: selectedPatient.id,
        name: selectedPatient.name,
        age: selectedPatient.age ? selectedPatient.age.toString() : "",
        gender: selectedPatient.gender || "",
      });
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", alias: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedicine = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleGenerateFollowUp = () => {
    const suggestion = calculateFollowUp({
      diagnosis,
      age: patient.age,
      severity,
      visitType,
      patientName: patient.name,
    });
    setFollowUpSuggestion(suggestion);
  };

  // Auto-generate when relevant fields change
  useEffect(() => {
    if (diagnosis && patient.age) {
      handleGenerateFollowUp();
    }
  }, [diagnosis, patient.age, severity, visitType]);

  const handleSave = async () => {
    if (!patient.id) {
      alert("Please select a registered patient to save the prescription.");
      return;
    }

    setLoading(true);
    const result = await createPrescription({
      patientId: patient.id,
      diagnosis,
      medicines,
      advice,
      severity,
      visitType,
      followUpDate: followUpSuggestion?.follow_up_date?.toISOString(),
    });
    setLoading(false);

    if (result.success) {
      alert("Prescription saved successfully!");
      router.push("/dashboard/prescriptions");
    } else {
      alert("Failed to save prescription: " + result.message);
    }
  };

  const handleDownload = () => {
    if (prescriptionRef.current) {
      prescriptionRef.current.download();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Patient</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {value
                      ? patientsList.find((p) => p.name.toLowerCase() === value.toLowerCase())?.name
                      : "Select patient..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search patient..." />
                    <CommandList>
                      <CommandEmpty>No patient found.</CommandEmpty>
                      <CommandGroup>
                        {patientsList.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={handlePatientSelect}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value.toLowerCase() === p.name.toLowerCase() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {p.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={patient.name}
                  onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  disabled={!!patient.id} // Disable manual edit if selected from DB
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={patient.date}
                  onChange={(e) => setPatient({ ...patient, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input
                  placeholder="e.g. 32"
                  value={patient.age}
                  onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                  disabled={!!patient.id}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Input
                  placeholder="e.g. Male"
                  value={patient.gender}
                  onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                  disabled={!!patient.id}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Diagnosis & Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnosis</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Viral Fever"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
                <VoiceInput onTranscript={setDiagnosis} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Medicines</label>
                <Button variant="outline" size="sm" onClick={addMedicine}>
                  <Plus className="h-4 w-4 mr-2" /> Add Medicine
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="col-span-3 space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Medicine Name"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, "name", e.target.value)}
                      />
                      <VoiceInput
                        className="h-8 w-8"
                        onTranscript={(text) => updateMedicine(index, "name", text)}
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Alias (Optional)</label>
                    <Input
                      placeholder="e.g. Fever Pill"
                      value={medicine.alias}
                      onChange={(e) => updateMedicine(index, "alias", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Dosage</label>
                    <Input
                      placeholder="500mg"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Frequency</label>
                    <Input
                      placeholder="1-0-1"
                      value={medicine.frequency}
                      onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Duration</label>
                    <Input
                      placeholder="5 days"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => removeMedicine(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Advice</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Drink plenty of water"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                />
                <VoiceInput onTranscript={setAdvice} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visit Type</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                >
                  <option value="first">First Consultation</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Follow-up Reminder (AI Suggested)</label>
                <Button variant="ghost" size="sm" onClick={handleGenerateFollowUp} className="text-blue-600 hover:text-blue-700">
                  <Sparkles className="h-4 w-4 mr-2" /> Generate
                </Button>
              </div>

              {followUpSuggestion && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Recommended: {followUpSuggestion.follow_up_days} Days
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {followUpSuggestion.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-blue-900">
                        Date: {followUpSuggestion.follow_up_date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-blue-100 text-xs text-gray-600">
                    <p className="font-medium mb-1 text-gray-900">WhatsApp Message Preview:</p>
                    {followUpSuggestion.reminder_message}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Prescription"}
          </Button>
          <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="hidden lg:block sticky top-6">
        <PrescriptionPreview
          ref={prescriptionRef}
          patient={patient}
          diagnosis={diagnosis}
          medicines={medicines}
          advice={advice}
          date={currentDate}
        />
      </div>
    </div>
  );
};
