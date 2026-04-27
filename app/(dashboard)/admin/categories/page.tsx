import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminCategoriesClient from "./client-page";

export default async function AdminCategoriesPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const categories = await db.category.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <AdminCategoriesClient 
      initialCategories={JSON.parse(JSON.stringify(categories))} 
    />
  );
}
