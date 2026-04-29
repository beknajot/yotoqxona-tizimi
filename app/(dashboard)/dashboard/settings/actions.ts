"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateProfilePasswordAction(currentPass: string, newPass: string) {
  const session = await getSession();
  if (!session) throw new Error("Avtorizatsiyadan o'tilmagan");

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const isMatch = await bcrypt.compare(currentPass, user.password);
  if (!isMatch) return { error: "Amaldagi parol noto'g'ri!" };

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await db.user.update({
    where: { id: session.id },
    data: { password: hashedPassword }
  });

  return { success: true };
}

export async function updateProfileLoginAction(currentPass: string, newLogin: string) {
  const session = await getSession();
  if (!session) throw new Error("Avtorizatsiyadan o'tilmagan");

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const isMatch = await bcrypt.compare(currentPass, user.password);
  if (!isMatch) return { error: "Amaldagi parol noto'g'ri!" };

  const existing = await db.user.findUnique({ where: { login: newLogin } });
  if (existing) return { error: "Bu login allaqachon band qilingan!" };

  await db.user.update({
    where: { id: session.id },
    data: { login: newLogin }
  });

  return { success: true };
}
