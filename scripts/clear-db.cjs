const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.passwordHistory.deleteMany();
  await prisma.user.deleteMany();
  console.log("All users deleted.");
  await prisma.$disconnect();
}
main();
