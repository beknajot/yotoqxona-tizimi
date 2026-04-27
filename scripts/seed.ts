require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ 
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  await db.scoreLog.deleteMany();
  await db.monthlyScore.deleteMany();
  await db.studentUser.deleteMany();
  await db.student.deleteMany();
  await db.user.deleteMany();
  await db.category.deleteMany();

  const CATEGORIES = [
    { id: "cat1", name: "Nazarda tutilmagan intizom buzilishi", minPoints: 1, maxPoints: 50, order: 1 },
    { id: "cat2", name: "Yotoqxonadan vaqtincha ketish haqida ogohlantirmaslik", minPoints: 30, maxPoints: 30, order: 2 },
    { id: "cat3", name: "Yotoqxona va maktab hududidan beso'roq chiqish", minPoints: 30, maxPoints: 30, order: 3 },
    { id: "cat4", name: "Yotoqxonaga beso'roq kirish", minPoints: 10, maxPoints: 10, order: 4 },
    { id: "cat5", name: "O'g'rilik qilish", minPoints: 60, maxPoints: 60, order: 5 },
    { id: "cat6", name: "Mushtlashish", minPoints: 50, maxPoints: 50, order: 6 },
    { id: "cat7", name: "Haqorat qilish, jargon so'zlarni ishlatish, so'kinish", minPoints: 15, maxPoints: 15, order: 7 },
    { id: "cat8", name: "Tartibsizlik uchun", minPoints: 15, maxPoints: 15, order: 8 },
    { id: "cat9", name: "Yotoqxonaga ta'qiqlangan narsa (yegulik, gadjet)lar olib kirish", minPoints: 15, maxPoints: 15, order: 9 },
    { id: "cat10", name: "Yolg'on gapirish", minPoints: 15, maxPoints: 15, order: 10 },
    { id: "cat11", name: "Belgilanmagan xonada yotish", minPoints: 15, maxPoints: 15, order: 11 },
    { id: "cat12", name: "Yotoqxona binosiga va mulkiga zarar yetkazish", minPoints: 5, maxPoints: 40, order: 12 },
    { id: "cat13", name: "Maktab binosiga va mulkiga zarar yetkazish", minPoints: 5, maxPoints: 40, order: 13 },
    { id: "cat14", name: "Maktab foyesida va sinf xonalarida sport va gadjet o'yinlarini o'ynash", minPoints: 10, maxPoints: 10, order: 14 },
    { id: "cat15", name: "Maktabga ta'qiqlangan yegulik olib kirish", minPoints: 15, maxPoints: 15, order: 15 },
    { id: "cat16", name: "Belgilanmagan vaqtda gadjetlardan foydalanish", minPoints: 15, maxPoints: 15, order: 16 },
    { id: "cat17", name: "Belgilangan vaqtda sababsiz uhlamaslik va uyg'onmaslik", minPoints: 10, maxPoints: 10, order: 17 },
    { id: "cat18", name: "Navbatchilikni sababsiz o'z vaqtida qilmaslik", minPoints: 10, maxPoints: 10, order: 18 },
  ];

  for (const cat of CATEGORIES) {
    await db.category.create({ data: cat });
  }
  console.log('✅ 18 ta kategoriya qo\'shildi');

  const hashedPassword = await bcrypt.hash('123456', 10);

  await db.user.create({
    data: { id: 'admin1', name: 'Administrator', login: 'admin', password: hashedPassword, role: 'ADMIN', gender: null }
  });
  console.log('✅ Admin qo\'shildi (login: admin, parol: 123456)');

  const maleEd1 = await db.user.create({
    data: { id: 'ed_m1', name: 'Rustam aka', login: 'rustam', password: hashedPassword, role: 'EDUCATOR', gender: 'MALE' }
  });
  const maleEd2 = await db.user.create({
    data: { id: 'ed_m2', name: 'Suhrob aka', login: 'suhrob', password: hashedPassword, role: 'EDUCATOR', gender: 'MALE' }
  });
  const femaleEd1 = await db.user.create({
    data: { id: 'ed_f1', name: 'Nargiza opa', login: 'nargiza', password: hashedPassword, role: 'EDUCATOR', gender: 'FEMALE' }
  });
  const femaleEd2 = await db.user.create({
    data: { id: 'ed_f2', name: 'Malika opa', login: 'malika', password: hashedPassword, role: 'EDUCATOR', gender: 'FEMALE' }
  });
  console.log('✅ 4 ta tarbiyachi qo\'shildi (parol: 123456)');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const studentsData = [
    { name: 'Ali Valiyev', studentId: 'ST001', gender: 'MALE', educatorId: maleEd1.id },
    { name: 'Hasanboy Sobirov', studentId: 'ST002', gender: 'MALE', educatorId: maleEd1.id },
    { name: 'Javohir Qodirov', studentId: 'ST003', gender: 'MALE', educatorId: maleEd2.id },
    { name: 'Otabek Tursunov', studentId: 'ST004', gender: 'MALE', educatorId: maleEd2.id },
    { name: 'Ravshan Meliqo\'ziyev', studentId: 'ST005', gender: 'MALE', educatorId: maleEd1.id },
    { name: 'Dilnoza Karimova', studentId: 'ST006', gender: 'FEMALE', educatorId: femaleEd1.id },
    { name: 'Sevinch Rahmatova', studentId: 'ST007', gender: 'FEMALE', educatorId: femaleEd1.id },
    { name: 'Madina Umarova', studentId: 'ST008', gender: 'FEMALE', educatorId: femaleEd2.id },
  ];

  for (const st of studentsData) {
    const student = await db.student.create({ data: st });
    await db.monthlyScore.create({
      data: {
        studentId: student.id,
        month: currentMonth,
        year: currentYear,
        score: 100,
      },
    });
  }
  console.log(`✅ ${studentsData.length} ta o'quvchi qo'shildi`);

  console.log('\n🎉 Ma\'lumotlar bazasi to\'ldirildi!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
