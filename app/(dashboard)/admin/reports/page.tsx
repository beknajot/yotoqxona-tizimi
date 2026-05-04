import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminReportsClient from "./client-page";

export default async function AdminReportsPage({
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
  const selectedYear = params.year ? parseInt(params.year) : now.getFullYear();

  // Tizimda qaysi oy/yillarda log mavjudligini aniqlaymiz
  const allLogMonths = await db.scoreLog.groupBy({
    by: ["month", "year"],
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Joriy oy ham ro'yxatda bo'lsin
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const hasCurrentMonth = allLogMonths.some(
    (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1
  );

  const availableMonths = hasCurrentMonth
    ? allLogMonths
    : [{ month: now.getMonth() + 1, year: now.getFullYear() }, ...allLogMonths];

  // Ma'lumotlarni parallel olish — tanlangan oy uchun
  const [rankings, logs] = await Promise.all([
    db.student.findMany({
      include: {
        educator: true,
        monthlyScores: {
          where: { month: selectedMonth, year: selectedYear },
        },
      },
      orderBy: { name: "asc" },
    }),
    db.scoreLog.findMany({
      where: { month: selectedMonth, year: selectedYear },
      include: {
        student: true,
        category: true,
        educator: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminReportsClient
      rankings={JSON.parse(JSON.stringify(rankings))}
      logs={JSON.parse(JSON.stringify(logs))}
      availableMonths={JSON.parse(JSON.stringify(availableMonths))}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
    />
  );
}
