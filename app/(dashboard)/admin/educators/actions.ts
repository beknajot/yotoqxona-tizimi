"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Tarbiyachi qo'shish
export async function addEducatorAction(data: { name: string; login: string; password: string; gender: string }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await db.user.create({
    data: {
      name: data.name,
      login: data.login,
      password: hashedPassword,
      gender: data.gender,
      role: "EDUCATOR",
    }
  });

  revalidatePath("/admin/educators");
  return { success: true };
}

// Tarbiyachini o'chirish
export async function deleteEducatorAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  // O'quvchilarni yetim qoldirish (biriktirilmagan holga o'tkazish)
  await db.student.updateMany({
    where: { educatorId: id },
    data: { educatorId: null }
  });

  await db.user.delete({ where: { id } });

  revalidatePath("/admin/educators");
  return { success: true };
}

// Parolni o'zgartirish (Admin tomonidan)
export async function updateEducatorPasswordAction(id: string, newPassword: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  return { success: true };
}

// Tarbiyachini tahrirlash (Ism, Login, Gender)
export async function updateEducatorAction(id: string, data: { name: string; login: string; gender: string }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Ruxsat yo'q");

  await db.user.update({
    where: { id },
    data: {
      name: data.name,
      login: data.login,
      gender: data.gender,
    }
  });

  revalidatePath("/admin/educators");
  return { success: true };
}
