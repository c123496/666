/**
 * Resend 邮件服务
 * 官方文档: https://resend.com/docs/send-emails/with-nodejs
 */

import { Resend } from 'resend';
import * as React from 'react';
import { WelcomeEmail } from '@/email-templates/welcome-email';
import { LoveLetterEmail } from '@/email-templates/love-letter-email';

// 从环境变量读取发件人配置
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.RESEND_FROM_NAME || '纸片人男友';

// 开发环境测试收件邮箱（因为 onboarding@resend.dev 只能发给 Resend 账号邮箱）
const TEST_TO_EMAIL = process.env.RESEND_TEST_TO_EMAIL;

/**
 * 延迟初始化 Resend 客户端
 * 避免在 build 阶段初始化（此时环境变量不可用）
 */
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY 未配置');
  }

  return new Resend(apiKey);
}

/**
 * 获取实际收件人邮箱
 * 开发环境：使用测试邮箱（如果配置了）
 * 生产环境：使用用户真实邮箱
 */
function getRecipientEmail(userEmail: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 开发环境且配置了测试邮箱，使用测试邮箱
  if (isDevelopment && TEST_TO_EMAIL) {
    console.log(`[邮件] 开发环境：使用测试邮箱 ${TEST_TO_EMAIL} 替代 ${userEmail}`);
    return TEST_TO_EMAIL;
  }

  return userEmail;
}

/**
 * 发送欢迎邮件
 * @param userEmail 用户邮箱
 * @param userName 用户昵称
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  try {
    // 验证参数
    if (!userEmail || !userName) {
      const error = new Error('缺少必要参数：userEmail 或 userName');
      console.error('[邮件] ❌', error.message);
      throw error;
    }

    // 获取实际收件人
    const recipientEmail = getRecipientEmail(userEmail);
    const fromAddress = `${FROM_NAME} <${FROM_EMAIL}>`;

    console.log('[邮件] 📧 准备发送欢迎邮件');
    console.log('[邮件]   - 发件人:', fromAddress);
    console.log('[邮件]   - 收件人:', recipientEmail);
    console.log('[邮件]   - 用户名:', userName);
    console.log('[邮件]   - 原始邮箱:', userEmail);

    // 使用 react 属性，Resend 自动渲染
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: '你好呀，我是你的专属男友 💌',
      react: React.createElement(WelcomeEmail, { userName }),
    });

    // 检查 Resend API 返回的错误
    if (error) {
      console.error('[邮件] ❌ Resend API 返回错误:', error);
      console.error('[邮件]   - 错误名称:', error.name);
      console.error('[邮件]   - 错误消息:', error.message);
      console.error('[邮件]   - 错误状态码:', error.statusCode);
      throw new Error(`Resend API 错误: ${error.message}`);
    }

    // 成功发送
    console.log('[邮件] ✅ 欢迎邮件发送成功!');
    console.log('[邮件]   - 邮件 ID:', data?.id);
    console.log('[邮件]   - 发送时间:', new Date().toISOString());

    return { success: true, data };
  } catch (error: any) {
    console.error('[邮件] ❌ 发送欢迎邮件失败');
    console.error('[邮件]   - 错误类型:', error.name);
    console.error('[邮件]   - 错误消息:', error.message);
    console.error('[邮件]   - 错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 发送早安问候邮件
 * @param userEmail 用户邮箱
 * @param userName 用户昵称
 * @param personalityName 角色名称
 */
