import { db } from "@/db/drizzle";
import { prescriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req, { params }) {
  const { patientId } = params;
  const doctorId = process.env.DEFAULT_DOCTOR_ID;

  const rows = await db
    .select()
    .from(prescriptions)
    .where(
      and(
        eq(prescriptions.doctorId, doctorId),
        eq(prescriptions.patientId, parseInt(patientId))
      )
    );

  return new Response(JSON.stringify(rows), { status: 200 });
}
