import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./client-page";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SettingsClient user={session} />
  );
}
