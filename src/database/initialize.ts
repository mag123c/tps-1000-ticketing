import { PrismaClient } from 'generated/prisma';

export async function initializeUser(prisma: PrismaClient) {
  if (await prisma.userModel.findFirst({})) {
    return;
  }

  const recursive = 10000;

  for (let i = 0; i < recursive / 100; i++) {
    const users: { email: string; name?: string }[] = [];

    for (let j = 0; j < recursive / 100; j++) {
      const idx = i * 100 + j + 1;
      users.push({
        email: `test$${idx}@test.com`,
        name: `test${idx}`,
      });
    }

    await prisma.userModel.createMany({
      data: users,
      skipDuplicates: true,
    });
  }
}
