"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Eye, Plus, Search, Calendar, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getPrescriptions, deletePrescription } from "@/app/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrescriptionPreview } from "@/components/prescription/PrescriptionPreview";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const router = useRouter();
  const previewRef = useRef(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    const data = await getPrescriptions();
    setPrescriptions(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this prescription?")) {
      const result = await deletePrescription(id);
      if (result.success) {
        fetchPrescriptions();
      } else {
        alert("Failed to delete prescription");
      }
    }
  };

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setIsViewOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = (p.patientName && p.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.diagnosis && p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMedicine = medicineSearchTerm === "" || 
                            (p.medicines && p.medicines.some(m => m.name.toLowerCase().includes(medicineSearchTerm.toLowerCase())));
    
    let matchesDate = true;
    if (startDate && endDate) {
      const pDate = new Date(p.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      matchesDate = pDate >= start && pDate <= end;
    } else if (startDate) {
      const pDate = new Date(p.createdAt);
      const start = new Date(startDate);
      matchesDate = pDate >= start;
    } else if (endDate) {
      const pDate = new Date(p.createdAt);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = pDate <= end;
    }

    return matchesSearch && matchesMedicine && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions.</p>
        </div>
        <Link href="/dashboard/create-prescription">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> New Prescription
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="mb-4">Filter Prescriptions</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Patient or Diagnosis..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Pill className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Medicine Name..."
                className="pl-8"
                value={medicineSearchTerm}
                onChange={(e) => setMedicineSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-8"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-8"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading prescriptions...</div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No prescriptions found matching your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{p.patientName || "Unknown"}</TableCell>
                    <TableCell>{p.diagnosis}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(p)}>
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <PrescriptionPreview
              ref={previewRef}
              patient={{
                name: selectedPrescription.patientName,
                age: selectedPrescription.patientAge,
                gender: selectedPrescription.patientGender
              }}
              diagnosis={selectedPrescription.diagnosis}
              medicines={selectedPrescription.medicines}
              advice={selectedPrescription.advice}
              date={new Date(selectedPrescription.createdAt).toLocaleDateString()}
              showDownloadButton={true}
              patientContact={selectedPrescription.patientContact}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
