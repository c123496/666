# 🎨 异步任务模式图片生成 - 完整测试指南

## ✅ 修复完成总结

### 核心修改

已将图片生成从**错误的同步模式**改为**正确的异步任务模式**：

#### ❌ 修复前（错误）
```typescript
// 错误：假设POST直接返回图片URL
const response = await fetch(`${apiBase}/images/generations`, {...});
const data = await response.json();
const imageUrl = data.data[0].url; // ❌ 这样是不对的！
```

#### ✅ 修复后（正确）
```typescript
// 步骤1: 创建任务，获得 task_id
const createResponse = await fetch(`${apiBase}/v1/images/generations`, {...});
const { id: taskId } = await createResponse.json();

// 步骤2: 轮询任务状态
const taskResponse = await pollTaskStatus(apiBase, apiKey, taskId);
// 循环 GET /v1/tasks/{task_id} 直到 status === "completed"

// 步骤3: 从结果中提取图片URL
const imageUrl = taskResponse.results[0].url;
```

---

## 📝 修改的文件清单（3个）

### 1. `src/lib/image-gen.ts` - 完全重写
**修改内容**：
- ✅ 更新接口类型定义（`CreateTaskRequest`、`CreateTaskResponse`、`TaskResponse`）
- ✅ 新增 `pollTaskStatus()` 函数 - 轮询任务状态
- ✅ 重写 `generateImage()` 函数 - 异步任务模式
- ✅ 添加详细日志输出

**关键代码**：
```typescript
// 创建任务
const createResponse = await fetch(`${apiBase}/v1/images/generations`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ model, prompt, size, quality, n: 1 }),
});

const createData: CreateTaskResponse = await createResponse.json();
const taskId = createData.id; // 获取 task_id

// 轮询任务状态
const taskData = await pollTaskStatus(apiBase, apiKey, taskId);

// 提取图片URL
const imageUrl = taskData.results[0].url;
```

### 2. `src/app/api/chat/route.ts` - 更新日志
**修改内容**：
- ✅ 更新图片生成日志，显示异步任务提示
- ✅ 添加环境变量完整检查（包括 size、quality）

**关键代码**：
```typescript
console.log('[图片] ⏱️  异步任务可能需要 10-60 秒，请耐心等待...');
imageUrl = await generateImage(personalityId, personality.name, message);
// 这里会等待图片生成完成（包括轮询）
```

### 3. `.env.local` - 更新环境变量
**修改内容**：
```env
# 旧配置（已删除）
GPT_IMAGE_API_BASE=https://api.evolink.ai/v1  # ❌ 错误的base URL

# 新配置（正确）
GPT_IMAGE_API_KEY=sk-ezDeA22BYqKsTlliVl7oT7FiHzAjgeVxPcm5SDMGjiHUWegu
GPT_IMAGE_API_BASE=https://api.evolink.ai  # ✅ 正确的base URL（不带/v1）
GPT_IMAGE_MODEL=gpt-image-1.5
GPT_IMAGE_SIZE=1024x1536                    # ✅ 新增
GPT_IMAGE_QUALITY=auto                       # ✅ 新增
```

---

## 🔄 完整的图片生成流程

### 步骤1: 用户触发
```
用户输入: "发张照片"
  ↓
前端识别并发送到 /api/chat
```

### 步骤2: 服务端识别意图
```
detectImageIntent("发张照片")
  ↓
置信度: 0.9 (≥ 0.5)
触发关键词: ["发张照片"]
是否生成图片: true
```

### 步骤3: 构建提示词
```
buildImagePrompt("ceo", "顾承川", "发张照片")
  ↓
生成英文prompt（~150字符）
```

### 步骤4: 创建任务
```
POST https://api.evolink.ai/v1/images/generations
Headers:
  Authorization: Bearer sk-ezDeA...
  Content-Type: application/json
Body:
{
  "model": "gpt-image-1.5",
  "prompt": "Business elite style, ...",
  "size": "1024x1536",
  "quality": "auto",
  "n": 1
}
  ↓
返回: { "id": "task_xxx", "status": "pending", ... }
```

### 步骤5: 轮询任务状态
```
GET https://api.evolink.ai/v1/tasks/task_xxx
  ↓
循环（最多30次，每次间隔2秒）:
  - status = "pending" → 继续等待
  - status = "processing" → 继续等待
  - status = "completed" → ✅ 成功！
  - status = "failed" → ❌ 失败
```

### 步骤6: 提取图片URL
```
taskData.results[0].url
  ↓
返回: "https://..."
```

