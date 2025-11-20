"use server";

import { db } from "@/db/drizzle";
import { patients, prescriptions, doctorProfiles } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// Helper to get authenticated doctor ID
async function getDoctorId() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

// --- PATIENTS ---

export async function addPatient(formData) {
  try {
    const doctorId = await getDoctorId();
    const name = formData.get("name");
    const age = formData.get("age") ? parseInt(formData.get("age")) : null;
    const gender = formData.get("gender");
    const contact = formData.get("contact");

    await db.insert(patients).values({
      name,
      age,
      gender,
      contact,
      doctorId,
    });
    
    revalidatePath("/dashboard/patients");
    revalidatePath("/dashboard/create-prescription");
    return { success: true, message: "Patient added successfully" };
  } catch (error) {
    console.error("Error adding patient:", error);
    return { success: false, message: "Failed to add patient" };
  }
}

export async function getPatients() {
  try {
    const doctorId = await getDoctorId();
    const allPatients = await db.select()
      .from(patients)
      .where(eq(patients.doctorId, doctorId))
      .orderBy(desc(patients.createdAt));
    return allPatients;
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export async function updatePatient(id, formData) {
  try {
    const doctorId = await getDoctorId();
    const name = formData.get("name");
    const age = formData.get("age") ? parseInt(formData.get("age")) : null;
    const gender = formData.get("gender");
    const contact = formData.get("contact");

    await db.update(patients)
      .set({ name, age, gender, contact })
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)));

    revalidatePath("/dashboard/patients");
    return { success: true, message: "Patient updated successfully" };
  } catch (error) {
    console.error("Error updating patient:", error);
    return { success: false, message: "Failed to update patient" };
  }
}

export async function deletePatient(id) {
  try {
    const doctorId = await getDoctorId();
    await db.delete(patients)
      .where(and(eq(patients.id, id), eq(patients.doctorId, doctorId)));

    revalidatePath("/dashboard/patients");
    return { success: true, message: "Patient deleted successfully" };
  } catch (error) {
    console.error("Error deleting patient:", error);
    return { success: false, message: "Failed to delete patient" };
  }
}

// --- PRESCRIPTIONS ---

export async function createPrescription(data) {
  try {
    const doctorId = await getDoctorId();
    const { patientId, diagnosis, medicines, advice, severity, visitType, followUpDate } = data;

    await db.insert(prescriptions).values({
      doctorId,
      patientId: parseInt(patientId),
      diagnosis,
      medicines: JSON.stringify(medicines),
      advice,
      severity,
      visitType,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    });

    revalidatePath("/dashboard/prescriptions");
    return { success: true, message: "Prescription saved successfully" };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { success: false, message: "Failed to save prescription" };
  }
}

export async function getPrescriptions() {
  try {
    const doctorId = await getDoctorId();
    // Join with patients to get patient name
    const allPrescriptions = await db.select({
      id: prescriptions.id,
      diagnosis: prescriptions.diagnosis,
      medicines: prescriptions.medicines,
      advice: prescriptions.advice,
      severity: prescriptions.severity,
      visitType: prescriptions.visitType,
      followUpDate: prescriptions.followUpDate,
      createdAt: prescriptions.createdAt,
      patientName: patients.name,
      patientId: patients.id,
      patientAge: patients.age,
      patientGender: patients.gender,
      patientContact: patients.contact,
    })
    .from(prescriptions)
    .leftJoin(patients, eq(prescriptions.patientId, patients.id))
    .where(eq(prescriptions.doctorId, doctorId))
    .orderBy(desc(prescriptions.createdAt));
    
    return allPrescriptions.map(p => ({
      ...p,
      medicines: JSON.parse(p.medicines || "[]")
    }));
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }
}

export async function getPrescriptionById(id) {
  try {
    const doctorId = await getDoctorId();
    const prescription = await db.select()
      .from(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.doctorId, doctorId)))
      .limit(1);
    
    if (prescription.length === 0) return null;
    
    // Parse medicines JSON
    return {
      ...prescription[0],
      medicines: JSON.parse(prescription[0].medicines),
    };
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return null;
  }
}

export async function updatePrescription(id, data) {
  try {
    const doctorId = await getDoctorId();
    const { diagnosis, medicines, advice, severity, visitType, followUpDate } = data;

    await db.update(prescriptions)
      .set({
        diagnosis,
        medicines: JSON.stringify(medicines),
        advice,
        severity,
        visitType,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      })
      .where(and(eq(prescriptions.id, id), eq(prescriptions.doctorId, doctorId)));

    revalidatePath("/dashboard/prescriptions");
    return { success: true, message: "Prescription updated successfully" };
  } catch (error) {
    console.error("Error updating prescription:", error);
    return { success: false, message: "Failed to update prescription" };
  }
}

export async function deletePrescription(id) {
  try {
    const doctorId = await getDoctorId();
    await db.delete(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.doctorId, doctorId)));

    revalidatePath("/dashboard/prescriptions");
    return { success: true, message: "Prescription deleted successfully" };
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return { success: false, message: "Failed to delete prescription" };
  }
}

// --- DOCTOR PROFILE ---

export async function getDoctorProfile() {
  try {
    const userId = await getDoctorId();
    const profile = await db.select()
      .from(doctorProfiles)
      .where(eq(doctorProfiles.userId, userId))
      .limit(1);
    
    return profile.length > 0 ? profile[0] : null;
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return null;
  }
}

export async function updateDoctorProfile(data) {
  try {
    const userId = await getDoctorId();
    
    // Check if profile exists
    const existing = await db.select()
      .from(doctorProfiles)
      .where(eq(doctorProfiles.userId, userId))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing profile
      await db.update(doctorProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(doctorProfiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(doctorProfiles).values({
        userId,
        ...data,
      });
    }
    
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/create-prescription");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
