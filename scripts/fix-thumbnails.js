const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.movie.update({
    where: { id: "c9c4fa56-7cc3-48a3-8cf3-ab8ec9d15e29" },
    data: { thumbnail: "https://img.youtube.com/vi/PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP/hqdefault.jpg" }
  });
  console.log("Updated VDF Thasana thumbnail");

  await prisma.movie.update({
    where: { id: "28ce42f0-3c79-47de-a0b8-81f3649388d5" },
    data: { thumbnail: "https://img.youtube.com/vi/OJClkrA2bwI/hqdefault.jpg" }
  });
  console.log("Updated Yaiskul Pakhang Angouba thumbnail");

  await prisma.$disconnect();
}
main();
