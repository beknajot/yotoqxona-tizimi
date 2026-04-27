import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientStudentsPage from "./client-page";

export default async function EducatorStudentsPage() {
  const session = await getSession();

  if (!session || session.role !== "EDUCATOR") {
    redirect("/login");
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // O'quvchilarni olish
  const studentsRaw = await db.student.findMany({
    where: { educatorId: session.id },
    include: {
      monthlyScores: {
        where: { month: currentMonth, year: currentYear }
      }
    }
  });

  const initialStudents = studentsRaw.map((s: any) => ({
    id: s.id, // Baza ID si (DeductModal va actions uchun kerak)
    studentId: s.studentId, // Ekranda ko'rsatiladigan ID (ST001)
    name: s.name,
    score: s.monthlyScores[0]?.score ?? 100
  }));

  // O'quvchilar tarixini olish (ScoreLogs)
  const logsRaw = await db.scoreLog.findMany({
    where: {
      student: { educatorId: session.id }
    },
    include: {
      category: true,
      educator: true
    },
    orderBy: { createdAt: "desc" }
  });

  const initialLogs = logsRaw.map((log: any) => ({
    id: log.id,
    studentId: log.studentId, // studentni topish uchun Baza ID
    amount: log.pointsDeducted,
    category: log.category.name,
    comment: log.comment,
    date: log.createdAt.toLocaleString('uz-UZ'),
    educator: log.educator.name
  }));

  return (
    <ClientStudentsPage 
      initialStudents={initialStudents} 
      initialLogs={initialLogs} 
    />
  );
}
