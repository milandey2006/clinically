"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getPatients, deletePatient } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const data = await getPatients();
    setPatients(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      const result = await deletePatient(id);
      if (result.success) {
        fetchPatients();
      } else {
        alert("Failed to delete patient");
      }
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.contact && patient.contact.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records.</p>
        </div>
        <Link href="/dashboard/add-patient">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Patients</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No patients found. Add your first patient!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.contact || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/add-patient?edit=${patient.id}`)}>
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(patient.id)}>
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
    </div>
  );
}
