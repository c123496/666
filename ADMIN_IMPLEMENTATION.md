# 虚拟男友项目 - 管理后台实施说明

## 📋 项目概览

本次实施为虚拟男友项目添加了完整的管理后台系统，包括数据库、认证系统和用户/订单管理功能。

## ✅ 已完成的工作

### 1. 数据库配置

**新增文件：**
- `drizzle.config.ts` - Drizzle ORM 配置文件
- `src/db/schema.ts` - 数据库表结构定义
- `src/db/index.ts` - 数据库连接实例

**数据库表结构：**

#### users 表（用户表）
```sql
- id: serial (主键)
- name: varchar(100) - 用户姓名
- email: varchar(255) - 用户邮箱（唯一）
- password: varchar(255) - 密码哈希
- status: varchar(20) - 状态（active/suspended/deleted）
- isAdmin: boolean - 是否管理员
- created_at: timestamp - 创建时间
- updated_at: timestamp - 更新时间
```

#### orders 表（订单表）
```sql
- id: serial (主键)
- order_no: varchar(50) - 订单号（唯一）
- user_id: integer - 用户ID（外键）
- amount: decimal(10,2) - 订单金额
- status: varchar(20) - 状态（pending/paid/cancelled/refunded）
- notes: text - 备注信息
- created_at: timestamp - 创建时间
- updated_at: timestamp - 更新时间
```

### 2. 认证系统

**新增文件：**
- `src/lib/auth.ts` - 认证和会话管理
- `src/app/api/auth/login/route.ts` - 登录 API
- `src/app/api/auth/logout/route.ts` - 登出 API
- `src/app/api/auth/session/route.ts` - 会话查询 API
- `src/app/admin/login/page.tsx` - 管理员登录页面

**功能特性：**
- 基于 JWT 的会话管理
- 管理员权限验证
- 7 天会话有效期
- HttpOnly Cookie 保护

### 3. 管理后台结构

**新增文件：**
- `src/app/admin/layout.tsx` - 管理后台布局
- `src/components/admin/Sidebar.tsx` - 侧边栏导航
- `src/app/admin/page.tsx` - 概览页面
- `src/app/admin/users/page.tsx` - 用户管理页面
- `src/app/admin/orders/page.tsx` - 订单管理页面

**路由结构：**
```
/admin                    # 概览页（Dashboard）
/admin/login              # 管理员登录
/admin/users              # 用户管理
/admin/orders             # 订单管理
```

### 4. API 接口

**统计数据 API：**
- `GET /api/admin/dashboard` - 获取概览统计数据

**用户管理 API：**
- `GET /api/admin/users` - 获取用户列表（支持搜索、筛选、分页）
- `PATCH /api/admin/users/[id]` - 更新用户状态

**订单管理 API：**
- `GET /api/admin/orders` - 获取订单列表（支持搜索、筛选、分页）
- `GET /api/admin/orders/[id]/details` - 获取订单详情
- `PATCH /api/admin/orders/[id]` - 更新订单状态

### 5. 数据初始化

**新增文件：**
- `scripts/seed.ts` - 数据库初始化脚本（创建默认管理员和测试数据）

### 6. 环境配置

**更新文件：**
- `.env.local` - 添加数据库配置和会话密钥
- `.env.example` - 更新环境变量示例

## 🔧 使用指南

### 步骤 1: 配置数据库

1. 安装 PostgreSQL
2. 创建数据库：
```sql
CREATE DATABASE virtual_boyfriend;
```

3. 配置 `.env.local`：
```env
DATABASE_URL=postgresql://user:password@localhost:5432/virtual_boyfriend
SESSION_SECRET=your-secret-key-change-in-production
```

### 步骤 2: 生成数据库迁移

```bash
# 生成迁移文件
pnpm drizzle-kit generate:pg

# 执行迁移
pnpm drizzle-kit push:pg
```

### 步骤 3: 初始化数据

```bash
# 运行初始化脚本
tsx scripts/seed.ts
```

这会创建：
- 默认管理员账号：`admin@example.com` / `admin123`
- 3 个测试用户
- 4 个测试订单

**⚠️ 生产环境安全提醒：**
- 修改默认管理员密码
- 使用 bcrypt 等库对密码进行哈希
- 修改 SESSION_SECRET 为随机字符串

### 步骤 4: 启动项目

```bash
pnpm dev
```

### 步骤 5: 访问管理后台

1. 访问 `http://localhost:5000/admin/login`
2. 使用管理员账号登录
3. 开始管理用户和订单

## 📊 功能清单

### 概览页 (`/admin`)
- ✅ 用户总数统计
- ✅ 最近 7 天新增用户
- ✅ 订单总数统计
- ✅ 最近 7 天新增订单
- ✅ 总成交额
- ✅ 最近 7 天成交额
- ✅ 快速导航入口

