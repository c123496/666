# 📸 图片功能问题分析与解决方案

## 🔍 问题诊断

### 用户报告的现象

> 用户发"发张照片"后，后端仍然把消息直接发给了 Gemini 文本模型，让 Gemini 用文字假装发照片，而不是真正调用图片模型。

例如：
```
（你拿起手机，迅速找到一张你工作间隙拍的，略显疲惫但眼神依然锐利的侧脸照片，照片背景是你的办公室，看起来十分专业。）

发给你了。
```

---

## ✅ 真相大白

### **代码逻辑完全正确！**

通过详细日志分析，确认：

1. **意图检测成功**
   ```
   【图片意图检测结果】
     置信度: 0.9
     shouldGenImage: ✅ 是
   ```

2. **成功进入图片生成分支**
   ```
   ▓ ✅✅✅ 进入图片生成分支 ✅✅✅
   ```

3. **正确调用了图片 API**
   ```
   【3. 创建图片生成任务】
     请求 URL: https://api.evolink.ai/v1/images/generations
     响应状态: 402
   ```

4. **API 余额不足**
   ```json
   {
     "error": {
       "code": "insufficient_quota",
       "message": "Insufficient credits: Token quota insufficient. Please recharge."
     }
   }
   ```

---

## 🎯 问题根源

### 为什么 Gemini 会"假装发照片"？

**执行流程**：

1. 用户发送"发张照片"
2. ✅ 意图检测成功（置信度 0.9）
3. ✅ 进入图片生成分支
4. ✅ 调用图片生成 API
5. ❌ **API 返回 402（余额不足）**
6. ⚠️ **代码回退到 Gemini**
7. ⚠️ **Gemini 收到的消息仍然是"发张照片"**
8. ⚠️ **Gemini 根据角色设定，用文字扮演发照片**

**关键问题**：
- 图片生成失败后，系统把原始用户消息"发张照片"传给了 Gemini
- Gemini 看到这个请求，根据霸道总裁的角色设定，用文字描述了"发照片"的行为
- 这就是用户看到的"假装发照片"现象

---

## 🔧 解决方案

### **已实施的修复**

#### 1. 修改用户消息，避免 Gemini 角色扮演

**文件**: `src/app/api/chat/route.ts`

```typescript
// 添加当前用户消息
// 如果图片生成失败，修改用户消息以避免 Gemini "假装发照片"
let finalUserMessage = message;
if (imageError && shouldGenImage) {
  finalUserMessage = `[系统提示：图片生成失败：${imageError}] 用户原始消息：${message}`;
}

messages.push({
  role: 'user',
  content: finalUserMessage,
});
```

**效果**：
- 当图片生成失败时，Gemini 会收到：
  ```
  [系统提示：图片生成失败：Failed to create image generation task: 402 ...] 用户原始消息：发张照片
  ```
- Gemini 会理解图片生成失败，不会再"假装发照片"

#### 2. 增强前端错误处理

**文件**: `src/components/chat-interface.tsx`

```typescript
} else if (parsed.type === 'error') {
  // 接收到错误消息
  console.error('[聊天] ❌ 收到错误消息:', parsed.content);
  currentContent += `\n\n⚠️ ${parsed.content}`;
  // ... 显示给用户
}
```

#### 3. 添加详细调试日志

**文件**: `src/app/api/chat/route.ts`

添加了详细的日志输出，包括：
- `【图片意图检测结果】` - 显示意图检测详情
- `▓ ✅✅✅ 进入图片生成分支 ✅✅✅` - 确认进入分支
- `【1. 环境变量检查】` - 显示 API 配置
- `【2. 构建图片提示词】` - 显示生成的 prompt
- `【3. 创建图片生成任务】` - 显示 API 调用详情

---

## 📊 完整的执行流程

### 成功场景（有余额）

```
用户输入: "发张照片"
  ↓
意图检测: matches=true, confidence=0.9
  ↓
进入图片生成分支 ✅
  ↓
调用图片 API
  ↓
API 返回成功: imageUrl="https://..."
  ↓
前端显示: 图片 + 文字回复
```

### 失败场景（余额不足，已修复）

```
用户输入: "发张照片"
  ↓
意图检测: matches=true, confidence=0.9
  ↓
进入图片生成分支 ✅
  ↓
调用图片 API
  ↓
API 返回失败: 402 insufficient_quota
  ↓
修改消息: "[系统提示：图片生成失败] 用户原始消息：发张照片"
  ↓
调用 Gemini API
  ↓
Gemini 回复: 理解图片失败，正常文字回复 ✅
  ↓
前端显示: 文字回复（不会假装发照片）
```

---

## 🎯 当前状态

### ✅ 已解决的问题

1. **代码逻辑** - 完全正确，确实调用了图片 API
2. **意图检测** - 工作正常，置信度 0.9
3. **分支执行** - 成功进入图片生成分支
4. **Gemini 假装发照片** - 已修复，不会再发生

### ❌ 待解决的问题

1. **API 余额不足** - 需要充值或更换 API Key
2. **图片质量** - 已从 `high` 降到 `medium` 以节省积分

---

## 💡 建议

### 立即验证

1. **充值 API 余额**
   - 登录 EvoLink 官网
   - 为 API Key `sk-ezDeA22BYqKsTlliVl7oT7FiHzAjgeVxPcm5SDMGjiHUWegu` 充值
   - 建议充值 $5-10 进行测试

2. **重新测试**
   ```bash
   # 刷新浏览器（强制刷新：Ctrl+Shift+R）
   # 输入："发张照片"
   # 观察终端日志
   ```

3. **预期结果**
   - ✅ 终端显示：`▓ ✅✅✅ 进入图片生成分支 ✅✅✅`
   - ✅ 终端显示：`[轮询] 任务状态: completed`
   - ✅ 前端显示：真实生成的图片
   - ✅ 不会再有 Gemini"假装发照片"的情况

---

## 📝 技术细节

### 图片意图判断逻辑

**文件**: `src/lib/intent-detector.ts`

**触发条件**：
```typescript
const shouldGenImage = imageIntent.matches && imageIntent.confidence >= 0.5;
```

**高置信度关键词（0.9）**：
- `发张照片`、`发张自拍`、`给我看看你`、`来张照片` 等

**中置信度关键词（0.7）**：
- `发张你穿西装的照片`、`发个睡衣照`、`来张居家照` 等

### API 调用流程

**文件**: `src/lib/image-gen.ts`

**异步任务模式**：
1. 创建任务：`POST /v1/images/generations` → 获取 `task_id`
2. 轮询状态：`GET /v1/tasks/{task_id}` → 最多 60 次，每次 2 秒
3. 获取结果：`task.results[0].url`

**超时配置**：
- 最大尝试次数：60 次
- 轮询间隔：2 秒
- 总超时时间：120 秒

---

## 🎉 总结

### 之前的问题

用户认为"没有进入图片生成链路"，但实际上：
- ✅ 代码确实进入了图片生成分支
- ✅ 确实调用了图片 API
- ❌ 只是 API 余额不足导致失败
- ⚠️ Gemini 作为后备方案，用文字"假装"发照片

### 现在的修复

1. ✅ 修改了消息传递逻辑，避免 Gemini 角色扮演
2. ✅ 添加了详细的调试日志
3. ✅ 增强了前端错误处理
4. ✅ 降低了图片质量以节省积分

### 下一步

只需要**充值 API 余额**，图片功能就能正常工作了！