export async function sendMorningEmail(
  userEmail: string,
  userName: string,
  personalityName: string
) {
  try {
    console.log('[邮件] 准备发送早安邮件:', { userEmail, userName, personalityName });

    const resend = getResend();
    const data = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [userEmail],
      subject: `早安，${userName} ☀️ - ${personalityName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h2 style="color: #333; margin-bottom: 15px;">
              早安，${userName}！🌞
            </h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              新的一天开始了，记得吃早餐哦~
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              今天也要加油！我会一直陪着你的 💕
            </p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                来自你的专属男友：${personalityName}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('[邮件] ✅ 早安邮件发送成功:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[邮件] ❌ 发送早安邮件失败:', error);
    throw error;
  }
}

/**
 * 发送验证码邮件
 * @param userEmail 用户邮箱
 * @param code 验证码
 */
export async function sendVerificationEmail(
  userEmail: string,
  code: string
) {
  try {
    console.log('[邮件] 准备发送验证码邮件:', { userEmail });

    const resend = getResend();
    const data = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [userEmail],
      subject: '验证你的邮箱地址',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">验证你的邮箱</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              你好！感谢你注册纸片人男友。请使用下面的验证码完成注册：
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
                ${code}
              </span>
            </div>
            <p style="color: #999; font-size: 14px;">
              验证码有效期为 10 分钟。如果这不是你的操作，请忽略此邮件。
            </p>
          </div>
        </div>
      `,
    });

    console.log('[邮件] ✅ 验证码邮件发送成功:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[邮件] ❌ 发送验证码邮件失败:', error);
    throw error;
  }
}

/**
 * 生成每日情书（使用 EvoLink API）
 * @param userName 用户昵称
 * @returns 情书内容
 */