### 用户管理 (`/admin/users`)
- ✅ 用户列表展示（表格）
- ✅ 搜索（姓名、邮箱）
- ✅ 状态筛选（活跃/已暂停/已删除）
- ✅ 分页功能
- ✅ 编辑用户状态
- ✅ 显示管理员标识
- ❌ 删除功能（按需求不实现）

### 订单管理 (`/admin/orders`)
- ✅ 订单列表展示（表格）
- ✅ 搜索（订单号）
- ✅ 状态筛选（待支付/已支付/已取消/已退款）
- ✅ 分页功能
- ✅ 查看订单详情（弹窗）
- ✅ 编辑订单状态
- ✅ 关联用户信息展示
- ❌ 删除功能（按需求不实现）

## 🎨 UI/UX 特性

- 复用现有 shadcn/ui 组件库
- 简洁的后台风格设计
- 响应式布局（桌面端优化）
- 统一的侧边栏导航
- 加载状态提示
- 空状态提示
- 错误提示

## 🔒 安全特性

- 管理员权限验证（所有管理页面）
- HttpOnly Cookie（防止 XSS）
- CSRF 保护
- 密码不在日志中显示
- 会话过期机制

## 📝 字段映射关系

由于项目原有使用 localStorage，新系统使用数据库，以下是映射关系：

### 用户信息
- 原有：`UserConfig.nickname` → 新：`users.name`
- 原有：无邮箱字段 → 新：`users.email`
- 原有：无状态字段 → 新：`users.status`

### 订单信息
- 原有：无订单系统 → 新：`orders` 表（完整实现）

## 🚀 下一步扩展建议

如果要继续添加以下模块，可以参考现有结构：

### 1. Products（商品管理）
```
/api/admin/products          # 商品列表
/api/admin/products/[id]     # 商品详情/更新
/admin/products              # 商品管理页面
```

**建议复用的结构：**
- 表格列表展示
- 搜索和筛选
- 分页功能
- 弹窗编辑

### 2. Payments（支付管理）
```
/api/admin/payments          # 支付记录
/api/admin/payments/[id]     # 支付详情
/admin/payments              # 支付管理页面
```

**建议复用的结构：**
- 订单详情展示逻辑
- 状态筛选
- 时间范围筛选

### 3. Logs（日志管理）
```
/api/admin/logs              # 日志列表
/api/admin/logs/[id]         # 日志详情
/admin/logs                  # 日志管理页面
```

**建议复用的结构：**
- 列表分页
- 时间筛选
- 日志级别筛选

## 📁 新增/修改文件清单

### 新增文件（23 个）

**配置：**
- `drizzle.config.ts`
- `.env.local`（更新）
- `.env.example`（更新）

**数据库：**
- `src/db/schema.ts`
- `src/db/index.ts`

**认证：**
- `src/lib/auth.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/admin/login/page.tsx`

**管理后台：**
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/components/admin/Sidebar.tsx`

**API：**
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/orders/[id]/route.ts`
- `src/app/api/admin/orders/[id]/details/route.ts`

**脚本：**
- `scripts/seed.ts`

**文档：**
- `ADMIN_IMPLEMENTATION.md`（本文档）

### 未修改的现有文件

所有原有功能保持不变，包括：
- 虚拟男友聊天功能
- localStorage 存储
- 原有 UI 组件
- 原有 API 路由

## ⚠️ 重要提醒

### 生产环境必做

1. **修改默认密码**
   ```sql
   UPDATE users SET password = 'bcrypt_hash_here' WHERE email = 'admin@example.com';
   ```

2. **修改 SESSION_SECRET**
   ```env
   SESSION_SECRET=random_long_string_here
   ```

3. **使用 HTTPS**（生产环境）

4. **配置 CORS**（如需要）

5. **添加速率限制**（防止暴力破解）

### 已知限制

1. **密码未使用 bcrypt 哈希**
   - 当前使用明文对比（仅用于演示）
   - 生产环境必须使用 `bcrypt` 或 `argon2`

2. **无 RBAC 权限系统**
   - 当前只有 isAdmin 布尔值
   - 如需细粒度权限，需添加角色系统

3. **无操作日志**
   - 建议添加管理操作审计日志

4. **搜索功能较简单**
   - 当前仅支持简单的 LIKE 查询
   - 大数据量时应使用全文搜索

## 🎯 总结

本次实施完整地添加了管理后台功能，包括：

✅ 数据库设计和配置
✅ 认证和会话系统
✅ 用户管理模块
✅ 订单管理模块
✅ 概览统计页面
✅ 统一的后台布局
✅ 完整的 API 接口
✅ 数据初始化脚本

所有功能都基于现有技术栈（Next.js + Drizzle + PostgreSQL + shadcn/ui），代码风格保持一致，易于维护和扩展。
