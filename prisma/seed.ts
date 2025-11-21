import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Add your friends' names here
  const friends = [
    "Sal",
    "Jacob",
    "Tuush",
    "Davi",
    "Ani",
    "Jonny",
    "Elliot",
    "Henry",
    "Jake",
    "Tom",
    "Khaled",
  ];

  console.log("Seeding database with friends...");

  for (const name of friends) {
    await prisma.user.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`✓ Added ${name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