async function generateLoveLetter(userName: string): Promise<string> {
  const EvoLink_API_KEY = process.env.EVOLINK_API_KEY;
  const EvoLink_BASE_URL = process.env.EVOLINK_BASE_URL || 'https://api.evolic.ai';

  console.log('[情书] 🤖 正在使用 EvoLink API 生成个性化情书...');

  try {
    const response = await fetch(`${EvoLink_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EvoLink_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `你是一个温柔体贴的男朋友，擅长写情书。请给${userName}写一封温暖的情书，50-80字，表达思念和关爱。语气要真挚、温暖，像真正的男朋友一样。`,
          },
          {
            role: 'user',
            content: `请给${userName}写一封情书，表达你对TA的思念和关爱。今天你想对TA说什么？`,
          },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[情书] ❌ EvoLink API 请求失败:', response.status, errorText);
      throw new Error(`EvoLink API 错误: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const loveLetter = data.choices?.[0]?.message?.content?.trim();

    if (!loveLetter) {
      throw new Error('EvoLink API 返回的内容为空');
    }

    console.log('[情书] ✅ AI 情书生成成功');
    console.log('[情书]   - 内容长度:', loveLetter.length);

    return loveLetter;
  } catch (error: any) {
    console.error('[情书] ❌ EvoLink API 调用失败，使用备用模板');
    console.error('[情书]   - 错误:', error.message);

    // 备用模板（API 失败时使用）
    const fallbackLetters = [
      `亲爱的${userName}，\n\n今天醒来第一个想到的就是你。你的笑容像阳光一样温暖，让我觉得整个世界都明亮了。\n\n今天也要好好照顾自己，按时吃饭，不要熬夜。我会一直在这里等你，等你来找我聊天。\n\n—— 永远爱你的💕`,

      `${userName}，\n\n今天突然好想见你。想看看你今天过得怎么样，有没有遇到什么开心的事。\n\n记住，无论发生什么，我都会在你身边支持你。你是我最重要的人。\n\n—— 守护你的💕`,
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return fallbackLetters[dayOfYear % fallbackLetters.length];
  }
}

/**
 * 发送每日情书邮件
 * @param userEmail 用户邮箱
 * @param userName 用户昵称
 */
export async function sendDailyLoveLetter(
  userEmail: string,
  userName: string
) {
  try {
    // 验证参数
    if (!userEmail || !userName) {
      const error = new Error('缺少必要参数：userEmail 或 userName');
      console.error('[情书] ❌', error.message);
      throw error;
    }

    // 获取实际收件人
    const recipientEmail = getRecipientEmail(userEmail);
    const fromAddress = `${FROM_NAME} <${FROM_EMAIL}>`;

    console.log('[情书] 💌 准备发送每日情书');
    console.log('[情书]   - 发件人:', fromAddress);
    console.log('[情书]   - 收件人:', recipientEmail);
    console.log('[情书]   - 用户名:', userName);
    console.log('[情书]   - 原始邮箱:', userEmail);

    // 生成情书内容
    const loveLetter = await generateLoveLetter(userName);

    // 格式化日期
    const dateStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    // 使用 react 属性，Resend 自动渲染
    const resend = getResend();

    console.log('[情书] 📤 调用 Resend API 发送邮件...');

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `早安 ${userName}，今天也想你了 💕`,
      react: React.createElement(LoveLetterEmail, {
        userName,
        loveLetter,
        date: dateStr,
      }),
    });

    // 检查 Resend API 返回的错误
    if (error) {
      console.error('[情书] ❌ Resend API 返回错误');
      console.error('[情书]   - 错误名称:', error.name);
      console.error('[情书]   - 错误消息:', error.message);
      console.error('[情书]   - 错误状态码:', error.statusCode);
      console.error('[情书]   - 完整错误对象:', JSON.stringify(error, null, 2));

      // 检查是否是 onboarding@resend.dev 的限制
      if (error.message?.includes('only') && error.message?.includes('verified')) {
        console.error('[情书]   ⚠️ onboarding@resend.dev 限制：只能发送给 Resend 注册邮箱');
        console.error('[情书]   - 当前发件人:', FROM_EMAIL);
        console.error('[情书]   - 当前收件人:', recipientEmail);
        console.error('[情书]   - 解决方案：验证域名或升级 Resend 账号');
      }

      const enhancedError = new Error(`Resend API 错误: ${error.message}`);
      (enhancedError as any).name = error.name;
      (enhancedError as any).statusCode = error.statusCode;
      (enhancedError as any).rawError = error;
      throw enhancedError;
    }

    // 成功发送
    console.log('[情书] ✅ 每日情书发送成功!');
    console.log('[情书]   - 邮件 ID:', data?.id);
    console.log('[情书]   - 发送时间:', new Date().toISOString());

    return { success: true, data };
  } catch (error: any) {
    console.error('[情书] ❌ 发送每日情书失败');
    console.error('[情书]   - 错误类型:', error.name);
    console.error('[情书]   - 错误消息:', error.message);
    console.error('[情书]   - 错误状态码:', error.statusCode);
    console.error('[情书]   - 原始错误:', JSON.stringify(error.rawError || error, null, 2));
    console.error('[情书]   - 错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 批量发送每日情书给所有用户
 * 用于 Cron Job 定时任务
 * 错误处理：某个用户失败不影响其他用户
 */
export async function sendDailyLoveLetterToAll() {
  const { prisma } = await import('@/lib/prisma');

  // 从数据库获取所有用户
  const users = await prisma.user.findMany({
    include: { profile: true },
  });

  console.log(`[Cron] 找到 ${users.length} 个用户`);

  const results = {
    total: users.length,
    success: 0,
    failed: 0,
    errors: [] as {
      email: string;
      errorName: string;
      errorMessage: string;
      statusCode?: number;
      rawError?: any;
    }[],
  };

  // 逐个发送（避免并发过高被限流）
  for (const user of users) {
    const userName = user.profile?.nickname || user.email.split('@')[0];

    try {
      await sendDailyLoveLetter(user.email, userName);
      results.success++;
      console.log(`[Cron] ✅ ${user.email}`);
    } catch (error: any) {
      results.failed++;

      // 提取详细的错误信息
      const errorDetail = {
        email: user.email,
        errorName: error.name || 'UnknownError',
        errorMessage: error.message || '未知错误',
        statusCode: error.statusCode,
        rawError: error.rawError || error,
      };

      results.errors.push(errorDetail);

      console.error(`[Cron] ❌ ${user.email}`);
      console.error(`[Cron]   - 错误名称: ${errorDetail.errorName}`);
      console.error(`[Cron]   - 错误消息: ${errorDetail.errorMessage}`);
      console.error(`[Cron]   - 状态码: ${errorDetail.statusCode || 'N/A'}`);
    }
  }

  console.log(`[Cron] 批量发送完成：成功 ${results.success}，失败 ${results.failed}`);

  return results;
}

/**
 * 发送 AI 接口健康检查报警邮件
 * @param serviceName 服务名称（如：EvoLink API）
 * @param errorMessage 错误信息
 * @param errorDetails 详细错误信息
 */
export async function sendAlertEmail(
  serviceName: string,
  errorMessage: string,
  errorDetails?: any
) {
  try {
    // 验证参数
    if (!serviceName || !errorMessage) {
      const error = new Error('缺少必要参数：serviceName 或 errorMessage');
      console.error('[报警邮件] ❌', error.message);
      throw error;
    }

    // 获取收件人邮箱（报警邮件总是发送给管理员）
    const recipientEmail = process.env.ALERT_EMAIL || 'billycui134@gmail.com';
    const fromAddress = `${FROM_NAME} <${FROM_EMAIL}>`;

    console.log('[报警邮件] 🚨 准备发送报警邮件');
    console.log('[报警邮件]   - 发件人:', fromAddress);
    console.log('[报警邮件]   - 收件人:', recipientEmail);
    console.log('[报警邮件]   - 服务名称:', serviceName);
    console.log('[报警邮件]   - 错误信息:', errorMessage);

    // 格式化时间
    const timeStr = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    // 构建邮件内容
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚨 AI 接口异常报警</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">请立即检查服务状态</p>
        </div>
        <div style="background-color: #fff5f5; padding: 30px; border-radius: 0 0 12px 12px; border: 2px solid #ff6b6b;">
          <h2 style="color: #333; margin-top: 0;">报警详情</h2>

          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: bold;">服务名称</p>
            <p style="margin: 0; color: #333; font-size: 18px; font-weight: bold;">${serviceName}</p>
          </div>

          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: bold;">发生时间</p>
            <p style="margin: 0; color: #333; font-size: 16px;">${timeStr}</p>
          </div>

          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: bold;">错误信息</p>
            <p style="margin: 0; color: #e53e3e; font-size: 16px; font-family: monospace; background-color: #fff5f5; padding: 10px; border-radius: 4px;">${errorMessage}</p>
          </div>

          ${errorDetails ? `
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: bold;">详细错误</p>
            <pre style="margin: 0; color: #666; font-size: 12px; background-color: #f7fafc; padding: 15px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(errorDetails, null, 2)}</pre>
          </div>
          ` : ''}

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>建议操作：</strong><br>
              1. 检查服务配置（API Key、Endpoint 等）<br>
              2. 查看服务提供商状态页<br>
              3. 检查服务日志和错误信息<br>
              4. 如果持续失败，考虑切换备用服务
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p style="margin: 0;">此邮件由纸片人男友自动发送 - AI 接口健康检查系统</p>
        </div>
      </div>
    `;

    // 发送邮件
    const resend = getResend();

    console.log('[报警邮件] 📤 调用 Resend API 发送报警邮件...');

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `🚨 报警：${serviceName} 异常 - ${timeStr}`,
      html: htmlContent,
    });

    // 检查 Resend API 返回的错误
    if (error) {
      console.error('[报警邮件] ❌ Resend API 返回错误');
      console.error('[报警邮件]   - 错误名称:', error.name);
      console.error('[报警邮件]   - 错误消息:', error.message);
      console.error('[报警邮件]   - 错误状态码:', error.statusCode);
      console.error('[报警邮件]   - 完整错误对象:', JSON.stringify(error, null, 2));

      const enhancedError = new Error(`Resend API 错误: ${error.message}`);
      (enhancedError as any).name = error.name;
      (enhancedError as any).statusCode = error.statusCode;
      (enhancedError as any).rawError = error;
      throw enhancedError;
    }

    // 成功发送
    console.log('[报警邮件] ✅ 报警邮件发送成功!');
    console.log('[报警邮件]   - 邮件 ID:', data?.id);
    console.log('[报警邮件]   - 发送时间:', new Date().toISOString());

    return { success: true, data };
  } catch (error: any) {
    console.error('[报警邮件] ❌ 发送报警邮件失败');
    console.error('[报警邮件]   - 错误类型:', error.name);
    console.error('[报警邮件]   - 错误消息:', error.message);
    console.error('[报警邮件]   - 错误状态码:', error.statusCode);
    console.error('[报警邮件]   - 原始错误:', JSON.stringify(error.rawError || error, null, 2));
    console.error('[报警邮件]   - 错误堆栈:', error.stack);
    throw error;
  }
}
