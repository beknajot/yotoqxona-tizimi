import { redirect } from "next/navigation";

export default function Home() {
  // Asosiy sahifaga kirganda to'g'ridan-to'g'ri login sahifasiga yo'naltiramiz
  redirect("/login");
}
