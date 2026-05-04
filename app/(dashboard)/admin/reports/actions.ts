"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function revertScoreAction(logId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Sizda ushbu amalni bajarish uchun ruxsat yo'q");
  }

  // 1. Logni topamiz
  const log = await db.scoreLog.findUnique({
    where: { id: logId }
  });

  if (!log) {
    throw new Error("Log topilmadi");
  }

  // Log qaysi oyda bo'lganini aniqlaymiz
  // Yangi ScoreLog'larda month/year bor, eskisida yo'q — fallback joriy oy
  const logMonth = log.month;
  const logYear = log.year;

  // 2. Tranzaksiya orqali ballni qaytaramiz va logni o'chiramiz
  await db.$transaction(async (tx) => {
    // Log tegishli oyning MonthlyScore'ini topamiz
    const monthlyScore = await tx.monthlyScore.findUnique({
      where: {
        studentId_month_year: {
          studentId: log.studentId,
          month: logMonth,
          year: logYear
        }
      }
    });

    if (monthlyScore) {
      // Ball 100 dan oshib ketmasligi uchun cheklov
      const newScore = Math.min(100, monthlyScore.score + log.pointsDeducted);
      await tx.monthlyScore.update({
        where: { id: monthlyScore.id },
        data: { score: newScore }
      });
    } else {
      // MonthlyScore yo'q bo'lsa — yangi yaratamiz (100 - deducted + deducted = 100)
      await tx.monthlyScore.create({
        data: {
          studentId: log.studentId,
          month: logMonth,
          year: logYear,
          score: 100
        }
      });
    }

    // Logni o'chirish
    await tx.scoreLog.delete({
      where: { id: logId }
    });
  });

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function getMonthlyLogsAction(month: number, year: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Ruxsat yetishmaydi");
  }

  const logs = await db.scoreLog.findMany({
    where: { month, year },
    include: {
      student: true,
      category: true,
      educator: true
    },
    orderBy: { createdAt: "desc" }
  });

  return JSON.parse(JSON.stringify(logs));
}
