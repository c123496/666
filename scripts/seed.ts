import { db } from '../src/db';
import { users, orders } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('开始初始化数据库...');

  // 从环境变量读取管理员密码，如果没有则生成随机密码
  const adminEmail = 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(-12);

  // 哈希密码
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!existingAdmin) {
    await db.insert(users).values({
      username: 'admin',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      status: 'active',
    });
    console.log('✓ 创建默认管理员账号');
    console.log(`  邮箱: ${adminEmail}`);
    console.log(`  密码: ${adminPassword}`);
    console.log('  ⚠️  请立即登录并修改密码！');
  } else {
    console.log('✓ 管理员账号已存在');
  }

  // 创建测试用户（使用哈希密码）
  const testUsers = [
    { username: 'zhangsan', email: 'zhangsan@example.com', password: 'password123' },
    { username: 'lisi', email: 'lisi@example.com', password: 'password123' },
    { username: 'wangwu', email: 'wangwu@example.com', password: 'password123' },
  ];

  for (const userData of testUsers) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, userData.email),
    });

    if (!existing) {
      const hashedTestPassword = await bcrypt.hash(userData.password, 10);
      await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedTestPassword,
        isAdmin: false,
        status: 'active',
      });
      console.log(`✓ 创建测试用户: ${userData.username}`);
    }
  }

  // 创建测试订单
  const allUsers = await db.query.users.findMany();

  if (allUsers.length > 0) {
    const testOrders = [
      { orderNo: 'ORD-2024-001', userId: allUsers[0].id, amount: '99.00', status: 'paid' },
      { orderNo: 'ORD-2024-002', userId: allUsers[1].id, amount: '199.00', status: 'pending' },
      { orderNo: 'ORD-2024-003', userId: allUsers[0].id, amount: '299.00', status: 'paid' },
      { orderNo: 'ORD-2024-004', userId: allUsers[2].id, amount: '99.00', status: 'cancelled' },
    ];

    for (const orderData of testOrders) {
      const existing = await db.query.orders.findFirst({
        where: eq(orders.orderNo, orderData.orderNo),
      });

      if (!existing) {
        await db.insert(orders).values(orderData);
        console.log(`✓ 创建测试订单: ${orderData.orderNo}`);
      }
    }
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
