import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EducatorDashboardClient from "./client-page";

export default async function EducatorDashboard() {
  const session = await getSession();

  if (!session || session.role !== "EDUCATOR") {
    if (session?.role === "ADMIN") redirect("/admin");
    redirect("/login");
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const studentsRaw = await db.student.findMany({
    include: {
      monthlyScores: {
        where: { month: currentMonth, year: currentYear }
      }
    }
  });

  const students = studentsRaw.map((s: any) => {
    const match = s.name.match(/\(([^)]+)\)$/);
    const className = match ? match[1] : "Boshqa";
    const cleanName = s.name.replace(/\s*\([^)]+\)$/, "").trim();

    return {
      id: s.id,
      studentId: s.studentId,
      name: cleanName,
      className: className,
      gender: s.gender,
      score: s.monthlyScores[0]?.score ?? 100
    };
  });

  return (
    <EducatorDashboardClient students={students} sessionName={session.name} />
  );
}
