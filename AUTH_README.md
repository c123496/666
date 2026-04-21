# 用户认证系统使用说明

## ✅ 已完成的功能

### 1. 数据库Schema更新
- 已更新 `users` 表，添加了 `username` 字段（唯一）
- `password` 字段改为必填
- 生成迁移文件：`drizzle/0000_true_doctor_octopus.sql`

### 2. API路由
- ✅ `/api/auth/register` - 用户注册
- ✅ `/api/auth/login` - 用户登录
- ✅ `/api/auth/logout` - 用户登出
- ✅ `/api/auth/me` - 获取当前用户信息

### 3. 页面
- ✅ `/register` - 注册页面
- ✅ `/login` - 登录页面

## 📋 需要手动执行的步骤

### 1. 执行数据库迁移

**方法1：使用Drizzle Push（推荐）**
```bash
cd d:\图片\虚拟男友\projects
npx drizzle-kit push
```

**方法2：直接执行SQL**
```bash
psql -h localhost -U user -d virtual_boyfriend -f drizzle/0000_true_doctor_octopus.sql
```

**方法3：使用数据库客户端工具**
- 打开你的PostgreSQL客户端（如pgAdmin、DataGrip等）
- 连接到数据库：`postgresql://user:password@localhost:5432/virtual_boyfriend`
- 执行 `drizzle/0000_true_doctor_octopus.sql` 中的SQL语句

### 2. 验证数据库表结构

执行以下SQL检查表是否创建成功：
```sql
\d users
```

应该看到：
- `username` varchar(50) NOT NULL UNIQUE
- `password` varchar(255) NOT NULL
- `name` varchar(100)
- `email` varchar(255)
- 其他字段...

## 🚀 使用说明

### 注册新用户
1. 访问 http://localhost:5000/register
2. 输入用户名（3-50个字符）
3. 输入密码（至少6个字符）
4. 点击"注册"按钮
5. 注册成功后自动跳转到首页

### 登录
1. 访问 http://localhost:5000/login
2. 输入用户名和密码
3. 点击"登录"按钮
4. 登录成功后跳转到首页

### 会话管理
- 使用HTTP Cookie存储用户会话
- `user_id` cookie（httpOnly）：用户ID
- `username` cookie：用户名
- 会话有效期：30天

## 🔐 安全特性

- ✅ 密码使用bcrypt哈希加密（salt rounds: 10）
- ✅ HTTP Only Cookie防止XSS攻击
- ✅ 生产环境启用Secure Cookie
- ✅ 用户状态检查（active/suspended/deleted）
- ✅ 前端输入验证
- ✅ SQL注入防护（使用Drizzle ORM）

## 📁 修改的文件

### 数据库
- `src/db/schema.ts` - 更新users表结构
- `drizzle/0000_true_doctor_octopus.sql` - 数据库迁移文件

### API路由
- `src/app/api/auth/register/route.ts` - 注册API
- `src/app/api/auth/login/route.ts` - 登录API
- `src/app/api/auth/logout/route.ts` - 登出API
- `src/app/api/auth/me/route.ts` - 获取用户信息API

### 页面
- `src/app/register/page.tsx` - 注册页面
- `src/app/login/page.tsx` - 登录页面

## 🧪 测试步骤

1. **启动开发服务器**
   ```bash
   cd d:\图片\虚拟男友\projects
   npm run dev
   ```

2. **访问注册页面**
   - 打开浏览器访问：http://localhost:5000/register
   - 测试输入验证：
     - 用户名少于3个字符
     - 密码少于6个字符
     - 两次密码不一致

3. **注册新用户**
   - 输入用户名：testuser
   - 输入密码：password123
   - 点击注册
   - 应该跳转到首页

4. **验证数据库**
   ```sql
   SELECT * FROM users WHERE username = 'testuser';
   ```
   - 检查密码是否已哈希加密
   - 检查created_at字段

5. **测试登录**
   - 访问 http://localhost:5000/login
   - 输入用户名和密码
   - 验证登录成功

6. **测试错误处理**
   - 使用已存在的用户名注册（应该提示"用户名已存在"）
   - 使用错误的密码登录（应该提示"用户名或密码错误"）

## 🐛 故障排除

### 问题1：数据库连接失败
**错误信息**：`Error: connect ENOENT` 或 `password authentication failed`

**解决方案**：
1. 检查 `.env.local` 文件中的 `DATABASE_URL` 是否正确
2. 确保PostgreSQL服务正在运行
3. 验证用户名和密码是否正确

### 问题2：迁移执行失败
**错误信息**：`relation "users" already exists`

**解决方案**：
```sql
-- 删除现有表（会丢失数据！）
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 重新执行迁移
```

### 问题3：Cookie未设置
**错误信息**：注册/登录成功但下次访问仍提示未登录

**解决方案**：
1. 检查浏览器是否允许Cookie
2. 检查Cookie设置是否正确（httpOnly, secure等）
3. 清除浏览器Cookie后重试

## 📝 下一步优化建议

1. **添加邮箱验证**：注册时发送验证邮件
2. **添加忘记密码功能**：通过邮箱重置密码
3. **添加OAuth登录**：支持微信、QQ等第三方登录
4. **添加个人资料页**：允许用户修改昵称、头像等
5. **添加用户角色系统**：管理员、VIP用户等
6. **添加登录日志**：记录登录时间和IP

## 🎉 完成！

用户认证系统已经完整实现。执行数据库迁移后即可使用！