### 步骤7: 返回给前端
```
流式响应:
1. type: 'image', imageUrl: 'https://...'
2. type: 'text', content: '文' (逐字)
3. type: 'text', content: '字' (逐字)
4. ...
5. [DONE]
```

---

## 🧪 如何测试

### 1. 启动项目
```bash
npm run dev
```
访问: http://localhost:5000

### 2. 登录并选择角色

### 3. 发送图片请求（推荐测试表达）

#### ✅ 必定触发（置信度 0.9）
```
发张照片
发个照片
发张自拍
给我看看你
让我看看你
给我发张照片
来张照片
show me a photo
send photo
```

#### ✅ 指定场景（置信度 0.7）
```
发张你穿西装的照片
发个睡衣照
来张居家照
发张运动照
看看你现在的样子
```

### 4. 观察日志（终端）

#### 成功的完整日志流程：

```
=== 图片意图检测结果 ===
[意图] 用户消息: 发张照片
[意图] 是否匹配: true
[意图] 置信度: 0.9
[意图] 触发关键词: ['发张照片']
[意图] 是否生成图片: true

=== 开始生成图片（异步任务模式）===
[图片] 角色类型: ceo
[图片] 角色名称: 顾承川
[图片] ⏱️  异步任务可能需要 10-60 秒，请耐心等待...

=== buildImagePrompt 被调用 ===
[Prompt] 角色类型: ceo
[Prompt] 生成的提示词长度: 157

=== generateImage 开始执行 ===
[环境变量] 检查:
  - GPT_IMAGE_API_KEY: sk-ezDeA22BYq...
  - GPT_IMAGE_API_BASE: https://api.evolink.ai
  - GPT_IMAGE_MODEL: gpt-image-1.5
  - GPT_IMAGE_SIZE: 1024x1536
  - GPT_IMAGE_QUALITY: auto

=== 步骤1: 创建图片生成任务 ===
[创建任务] 请求URL: https://api.evolink.ai/v1/images/generations
[创建任务] 响应状态: 200
[创建任务] ✅ 成功!
[创建任务] Task ID: task_abc123xyz
[创建任务] 初始状态: pending

=== 步骤2: 轮询任务状态 ===
=== 开始轮询任务状态 ===
[轮询] Task ID: task_abc123xyz
[轮询] 最大尝试次数: 30
[轮询] 轮询间隔: 2000ms

[轮询] 第 1/30 次尝试...
[轮询] 任务状态: processing
[轮询] 进度: 10%
[轮询] 等待 2000ms 后重试...

[轮询] 第 2/30 次尝试...
[轮询] 任务状态: processing
[轮询] 进度: 30%
[轮询] 等待 2000ms 后重试...

[轮询] 第 3/30 次尝试...
[轮询] 任务状态: processing
[轮询] 进度: 60%
[轮询] 等待 2000ms 后重试...

[轮询] 第 4/30 次尝试...
[轮询] 任务状态: processing
[轮询] 进度: 90%
[轮询] 等待 2000ms 后重试...

[轮询] 第 5/30 次尝试...
[轮询] 任务状态: completed
[轮询] ✅ 任务完成!
[轮询] 结果数量: 1
[轮询] 图片URL: https://...

=== 步骤3: 提取图片URL ===
[提取URL] ✅ 成功!
[提取URL] 图片URL: https://...

=== generateImage 执行完成 ===
[图片] ✅ 生成成功! URL: https://...
```

#### 失败的日志：

```
=== 步骤1: 创建图片生成任务 ===
[创建任务] 响应状态: 401
[创建任务] ❌ 失败!
[创建任务] 错误详情: {"error":{"message":"Invalid API key"}}
[图片] ❌ 生成失败: Failed to create image generation task: 401
```

或

```
=== 步骤2: 轮询任务状态 ===
[轮询] 第 5/30 次尝试...
[轮询] 任务状态: failed
[轮询] ❌ 任务失败
[轮询] 错误信息: { code: "generation_failed", message: "..." }
[图片] ❌ 生成失败: Task failed: ...
```

---

## ❌ 常见问题排查

### 问题1: 环境变量未生效
**症状**: `GPT_IMAGE_API_KEY 未设置`

**解决**:
1. 检查 `.env.local` 文件是否存在
2. 确认包含新配置：
   ```
   GPT_IMAGE_API_KEY=sk-ezDeA22BYqKsTlliVl7oT7FiHzAjgeVxPcm5SDMGjiHUWegu
   GPT_IMAGE_API_BASE=https://api.evolink.ai
   GPT_IMAGE_MODEL=gpt-image-1.5
   GPT_IMAGE_SIZE=1024x1536
   GPT_IMAGE_QUALITY=auto
   ```
