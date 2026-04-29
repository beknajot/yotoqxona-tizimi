import 'dotenv/config';
import { db } from "../lib/db";

const studentsData = [
  { name: "Shuxratjonov Isfandiyor", class: "5-B" },
  { name: "Muhammadjonov Muhammaddiyor", class: "5-A" },
  { name: "Jumaboyev Imron", class: "5-A" },
  { name: "Valiyev Abdulloh", class: "4-A" },
  { name: "Hakimjonov Lazizbek", class: "5-B" },
  { name: "Baxtiyorov Abdulvoris", class: "5-B" },
  { name: "Aliyev Kamron", class: "5-B" },
  { name: "Gulomov Jasur", class: "5-B" },
  { name: "Oybekov Odilbek", class: "5-B" },
  { name: "Yigitaliyev Abdulloh", class: "5-A" },
  { name: "Akromov Axadjon", class: "6-A" },
  { name: "Alimxonov Iskandarxon", class: "6-A" },
  { name: "Akbaraliyev Abdurauf", class: "6-B" },
  { name: "To'lonov Abbos", class: "6-A" },
  { name: "Marufjonov Islom", class: "6-B" },
  { name: "Abdupattoyev Mustafo", class: "6-A" },
  { name: "To'lonov Abdulaziz", class: "6-A" },
  { name: "Valijonov Muhammadvali", class: "6-B" },
  { name: "Mamurov Abdurashid", class: "6-A" },
  { name: "Olimov Elbekjon", class: "7-B" },
  { name: "Turgunov Farruxbek", class: "7-B" },
  { name: "Maxsutaliyev Kamron", class: "7-B" },
  { name: "Saidov Husanjon", class: "7-B" },
  { name: "To'rakulov Ismoiljon", class: "8-A" },
  { name: "To'lonov Abdulatif", class: "8-A" },
  { name: "Abdumannobov Zohirullo", class: "8-B" },
  { name: "Abdurasulov Abdulloh", class: "9-B" },
  { name: "Orifjonov Dilyorbek", class: "9-B" },
  { name: "Jaloldinov Abdulbosit", class: "9-B" },
  { name: "Maqsudov Rahmatullo", class: "9-A" },
  { name: "Xaliljonov Rustambek", class: "10-A" },
  { name: "Mamatqodirov Abdurauf", class: "10-B" },
  { name: "Isomiddinov Begzod", class: "10-A" },
  { name: "Anvarov Alimardon", class: "10-B" },
  { name: "Abdurahmonov Umidjon", class: "10-A" },
  { name: "Islomiddinov Muhammadyusuf", class: "11-A" },
  { name: "Akbaraliyev Muhammadislom", class: "11-A" },
  { name: "Usmonov Odilbek", class: "11-B" },
  { name: "Akbaraliyev Abduxalil", class: "11-A" },
  { name: "Nomonov Nurmuhammad", class: "11-B" },
  { name: "Jaloliddinov Muhammadjon", class: "11-B" },
  { name: "Murodilov Jasur", class: "11-B" }
];

async function main() {
  console.log("Joriy o'quvchilarni o'chirish...");
  await db.student.deleteMany({});
  console.log("O'quvchilar o'chirildi.");

  console.log("Yangi o'quvchilarni qo'shish...");
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const studentId = `ST${String(i + 1).padStart(3, '0')}`; // ST001, ST002...
    
    // O'quvchini ismi yonida sinfini ham saqlaymiz yoki ismiga qo'shib qo'yamiz
    // Baza skemasida 'class' maydoni yo'q, shuning uchun ismining oxiriga sinfini qo'shamiz
    const fullName = `${s.name} (${s.class})`;

    await db.student.create({
      data: {
        name: fullName,
        studentId: studentId,
        gender: "MALE", // Barchasi o'g'il bolalar ekan
        monthlyScores: {
          create: {
            month: currentMonth,
            year: currentYear,
            score: 100
          }
        }
      }
    });
  }

  console.log("Barcha 42 nafar o'quvchi bazaga muvaffaqiyatli qo'shildi!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    //
  });
