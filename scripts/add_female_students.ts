import 'dotenv/config';
import { db } from "../lib/db";

const femaleStudents = [
  { name: "Murodjonova Ominaxon Murodjon qizi", class: "4-A" },
  { name: "Mamadaliyeva Farzona Jahongir qizi", class: "5-A" },
  { name: "Asqarova Soliha Asrorjon qizi", class: "6-B" },
  { name: "Israilova Fotima Egamberdi qizi", class: "6-A" },
  { name: "Bahodirova Mubina Darxonjon qizi", class: "6-B" },
  { name: "Sahobiddinova Shoxruza Begzod qizi", class: "7-B" },
  { name: "Asqarova Nozima Asrorjon qizi", class: "8-B" },
  { name: "Jumaboyeva Rayyona Javlon qizi", class: "8-B" },
  { name: "Xamidullayeva Durdona Axmadillo qizi", class: "8-B" },
  { name: "Olimjonova Zaynabxon Bahodir qizi", class: "9-A" },
  { name: "Axmadjonova Rayyona Sultonbek qizi", class: "9-B" },
  { name: "Xayitboyeva Oyshaxon Xayrullojon qizi", class: "9-B" },
  { name: "Mirzakarimova Sarafroz Bahodir qizi", class: "10-B" },
  { name: "Narzullayeva Lola Furqat qizi", class: "10-B" },
  { name: "Ro‘zmatova Aminanur Abdulhamid qizi", class: "10-A" },
  { name: "Jaloliddinova Barnoxon Oybek qizi", class: "10-B" },
  { name: "Ibrohimjonova Dilafruz Abduvoxid qizi", class: "10-B" },
  { name: "Abduhalilova Bibisora Ma‘rufjon qizi", class: "11-B" },
  { name: "Fayziyeva Muslimaxon Abdumuxtor qizi", class: "11-A" },
  { name: "Erkinova Mubinaxon Mirzoxidjon qizi", class: "11-A" },
  { name: "Radjabova Muxlisa", class: "11-B" }
];

async function main() {
  console.log("Qiz o'quvchilarni qo'shish...");
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // STXXX id larni olish uchun eng oxirgi student ni topamiz
  const lastStudent = await db.student.findFirst({
    orderBy: { studentId: 'desc' },
  });

  let nextIdNum = 1;
  if (lastStudent && lastStudent.studentId.startsWith('ST')) {
    const numPart = parseInt(lastStudent.studentId.replace('ST', ''), 10);
    if (!isNaN(numPart)) {
      nextIdNum = numPart + 1;
    }
  }

  for (let i = 0; i < femaleStudents.length; i++) {
    const s = femaleStudents[i];
    const studentId = `ST${String(nextIdNum).padStart(3, '0')}`;
    nextIdNum++;
    
    const fullName = `${s.name} (${s.class})`;

    await db.student.create({
      data: {
        name: fullName,
        studentId: studentId,
        gender: "FEMALE",
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

  console.log(`${femaleStudents.length} nafar qiz o'quvchi bazaga muvaffaqiyatli qo'shildi!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
