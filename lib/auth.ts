"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Sessiyani cookie orqali saqlaymiz (production uchun JWT ishlatish tavsiya etiladi)
export async function loginAction(login: string, password: string) {
  // Avval Admin/Educator dan qidiramiz
  const user = await db.user.findUnique({ where: { login } });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { error: "Login yoki parol noto'g'ri!" };

    const cookieStore = await cookies();
    cookieStore.set("session_user", JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
      gender: user.gender,
    }), { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 }); // 7 kun

    return { success: true, role: user.role };
  }

  // Keyin Student dan qidiramiz
  const studentUser = await db.studentUser.findUnique({
    where: { login },
    include: { student: true },
  });

  if (studentUser) {
    const isMatch = await bcrypt.compare(password, studentUser.password);
    if (!isMatch) return { error: "Login yoki parol noto'g'ri!" };

    const cookieStore = await cookies();
    cookieStore.set("session_user", JSON.stringify({
      id: studentUser.id,
      name: studentUser.student.name,
      role: "STUDENT",
      studentDbId: studentUser.studentId,
    }), { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });

    return { success: true, role: "STUDENT" };
  }

  return { error: "Login yoki parol noto'g'ri!" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user");
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session_user")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; name: string; role: string; gender?: string; studentDbId?: string };
  } catch {
    return null;
  }
}
