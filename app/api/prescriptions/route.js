import { db } from "@/db/drizzle";
import { prescriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const doctorId = process.env.DEFAULT_DOCTOR_ID;

  const rows = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.doctorId, doctorId));

  return new Response(JSON.stringify(rows), { status: 200 });
}
