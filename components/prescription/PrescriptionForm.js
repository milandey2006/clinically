"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraggableMicButton } from "@/components/DraggableMicButton";
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
import { AddPatientDialog } from "@/components/AddPatientDialog";

export const PrescriptionForm = () => {
  const [patient, setPatient] = useState({ id: null, name: "", age: "", gender: "", contact: "" });
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicines, setMedicines] = useState([{ name: "", alias: "", dosage: "", frequency: "", duration: "", isExternal: false }]);
  const [advice, setAdvice] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [visitType, setVisitType] = useState("first");
  const [followUpSuggestion, setFollowUpSuggestion] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [patientsList, setPatientsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const prescriptionRef = useRef(null);
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const recognitionRef = useRef(null);

  // Refs for all inputs to manage focus
  const patientNameRef = useRef(null);
  const patientContactRef = useRef(null);
  const patientAgeRef = useRef(null);
  const patientGenderRef = useRef(null);
  const diagnosisRef = useRef(null);
  const adviceRef = useRef(null);
  const severityRef = useRef(null);
  const visitTypeRef = useRef(null);
  // Dynamic refs for medicines are a bit trickier, we'll store them in a map or array
  const medicineRefs = useRef([]);

  // Flattened list of fields for navigation
  const getFieldOrder = () => {
    const fields = [
      { name: "patient.name", ref: patientNameRef, type: "text" },
      { name: "patient.contact", ref: patientContactRef, type: "text" },
      { name: "patient.age", ref: patientAgeRef, type: "text" },
      { name: "patient.gender", ref: patientGenderRef, type: "text" },
      { name: "diagnosis", ref: diagnosisRef, type: "text" },
    ];

    medicines.forEach((med, dateIndex) => {
      fields.push({ name: `medicine.${dateIndex}.name`, ref: (el) => (medicineRefs.current[`${dateIndex}.name`] = el), type: "text" });
      if (med.showAlias || med.alias) {
        fields.push({ name: `medicine.${dateIndex}.alias`, ref: (el) => (medicineRefs.current[`${dateIndex}.alias`] = el), type: "text" });
      }
      fields.push({ name: `medicine.${dateIndex}.dosage`, ref: (el) => (medicineRefs.current[`${dateIndex}.dosage`] = el), type: "text" });
      fields.push({ name: `medicine.${dateIndex}.frequency`, ref: (el) => (medicineRefs.current[`${dateIndex}.frequency`] = el), type: "text" });
      fields.push({ name: `medicine.${dateIndex}.duration`, ref: (el) => (medicineRefs.current[`${dateIndex}.duration`] = el), type: "text" });
    });

    fields.push({ name: "advice", ref: adviceRef, type: "text" });
    fields.push({ name: "severity", ref: severityRef, type: "select" });
    fields.push({ name: "visitType", ref: visitTypeRef, type: "select" });

    return fields;
  };

  const fields = getFieldOrder();

  const startListening = (index) => {
    setActiveFieldIndex(index);
    setIsListening(true);

    // Focus the field
    const field = fields[index];
    if (field && field.ref && field.ref.current) {
      field.ref.current.focus();
    } else if (field && typeof field.ref === 'function') {
      // Handle dynamic refs if stored differently, but here we using map
      // For dynamic refs, we need to ensure the ref callback stored the element
      // We will access medicineRefs.current directly in navigation
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        const lowerTranscript = finalTranscript.trim().toLowerCase();

        if (lowerTranscript.endsWith("next") || lowerTranscript === "next") {
          // Move to next field
          const nextIndex = activeFieldIndex + 1;
          if (nextIndex < fields.length) {
            setActiveFieldIndex(nextIndex);
            const nextField = fields[nextIndex];

            // Handle resolving the ref
            let nextElement = nextField.ref.current;
            if (!nextElement && nextField.name.startsWith("medicine")) {
              const parts = nextField.name.split(".");
              // reconstruct key
              const key = `${parts[1]}.${parts[2]}`;
              nextElement = medicineRefs.current[key];
            }

            if (nextElement) {
              nextElement.focus();
              // Optional: speak feedback
            }
          }
          return;
        }

        if (lowerTranscript.endsWith("stop") || lowerTranscript === "stop") {
          stopListening();
          return;
        }

        if (lowerTranscript.endsWith("previous") || lowerTranscript === "previous" || lowerTranscript.endsWith("back") || lowerTranscript === "back") {
          const prevIndex = activeFieldIndex - 1;
          if (prevIndex >= 0) {
            setActiveFieldIndex(prevIndex);
            const prevField = fields[prevIndex];

            let prevElement = prevField.ref.current;
            if (!prevElement && prevField.name.startsWith("medicine")) {
              const parts = prevField.name.split(".");
              const key = `${parts[1]}.${parts[2]}`;
              prevElement = medicineRefs.current[key];
            }

            if (prevElement) {
              prevElement.focus();
            }
          }
          return;
        }

        if (lowerTranscript.endsWith("external") || lowerTranscript === "external") {
          const currentField = fields[activeFieldIndex];
          if (currentField && currentField.name.startsWith("medicine.")) {
            const parts = currentField.name.split(".");
            const index = parseInt(parts[1]);
            // We need to toggle, but we need the current value.
            // Accessing 'medicines' state directly here works because it's in dependency array.
            const currentVal = medicines[index].isExternal;
            updateMedicine(index, "isExternal", !currentVal);
          }
          return;
        }

        if (finalTranscript) {
          // Update the current field value
          // We need a robust way to update state based on activeFieldIndex
          const currentField = fields[activeFieldIndex];

          if (currentField.name === "patient.name") {
            setPatient(prev => ({ ...prev, name: prev.name ? `${prev.name} ${finalTranscript}` : finalTranscript }));
          } else if (currentField.name === "patient.age") {
            // Number check?
            setPatient(prev => ({ ...prev, age: finalTranscript.replace(/\D/g, "") }));
          } else if (currentField.name === "patient.gender") {
            setPatient(prev => ({ ...prev, gender: finalTranscript }));
          } else if (currentField.name === "diagnosis") {
            setDiagnosis(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
          } else if (currentField.name === "advice") {
            setAdvice(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
          } else if (currentField.name.startsWith("medicine.")) {
            const parts = currentField.name.split(".");
            const index = parseInt(parts[1]);
            const field = parts[2];
            updateMedicine(index, field, finalTranscript); // This might overwrite, maybe we want append?
            // For now overwrite or strict voice filling is fine, or simple append logic
            // updateMedicine replaces value. Let's make it append if text exists?
            // Actually existing updateMedicine just sets value.
            // Let's modify behavior: if existing value, append space + text
            // But we need access to current value.
          }
        }
      };

      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch (e) { }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      return () => {
        recognition.onend = null; // Prevent restart
        recognition.stop();
      };
    }
  }, [isListening, activeFieldIndex, medicines, patient, diagnosis, advice]);
  // Dependencies are important here for state updates, 
  // but restarting recognition on every keystroke/state change is bad UX (flickering).
  // Better approach: Use functional state updates (setPatient(prev => ...)) which we did.
  // But we need 'fields' to be stable or recalculated index to remain valid.
  // 'fields' is derived from 'medicines' state. If medicines change (add/remove), indexes shift.

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

  const refreshPatients = async (newPatientName) => {
    const data = await getPatients();
    setPatientsList(data);
    if (newPatientName) {
      setValue(newPatientName);
      const p = data.find(pt => pt.name.toLowerCase() === newPatientName.toLowerCase());
      if (p) {
        setPatient({
          id: p.id,
          name: p.name,
          age: p.age ? p.age.toString() : "",
          gender: p.gender || "",
          contact: p.contact || ""
        });
      }
    }
  };

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
        contact: selectedPatient.contact || "",
      });
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", alias: "", dosage: "", frequency: "", duration: "", isExternal: false }]);
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
      diagnosisDate, // Note: Schema might need this or just use createdAt
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
              <div className="pt-1">
                <Button variant="link" className="text-xs p-0 h-auto text-blue-600" onClick={() => setAddPatientOpen(true)}>
                  + Create New Patient
                </Button>
              </div>
              <AddPatientDialog
                open={addPatientOpen}
                onOpenChange={setAddPatientOpen}
                onPatientAdded={refreshPatients}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <Input
                    ref={patientNameRef}
                    placeholder="John Doe"
                    value={patient.name}
                    onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                    onFocus={() => setActiveFieldIndex(0)}
                    disabled={!!patient.id} // Disable manual edit if selected from DB
                    className="pr-10"
                  />
                  {/* Mic button removed */}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  ref={patientContactRef}
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={patient.contact}
                  onChange={(e) => setPatient({ ...patient, contact: e.target.value })}
                  onFocus={() => setActiveFieldIndex(1)}
                  disabled={!!patient.id}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <div className="relative">
                  <Input
                    ref={patientAgeRef}
                    placeholder="e.g. 32"
                    value={patient.age}
                    onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                    onFocus={() => setActiveFieldIndex(2)}
                    disabled={!!patient.id}
                  />
                  {/* Implicit voice support, no button needed per requirements, but good to have active state tracking */}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Input
                  ref={patientGenderRef}
                  placeholder="e.g. Male"
                  value={patient.gender}
                  onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                  onFocus={() => setActiveFieldIndex(3)}
                  disabled={!!patient.id}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Diagnosis & Medicines
              {isListening && (
                <span className="text-xs font-normal text-red-500 animate-pulse flex items-center gap-2 border px-2 py-1 rounded-full bg-red-50">
                  <Mic className="w-3 h-3" /> Listening... Say "Next" or "Stop"
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <div className="relative">
                  <Input
                    ref={diagnosisRef}
                    placeholder="e.g. Viral Fever"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    onFocus={() => setActiveFieldIndex(4)}
                    className="pr-10"
                  />
                  {/* Mic button removed */}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={diagnosisDate}
                  onChange={(e) => setDiagnosisDate(e.target.value)}
                />
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
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
                  {/* Row 1: Name and Alias Toggle */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="relative w-full">
                            <Input
                              ref={(el) => (medicineRefs.current[`${index}.name`] = el)}
                              placeholder="Medicine Name"
                              value={medicine.name}
                              onChange={(e) => updateMedicine(index, "name", e.target.value)}
                              onFocus={() => {
                                // Need to find the flat index for this field
                                // This is expensive O(N) but N is small.
                                const fs = getFieldOrder();
                                const idx = fs.findIndex(f => f.name === `medicine.${index}.name`);
                                if (idx !== -1) setActiveFieldIndex(idx);
                              }}
                              className="bg-white dark:bg-gray-900 pr-10"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              {/* Mic button removed */}
                            </div>
                          </div>
                          <div className="flex gap-4 justify-end">
                            {!medicine.showAlias && !medicine.alias && (
                              <button
                                onClick={() => updateMedicine(index, "showAlias", true)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                              >
                                + Add Alias
                              </button>
                            )}
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={medicine.isExternal || false}
                                onChange={(e) => updateMedicine(index, "isExternal", e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-[10px] font-medium text-gray-600 bg-blue-50 px-1.5 py-0.5 rounded">External</span>
                            </label>
                          </div>
                        </div>

                        {(medicine.showAlias || medicine.alias) && (
                          <div className="w-1/3 animate-in fade-in slide-in-from-right-4 duration-200 relative">
                            <Input
                              ref={(el) => (medicineRefs.current[`${index}.alias`] = el)}
                              placeholder="Alias (e.g. Fever Pill)"
                              value={medicine.alias}
                              onChange={(e) => updateMedicine(index, "alias", e.target.value)}
                              onFocus={() => {
                                const fs = getFieldOrder();
                                const idx = fs.findIndex(f => f.name === `medicine.${index}.alias`);
                                if (idx !== -1) setActiveFieldIndex(idx);
                              }}
                              className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 focus:border-blue-400 pr-10"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              {/* Mic button removed */}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                      onClick={() => removeMedicine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Row 2: Dosage, Frequency, Duration */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Dosage</label>
                      <div className="relative">
                        <Input
                          ref={(el) => (medicineRefs.current[`${index}.dosage`] = el)}
                          placeholder="500mg"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                          onFocus={() => {
                            const fs = getFieldOrder();
                            const idx = fs.findIndex(f => f.name === `medicine.${index}.dosage`);
                            if (idx !== -1) setActiveFieldIndex(idx);
                          }}
                          className="bg-white dark:bg-gray-900 pr-10"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {/* Mic button removed */}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Frequency</label>
                      <Input
                        ref={(el) => (medicineRefs.current[`${index}.frequency`] = el)}
                        placeholder="1-0-1"
                        value={medicine.frequency}
                        onFocus={() => {
                          const fs = getFieldOrder();
                          const idx = fs.findIndex(f => f.name === `medicine.${index}.frequency`);
                          if (idx !== -1) setActiveFieldIndex(idx);
                        }}
                        onChange={(e) => {
                          let val = e.target.value;
                          // Auto-format 3 digits to X-X-X
                          if (val.length === 3 && /^\d{3}$/.test(val)) {
                            val = `${val[0]}-${val[1]}-${val[2]}`;
                          }
                          updateMedicine(index, "frequency", val);
                        }}
                        className="bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Duration</label>
                      <div className="relative">
                        <Input
                          ref={(el) => (medicineRefs.current[`${index}.duration`] = el)}
                          placeholder="5 days"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                          onFocus={() => {
                            const fs = getFieldOrder();
                            const idx = fs.findIndex(f => f.name === `medicine.${index}.duration`);
                            if (idx !== -1) setActiveFieldIndex(idx);
                          }}
                          className="bg-white dark:bg-gray-900 pr-10"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {/* Mic button removed */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Advice</label>
              <div className="relative">
                <Input
                  ref={adviceRef}
                  placeholder="e.g. Drink plenty of water"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  onFocus={() => {
                    const fs = getFieldOrder();
                    const idx = fs.findIndex(f => f.name === 'advice');
                    if (idx !== -1) setActiveFieldIndex(idx);
                  }}
                  className="pr-10"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {/* Mic button removed */}
                </div>
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
          date={diagnosisDate ? new Date(diagnosisDate).toLocaleDateString("en-GB") : currentDate}
          patientContact={patient.contact}
        />
      </div>

      <DraggableMicButton
        isListening={isListening}
        toggleListening={() => isListening ? stopListening() : startListening()}
      />
    </div>
  );
};
