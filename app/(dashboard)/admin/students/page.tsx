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
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const educators = await db.user.findMany({
    where: { role: "EDUCATOR" }
  });

  const logs = await db.scoreLog.findMany({
    include: {
      category: true,
      educator: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedLogs = logs.map(log => ({
    id: log.id,
    studentId: log.studentId,
    amount: log.pointsDeducted,
    category: log.category?.name || "Noma'lum kategoriya",
    comment: log.comment,
    date: log.createdAt.toLocaleString('uz-UZ', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    }),
    educator: log.educator.name,
  }));

  return (
    <AdminStudentsClient 
      initialStudents={JSON.parse(JSON.stringify(students))} 
      educators={JSON.parse(JSON.stringify(educators))} 
      initialLogs={formattedLogs}
    />
  );
}