3. 重启开发服务器：
   ```bash
   # 停止当前服务器 (Ctrl+C)
   npm run dev
   ```

---

### 问题2: API Key 无效
**症状**: `[创建任务] 响应状态: 401`

**解决**:
1. 检查 API Key 是否正确：`sk-ezDeA22BYqKsTlliVl7oT7FiHzAjgeVxPcm5SDMGjiHUWegu`
2. 确认 Key 是否过期
3. 检查 EvoLink 账户余额

---

### 问题3: 任务轮询超时
**症状**: `Task polling timeout: exceeded maximum attempts`

**原因**:
- 任务处理时间超过 60 秒（30次 × 2秒）
- 网络问题
- 服务器负载过高

**解决**:
1. 等待一段时间后重试
2. 检查网络连接
3. 如果频繁超时，可以增加轮询次数（修改 `pollTaskStatus` 的 `maxAttempts` 参数）

---

### 问题4: 图片URL无效
**症状**: 后端显示成功，但前端图片无法加载

**检查**:
1. 复制图片URL到浏览器，看能否访问
2. 检查URL格式：应该以 `https://` 开头
3. 查看浏览器控制台是否有CORS错误

---

## 🎯 验证成功的标志

### 1. 终端日志
- ✅ 看到 `=== 步骤1: 创建图片生成任务 ===`
- ✅ 看到 `[创建任务] ✅ 成功!`
- ✅ 看到 `=== 步骤2: 轮询任务状态 ===`
- ✅ 看到 `[轮询] 任务状态: completed`
- ✅ 看到 `[提取URL] ✅ 成功!`

### 2. 聊天界面
- ✅ 先显示图片（可能有短暂延迟）
- ✅ 图片下方显示文字回复
- ✅ 图片完整显示（不是破碎图标）

### 3. 图片质量
- ✅ 符合角色风格（霸总正装、温柔居家等）
- ✅ 清晰度高（1024x1536）
- ✅ 真实照片风格

---

## 📊 性能说明

### 预期时间
- **创建任务**: < 1秒
- **图片生成**: 10-60秒（取决于服务器负载）
- **轮询间隔**: 每2秒查询一次
- **总耗时**: 通常在 20-40 秒左右

### 轮询策略
- **最大尝试次数**: 30次
- **轮询间隔**: 2000ms（2秒）
- **超时时间**: 60秒
- **状态检查**: pending → processing → completed

---

## 🔧 技术细节

### API 端点
- **创建任务**: `POST https://api.evolink.ai/v1/images/generations`
- **查询任务**: `GET https://api.evolink.ai/v1/tasks/{task_id}`

### 请求参数
```typescript
{
  model: "gpt-image-1.5",
  prompt: "...",  // 英文prompt
  size: "1024x1536",
  quality: "auto",
  n: 1
}
```

### 响应结构
**创建任务响应**:
```json
{
  "id": "task_xxx",
  "object": "image.task",
  "created_at": 1234567890,
  "status": "pending"
}
```

**查询任务响应**:
```json
{
  "id": "task_xxx",
  "status": "completed",
  "progress": 100,
  "results": [
    {
      "url": "https://..."
    }
  ]
}
```

---

## 🚨 重要提示

### ⚠️ 不要假设同步返回
**错误做法**:
```typescript
const data = await fetch('/v1/images/generations', ...);
const url = data.data[0].url; // ❌ 错误！
```

**正确做法**:
```typescript
// 1. 创建任务
const { id } = await fetch('/v1/images/generations', ...);

// 2. 轮询状态
const task = await pollTask(id);

// 3. 提取URL
const url = task.results[0].url; // ✅ 正确！
```

### ⚠️ API Base URL 不要带 /v1
**错误**:
```
GPT_IMAGE_API_BASE=https://api.evolink.ai/v1  // ❌
```

**正确**:
```
GPT_IMAGE_API_BASE=https://api.evolink.ai    // ✅
```

代码中会自动加上 `/v1`：
```typescript
fetch(`${apiBase}/v1/images/generations`)  // ✅
fetch(`${apiBase}/v1/tasks/${taskId}`)      // ✅
```

---

## 📞 如果还有问题

请提供以下信息：

1. **完整终端日志**（从"发张照片"到最终结果）
2. **浏览器控制台日志**（F12 → Console）
3. **Network 请求**（F12 → Network → 找到失败的请求）
4. **`.env.local` 内容**（可以隐藏API Key的前几位）
5. **具体输入了什么消息**
6. **期望看到什么 vs 实际看到什么**

所有关键节点都有详细日志，可以快速定位问题！
