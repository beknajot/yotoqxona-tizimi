"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deductPoints(studentId: string, amount: number, categoryName: string, comment: string) {
  const session = await getSession();
  if (!session || session.role !== "EDUCATOR") {
    throw new Error("Ruxsat yetishmaydi");
  }

  // Kategoriyani izlash
  let category = await db.category.findFirst({
    where: { name: categoryName }
  });

  if (!category) {
    throw new Error("Kategoriya topilmadi");
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // 1. Oylik ballni yangilash yoki yaratish
  const monthlyScore = await db.monthlyScore.upsert({
    where: {
      studentId_month_year: {
        studentId,
        month: currentMonth,
        year: currentYear
      }
    },
    update: {
      score: { decrement: amount }
    },
    create: {
      studentId,
      month: currentMonth,
      year: currentYear,
      score: 100 - amount
    }
  });

  // 2. ScoreLog yozish (qaysi oyda ayirilganligi ham saqlanadi)
  await db.scoreLog.create({
    data: {
      studentId,
      educatorId: session.id,
      categoryId: category.id,
      pointsDeducted: amount,
      comment,
      month: currentMonth,
      year: currentYear
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");

  return { success: true };
}
