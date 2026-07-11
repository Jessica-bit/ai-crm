import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_STAGES = ['Lead', 'Qualificação', 'Proposta', 'Fechado'];

async function main() {
  const passwordHash = await hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aicrm.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@aicrm.com',
      passwordHash,
    },
  });

  for (const [index, name] of DEFAULT_STAGES.entries()) {
    const existingStage = await prisma.stage.findFirst({
      where: { userId: admin.id, name },
    });

    if (existingStage) {
      continue;
    }

    await prisma.stage.create({
      data: {
        name,
        order: index,
        userId: admin.id,
      },
    });
  }

  console.log('Seed concluído:');
  console.log(`  - Usuário administrador: ${admin.email}`);
  console.log(`  - Estágios padrão: ${DEFAULT_STAGES.join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar o seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
