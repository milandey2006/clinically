import { db } from "@/db/drizzle";
import { patients } from "@/db/schema";

export async function GET(req) {
  // use default doctor id from env while auth is off
  const doctorId = process.env.DEFAULT_DOCTOR_ID;
  const rows = await db.select().from(patients).where(patients.doctorId.eq(doctorId));
  return new Response(JSON.stringify(rows), { status: 200 });
}
