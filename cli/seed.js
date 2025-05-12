const { PrismaClient } = require('@prisma/client');
const { genSaltSync, hashSync } = require('bcryptjs');

const bootstrap = async () => {
  await prisma.role.createMany({
    data: [
      { name: 'super_admin' },
      { name: 'admin' },
      { name: 'user' },
    ],
    skipDuplicates: true,
  });
  console.log("Роли созданы")
};

bootstrap()
  .then(() => console.log('Seed done!'))
  .catch((e) => console.error(e));
