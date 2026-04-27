import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminStudentsClient from "./client-page";

export default async function AdminStudentsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const students = await db.student.findMany({
    include: {
      educator: true,
      monthlyScores: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const educators = await db.user.findMany({
    where: { role: "EDUCATOR" }
  });

  return (
    <AdminStudentsClient 
      initialStudents={JSON.parse(JSON.stringify(students))} 
      educators={JSON.parse(JSON.stringify(educators))} 
    />
  );
}
