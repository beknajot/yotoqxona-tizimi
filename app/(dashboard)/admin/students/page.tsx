import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminStudentsClient from "./client-page";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const now = new Date();
  const selectedMonth = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const selectedYear  = params.year  ? parseInt(params.year)  : now.getFullYear();

  // Tizimda qaysi oy/yillarda MonthlyScore yoki ScoreLog mavjudligini aniqlaymiz
  const [scoreMonths, logMonths] = await Promise.all([
    db.monthlyScore.groupBy({
      by: ["month", "year"],
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    db.scoreLog.groupBy({
      by: ["month", "year"],
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
  ]);

  // Ikkalasini birlashtirip, unikal oy/yillar ro'yxati
  const monthSet = new Map<string, { month: number; year: number }>();
  [...scoreMonths, ...logMonths].forEach((m) => {
    const key = `${m.year}-${m.month}`;
    if (!monthSet.has(key)) monthSet.set(key, { month: m.month, year: m.year });
  });

  // Joriy oy ham bo'lsin
  const currentKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  if (!monthSet.has(currentKey)) {
    monthSet.set(currentKey, { month: now.getMonth() + 1, year: now.getFullYear() });
  }

  const availableMonths = Array.from(monthSet.values()).sort(
    (a, b) => b.year - a.year || b.month - a.month
  );

  const [students, educators, logs] = await Promise.all([
    db.student.findMany({
      include: {
        educator: true,
        // Faqat tanlangan oyning bali
        monthlyScores: {
          where: { month: selectedMonth, year: selectedYear },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { role: "EDUCATOR" },
    }),
    // Faqat tanlangan oyning loglari
    db.scoreLog.findMany({
      where: { month: selectedMonth, year: selectedYear },
      include: {
        category: true,
        educator: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedLogs = logs.map((log) => ({
    id: log.id,
    studentId: log.studentId,
    amount: log.pointsDeducted,
    category: log.category?.name || "Noma'lum kategoriya",
    comment: log.comment,
    month: log.month,
    year: log.year,
    date: log.createdAt.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    educator: log.educator.name,
  }));

  return (
    <AdminStudentsClient
      initialStudents={JSON.parse(JSON.stringify(students))}
      educators={JSON.parse(JSON.stringify(educators))}
      initialLogs={formattedLogs}
      availableMonths={availableMonths}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
    />
  );
}
