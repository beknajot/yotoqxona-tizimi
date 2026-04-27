import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminEducatorsClient from "./client-page";

export default async function AdminEducatorsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const educators = await db.user.findMany({
    where: { role: "EDUCATOR" },
    include: {
      _count: {
        select: { students: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminEducatorsClient 
      initialEducators={JSON.parse(JSON.stringify(educators))} 
    />
  );
}
