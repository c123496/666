import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('开始初始化数据库...');

  // 从环境变量读取管理员密码，如果没有则生成随机密码
  const adminEmail = 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(-12);

  // 哈希密码
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'admin',
        profile: {
          create: {
            nickname: 'Admin',
            points: 0,
          },
        },
      },
    });
    console.log('✓ 创建默认管理员账号');
    console.log(`  邮箱: ${adminEmail}`);
    console.log(`  密码: ${adminPassword}`);
    console.log('  ⚠️  请立即登录并修改密码！');
  } else {
    console.log('✓ 管理员账号已存在');
  }

  console.log('\n数据库初始化完成！');
}

seed()
  .then(() => {
    console.log('成功退出');
    process.exit(0);
  })
  .catch((err) => {
    console.error('初始化失败:', err);
    process.exit(1);
  });
