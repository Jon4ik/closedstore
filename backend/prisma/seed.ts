import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Администратор' },
    update: {},
    create: {
      name: 'Администратор',
      description: 'Полный доступ ко всем функциям системы',
      permissions: ['view', 'create', 'edit', 'delete', 'import', 'export', 'add_comments', 'manage_users', 'manage_roles', 'manage_tus', 'view_audit', 'settings'],
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Менеджер' },
    update: {},
    create: {
      name: 'Менеджер',
      description: 'Управление объектами и импорт/экспорт',
      permissions: ['view', 'create', 'edit', 'import', 'export', 'add_comments'],
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'Наблюдатель' },
    update: {},
    create: {
      name: 'Наблюдатель',
      description: 'Только просмотр данных',
      permissions: ['view'],
      isSystem: true,
    },
  });

  console.log('✅ Roles created');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Администратор Системы',
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      password: managerPassword,
      fullName: 'Иванов И.И.',
      roleId: managerRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'viewer' },
    update: {},
    create: {
      username: 'viewer',
      password: viewerPassword,
      fullName: 'Петров П.П.',
      roleId: viewerRole.id,
    },
  });

  console.log('✅ Users created');

  // Create TUs
  const tus = [
    { fullName: 'Зотов Денис', position: 'Технический управляющий', phone: '+7 (999) 123-45-67', email: 'zotov@company.ru' },
    { fullName: 'Дрямова Валентина', position: 'Технический управляющий', phone: '+7 (999) 234-56-78', email: 'dryamova@company.ru' },
    { fullName: 'Беляева Анна', position: 'Технический управляющий', phone: '+7 (999) 345-67-89', email: 'belyaeva@company.ru' },
  ];

  for (const tu of tus) {
    await prisma.tU.upsert({
      where: { id: `tu-${tu.fullName.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `tu-${tu.fullName.replace(/\s/g, '-').toLowerCase()}`,
        ...tu,
      },
    });
  }

  console.log('✅ TUs created');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
