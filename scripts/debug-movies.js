const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.movie.findMany({
    where: { title: { contains: "VDF" } },
    include: { parts: true }
  });
  console.log(JSON.stringify(movies, null, 2));

  const YaiskulMovies = await prisma.movie.findMany({
    where: { title: { contains: "Yaiskul" } },
    include: { parts: true }
  });
  console.log(JSON.stringify(YaiskulMovies, null, 2));

  await prisma.$disconnect();
}
main();
