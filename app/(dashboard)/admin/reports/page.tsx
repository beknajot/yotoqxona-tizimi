import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminReportsClient from "./client-page";

export default async function AdminReportsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Ma'lumotlarni parallel olish
  const [rankings, logs] = await Promise.all([
    db.student.findMany({
      include: {
        educator: true,
        monthlyScores: {
          where: { month: currentMonth, year: currentYear }
        }
      },
      orderBy: { name: 'asc' }
    }),
    db.scoreLog.findMany({
      include: {
        student: true,
        category: true,
        educator: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Oxirgi 100 ta
    })
  ]);

  return (
    <AdminReportsClient 
      rankings={JSON.parse(JSON.stringify(rankings))} 
      logs={JSON.parse(JSON.stringify(logs))} 
    />
  );
}
