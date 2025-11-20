import { pgTable, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  doctorId: varchar("doctor_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  contact: varchar("contact", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// prescriptions table: medicines saved as JSON text
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  doctorId: varchar("doctor_id", { length: 255 }).notNull(),
  patientId: integer("patient_id").notNull(),
  diagnosis: text("diagnosis"),
  medicines: text("medicines").notNull(), // JSON string of medicines
  advice: text("advice"),
  followUpDate: timestamp("follow_up_date"),
  severity: text("severity"), // mild, moderate, severe
  visitType: text("visit_type"), // first, follow-up
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Clerk user ID
  name: text("name").notNull(),
  qualifications: text("qualifications"),
  registrationNumber: text("registration_number"),
  clinicName: text("clinic_name"),
  clinicAddress: text("clinic_address"),
  clinicPhone: text("clinic_phone"),
  logoUrl: text("logo_url"), // Base64 or URL
  signatureUrl: text("signature_url"), // Base64 or URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
