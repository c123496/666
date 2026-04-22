# 🚀 Vercel 正式上线清单

## ✅ 上线前检查

### 1. 环境变量配置（Vercel Production）

**必须配置的环境变量**：
```bash
# 数据库
DATABASE_URL=你的生产数据库连接字符串

# Turnstile 人机验证（正式 key）
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADBK-6FEmTQHUZtg
TURNSTILE_SECRET_KEY=0x4AAAAAADBK-3wIQsNxCHnEH_O8NNt3YwE

# API Keys
VOLCENGINE_ARK_API_KEY=ark-你的正式key
```

**配置位置**：
- Vercel Dashboard → **你的项目** → **Settings** → **Environment Variables**
- 选择 **Production** 环境
- 添加上述所有变量

### 2. Cloudflare Turnstile 配置

**在 Cloudflare Dashboard 配置**：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Turnstile** → **你的应用**
3. 前往 **Settings** → **Hostnames**
4. 添加你的生产域名：
   - `your-domain.vercel.app`
   - `your-custom-domain.com`（如果有）

### 3. 构建测试

**本地测试**：
```bash
cd "d:\图片\虚拟男友\projects"
pnpm run build
```

**预期结果**：
- ✅ 编译成功
- ✅ 没有错误或警告
- ✅ 生成所有页面

### 4. 检查 .gitignore

**确保这些文件不会被提交**：
```bash
.env.local
.env.*.local
.next
node_modules
dist
```

**检查命令**：
```bash
cd "d:\图片\虚拟男友\projects"
git status
```

**预期结果**：
- ✅ 只显示源代码文件
- ❌ 不应该看到 `.env.local`
- ❌ 不应该看到 `node_modules`
- ❌ 不应该看到 `.next`

### 5. 最后一次本地测试

**测试项目功能**：
1. ✅ 注册功能（包括 Turnstile 验证）
2. ✅ 登录功能
3. ✅ 聊天功能
4. ✅ 图片生成
5. ✅ 视频生成
6. ✅ 语音生成

---

## 📦 推送到 GitHub

### 1. 提交所有修改

```bash
cd "d:\图片\虚拟男友\projects"
git add -A
git commit -m "chore: Prepare for Vercel production deployment

- Clean up debug console.log statements
- Remove test and debug pages
- Ensure environment-based Turnstile key switching
- Add production deployment checklist"
```

### 2. 推送到 GitHub

```bash
git push origin main
```

### 3. 检查 GitHub 仓库

访问：https://github.com/c123496/666

**确认**：
- ✅ 代码已推送
- ✅ 没有 `.env.local` 文件
- ✅ 没有敏感信息泄露

---

## 🚀 部署到 Vercel

### 1. 导入项目到 Vercel

如果还没有导入：
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 导入 GitHub 仓库：`c123496/666`

### 2. 配置环境变量

**在 Vercel 项目设置中**：
1. 进入 **Settings** → **Environment Variables**
2. 选择 **Production** 环境
3. 添加以下变量：

```bash
# 必需变量
DATABASE_URL=postgresql://...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADBK-6FEmTQHUZtg
TURNSTILE_SECRET_KEY=0x4AAAAAADBK-3wIQsNxCHnEH_O8NNt3YwE
VOLCENGINE_ARK_API_KEY=ark-...

# 其他 API Keys（按需添加）
SESSION_SECRET=生产环境随机字符串
```

### 3. 配置自定义域名（可选）

**如果你有自己的域名**：
1. 在 Vercel 项目设置中，点击 **Domains**
2. 添加你的域名
3. 按照提示配置 DNS

### 4. 开始部署

**Vercel 会自动**：
- 检测到 GitHub 的新 commit
- 运行 `pnpm run build`
- 部署到全球 CDN

**手动部署**：
- 在 Vercel Dashboard 点击 **"Deploy"**
- 或推送新代码触发自动部署

---

## ✅ 部署后验证

### 1. 访问生产站点

```
https://你的项目.vercel.app
```

### 2. 功能测试清单

**注册功能**：
- [ ] 打开注册页面
- [ ] Turnstile 组件显示（不是测试 key）
- [ ] 完成人机验证
- [ ] 注册成功
- [ ] 登录成功

**聊天功能**：
- [ ] 选择角色
- [ ] 发送消息
- [ ] AI 回复正常
- [ ] 图片生成正常
- [ ] 视频生成正常
- [ ] 语音生成正常

### 3. 检查 Vercel 日志

**查看部署日志**：
- Vercel Dashboard → **你的项目** → **Deployments**
- 点击最新的部署记录
- 查看是否有错误或警告

### 4. 检查浏览器控制台

**生产环境应该**：
- ✅ 没有 `console.log` 调试日志
- ✅ 没有 `开发模式` 提示
- ✅ 没有测试 key 标识
- ❌ 只有错误日志（`console.error`）

---

## 🔐 安全检查

### ✅ 确认这些没有泄露

- [ ] `.env.local` 没有提交到 GitHub
- [ ] 真实 API Key 没有硬编码在代码中
- [ ] Secret Key 只在服务端使用
- [ ] 生产环境没有调试日志泄露敏感信息

### ✅ 环境变量命名正确

前端只能读取：
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY ✅
TURNSTILE_SECRET_KEY ❌（不能在前端读取）
```

后端只能读取：
```bash
TURNSTILE_SECRET_KEY ✅
```

---

## 🎯 预期结果

### 开发环境（localhost:5000）
- 使用 Cloudflare 官方测试 key
- 任何输入都会通过验证
- 用于快速开发和测试

### 生产环境（Vercel）
- 使用正式 Turnstile key
- 真实的人机验证
- 防止机器人批量注册

---

## 📞 遇到问题？

### 如果 Turnstile 在生产环境不显示

1. 检查 Vercel 环境变量是否配置
2. 检查域名是否在 Cloudflare 后台添加
3. 查看浏览器控制台错误信息
4. 查看 Vercel 部署日志

### 如果验证失败

1. 检查 `TURNSTILE_SECRET_KEY` 是否正确
2. 查看服务器日志（Vercel → Functions → logs）
3. 确认 Cloudflare Turnstile 服务状态

### 如果其他功能异常

1. 检查所有环境变量是否配置
2. 查看浏览器控制台
3. 查看 Vercel 函数日志
4. 查看数据库连接状态

---

## 🎉 完成！

如果以上所有检查都通过，恭喜你成功部署到 Vercel！
