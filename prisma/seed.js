const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const subjectsWithColors = [
    { name: "Arte", color: "#FF5733" }, // red-orange
    { name: "Italiano", color: "#33C1FF" }, // sky blue
    { name: "Fisica", color: "#33FF57" }, // green
    { name: "Inglese", color: "#FF33A6" }, // pink
    { name: "Storia", color: "#FFC300" }, // yellow
    { name: "Filosofia", color: "#8E44AD" }, // purple
    { name: "Scienze", color: "#1ABC9C" }, // turquoise
    { name: "Informatica", color: "#34495E" }, // dark blue-gray
    { name: "Matematica", color: "#E67E22" }, // orange
    { name: "EduCivica", color: "#2ECC71" }, // greenish
  ];

  for (const { name, color } of subjectsWithColors) {
    await prisma.subject.upsert({
      where: { name },
      update: { color },
      create: { name, color },
    });
  }

  console.log("Subjects populated with colors!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
