import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}