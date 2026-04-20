# 管理后台快速设置指南

## 🚀 5 分钟快速启动

### 1. 安装 PostgreSQL

**Windows:**
```bash
# 使用 Chocolatey
choco install postgresql

# 或下载安装包
# https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. 创建数据库

```bash
# 进入 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE virtual_boyfriend;

# 创建用户（可选）
CREATE USER virtual_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE virtual_boyfriend TO virtual_user;

# 退出
\q
```

### 3. 配置环境变量

编辑 `projects/.env.local`：

```env
# 数据库连接（根据实际情况修改）
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/virtual_boyfriend

# 会话密钥（生产环境必须修改）
SESSION_SECRET=change-this-to-a-random-string-in-production
```

### 4. 安装依赖并初始化数据库

```bash
cd projects

# 安装依赖（已完成）
pnpm install

# 生成数据库迁移
pnpm drizzle-kit generate:pg

# 执行迁移（创建表）
pnpm drizzle-kit push:pg

# 初始化测试数据
tsx scripts/seed.ts
```

### 5. 启动项目

```bash
pnpm dev
```

### 6. 访问管理后台

打开浏览器访问：`http://localhost:5000/admin/login`

**默认管理员账号：**
- 邮箱：`admin@example.com`
- 密码：`admin123`

**⚠️ 生产环境务必修改默认密码！**

## 📋 数据库表结构说明

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| name | varchar(100) | 用户姓名 |
| email | varchar(255) | 用户邮箱（唯一） |
| password | varchar(255) | 密码 |
| status | varchar(20) | 状态：active/suspended/deleted |
| isAdmin | boolean | 是否管理员 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### orders 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| order_no | varchar(50) | 订单号（唯一） |
| user_id | integer | 用户ID（外键） |
| amount | decimal(10,2) | 订单金额 |
| status | varchar(20) | 状态：pending/paid/cancelled/refunded |
| notes | text | 备注信息 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## 🔧 常用命令

```bash
# 查看数据库状态
psql -U postgres -d virtual_boyfriend -c "\dt"

# 查看用户数据
psql -U postgres -d virtual_boyfriend -c "SELECT * FROM users;"

# 查看订单数据
psql -U postgres -d virtual_boyfriend -c "SELECT * FROM orders;"

# 重置数据库（危险操作）
psql -U postgres -c "DROP DATABASE virtual_boyfriend;"
psql -U postgres -c "CREATE DATABASE virtual_boyfriend;"
pnpm drizzle-kit push:pg
tsx scripts/seed.ts

# 生成 Drizzle Studio（可视化数据库工具）
pnpm drizzle-kit studio
```

## 🐛 故障排查

### 问题 1：数据库连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案：**
- 检查 PostgreSQL 是否运行：`brew services list` 或 `systemctl status postgresql`
- 检查端口号是否正确（默认 5432）
- 检查 DATABASE_URL 格式是否正确

### 问题 2：数据库不存在
```
Error: database "virtual_boyfriend" does not exist
```

**解决方案：**
```bash
psql -U postgres -c "CREATE DATABASE virtual_boyfriend;"
```

### 问题 3：权限错误
```
Error: permission denied for table users
```

**解决方案：**
```bash
psql -U postgres -d virtual_boyfriend -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;"
```

### 问题 4：端口被占用
```
Error: listen EADDRINUSE: address already in use :::5000
```

**解决方案：**
- 修改 `.env.local` 中的 PORT
- 或停止占用端口的进程

## 🔒 安全建议

### 生产环境必做

1. **修改默认管理员密码**
```sql
-- 使用 bcrypt 哈希（需要先安装 bcrypt）
-- 或暂时手动设置
UPDATE users SET password = 'new_secure_password' WHERE email = 'admin@example.com';
```

2. **修改 SESSION_SECRET**
```env
SESSION_SECRET=$(openssl rand -base64 32)
```

3. **启用 HTTPS**
   - 使用 Nginx 或 Caddy 作为反向代理
   - 配置 SSL 证书（Let's Encrypt）

4. **限制数据库访问**
   - 不要将数据库暴露到公网
   - 使用防火墙限制访问

5. **定期备份数据库**
```bash
pg_dump -U postgres virtual_boyfriend > backup_$(date +%Y%m%d).sql
```

## 📚 下一步

- 阅读 [ADMIN_IMPLEMENTATION.md](./ADMIN_IMPLEMENTATION.md) 了解详细实施说明
- 查看代码注释了解各模块功能
- 根据业务需求定制字段和逻辑

## 🆘 需要帮助？

如遇到问题，请检查：
1. PostgreSQL 是否正常运行
2. 环境变量是否正确配置
3. 数据库迁移是否成功执行
4. 初始化脚本是否运行成功

更多详细信息请参考 [ADMIN_IMPLEMENTATION.md](./ADMIN_IMPLEMENTATION.md)
