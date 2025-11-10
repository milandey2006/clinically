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
  medicines: text("medicines").$type("text"), // store JSON string
  advice: text("advice"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
