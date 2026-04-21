# 图片生成功能测试指南

## 📋 修复内容总结

### 问题根因
1. **`/api/auth/me 401` 错误** - 前端多个调用 `/api/auth/me` 的地方缺少 `credentials: 'include'`
2. **图片生成链路不完整** - 缺少详细日志，无法定位问题

### 已修复文件
1. ✅ `src/components/navbar.tsx` - 添加 credentials
2. ✅ `src/app/page.tsx` - 添加 credentials（2处）
3. ✅ `src/app/profile/page.tsx` - 添加 credentials（2处）
4. ✅ `src/app/select-role/page.tsx` - 添加 credentials（2处）
5. ✅ `src/components/chat-interface.tsx` - 添加 credentials + 详细日志
6. ✅ `src/app/api/chat/route.ts` - 增强图片生成日志
7. ✅ `src/lib/image-gen.ts` - 增强图片API调用日志

---

## 🧪 如何测试"发照片"功能

### 1. 启动项目
```bash
npm run dev
```
访问: http://localhost:5000

### 2. 登录并选择角色
1. 注册/登录账号
2. 选择一个角色（霸总/温柔/演员/奋斗）
3. 进入聊天页面

### 3. 测试图片生成（按推荐顺序）

#### ✅ 必定触发的表达（高置信度）
```
发张照片
发个照片
发张自拍
给我看看你
让我看看你
给我发张照片
来张照片
发张帅照
show me a photo
send photo
```

#### ✅ 指定场景的表达（中置信度）
```
发张你穿西装的照片
发个睡衣照
来张居家照
发张运动照
发个睡前自拍
发张今天的照片
看看你现在的样子
```

#### ❌ 不会触发的表达（只是夸奖）
```
你好帅
你真帅
帅哥
你很帅啊
```

---

## 🔍 调试日志说明

### 前端日志（浏览器控制台）
```
[聊天] 发送消息: { userMessage: '发张照片', personalityId: 'ceo' }
[聊天] API 响应成功，开始读取流
[聊天] 收到图片消息: https://...
[聊天] 流式接收完成 { hasImage: true, imageUrl: '...' }
```

### 后端日志（终端）
```
=== 图片意图检测结果 ===
[意图] 用户消息: 发张照片
[意图] 是否匹配: true
[意图] 置信度: 0.9
[意图] 触发关键词: ['发张照片']
[意图] 是否生成图片: true
[意图] 当前角色: ceo 顾承川

=== 开始生成图片 ===
[图片] 角色类型: ceo
[图片] 角色名称: 顾承川
[图片] 用户消息: 发张照片
[图片] 环境变量检查: { hasKey: true, ... }

=== buildImagePrompt 被调用 ===
[Prompt] 角色类型: ceo
[Prompt] 角色名称: 顾承川
[Prompt] 用户消息: 发张照片

=== generateImage 开始执行 ===
[环境变量] 检查:
  - GPT_IMAGE_API_KEY: sk-vrjcNmf...
  - GPT_IMAGE_API_BASE: https://api.evolink.ai/v1
  - GPT_IMAGE_MODEL: gpt-image-1.5
[生成提示词] 完成，长度: 123
[API 请求] 准备发送请求到: https://api.evolink.ai/v1/images/generations
[API 响应] 状态码: 200
[成功] 图片URL已获取: https://...
=== generateImage 执行完成 ===
[图片] ✅ 生成成功! URL: https://...
```

---

## 🎯 验证成功的标志

### 1. 前端显示
- ✅ 聊天框中先显示图片
- ✅ 图片下方显示文字回复
- ✅ 图片高度不超过 300px，保持比例
- ✅ 图片加载完成后自动滚动

### 2. 后端日志
- ✅ 看到 `=== 图片意图检测结果 ===`
- ✅ 看到 `是否生成图片: true`
- ✅ 看到 `=== 开始生成图片 ===`
- ✅ 看到 `[图片] ✅ 生成成功!`

### 3. 浏览器 Network
- ✅ `/api/chat` 请求返回 200
- ✅ Response 是流式数据（text/event-stream）
- ✅ 流中包含 `type: 'image'` 和 `imageUrl`

---

## ❌ 如果图片生成失败

### 情况1: 意图未识别
**症状**: 后端日志显示 `是否生成图片: false`

**原因**: 用户表达不够明确

**解决**: 使用必定触发的表达，如 `发张照片`

---

### 情况2: API调用失败
**症状**: 后端日志显示 `[图片] ❌ 生成失败`

**检查**:
1. 终端日志中的 `[API 响应] 状态码` 是否为 200
2. `[API 错误]` 显示的具体错误信息

**常见错误**:
- `401 Unauthorized` - API Key 无效
- `400 Bad Request` - 请求格式错误
- `500 Internal Server Error` - 服务器错误

**解决**:
1. 检查 `.env.local` 中的 `GPT_IMAGE_API_KEY`
2. 检查 `GPT_IMAGE_API_BASE` 是否正确
3. 查看完整错误日志

---

### 情况3: 环境变量未设置
**症状**: 后端日志显示 `GPT_IMAGE_API_KEY is not set`

**解决**:
1. 检查 `.env.local` 文件是否存在
2. 确认包含以下配置：
```
GPT_IMAGE_API_KEY=sk-vrjcNmf1GVXUUZ0RCrOhybj0bs7nqiT468qZQdmGEaQbtSVN
GPT_IMAGE_API_BASE=https://api.evolink.ai/v1
GPT_IMAGE_MODEL=gpt-image-1.5
```
3. 重启开发服务器

---

### 情况4: 图片URL无效
**症状**: 后端显示生成成功，但前端图片无法加载

**检查**:
1. 浏览器控制台是否有图片加载错误
2. 图片URL是否可访问（复制到浏览器打开）

---

## 📝 图片降级机制

如果图片生成失败，会：
1. ✅ 正常返回文字回复
2. ✅ 在文字末尾添加：`（这次照片没发成功，再让我给你补一张💕）`
3. ✅ 不影响聊天继续进行

---

## 🔧 技术细节

### 触发条件
- 置信度 ≥ 0.5
- 包含明确请求动词（发/给/来/让/想看/看看/show/send）
- 包含照片相关关键词

### 角色一致性
- 每个角色的图片风格不同
- prompt 包含角色类型、姓名、场景、表情
- 从 `personalities` 配置中获取

### 消息结构
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;      // 文字内容
  imageUrl?: string;    // 图片URL（可选）
}
```

---

## 🎨 测试不同角色

### 霸总（顾承川）
```
发张你穿西装的照片
发张工作照
```
**预期**: 商务精英风格，正装，办公室背景

### 温柔（沈予安）
```
发张居家照
发个可爱的照片
```
**预期**: 温柔可爱，家居服，温馨背景

### 演员（陆景言）
```
发张有氛围感的照片
发张艺术照
```
**预期**: 浪漫有型，艺术感，戏剧性

### 奋斗（周屿川）
```
发张运动照
发张朴实的照片
```
**预期**: 阳光真诚，运动装或朴实服装

---

## 📞 遇到问题

1. **查看浏览器控制台** - 检查前端错误
2. **查看终端日志** - 检查后端日志
3. **查看Network** - 检查API请求/响应
4. **查看图片URL** - 手动打开验证是否可访问

所有关键节点都有详细日志输出，可以根据日志定位具体问题。
