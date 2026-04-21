import { z } from 'zod';

// 用户注册验证（只有邮箱和密码）
export const registerSchema = z.object({
  email: z.string().min(1, '邮箱不能为空').email('请输入有效的邮箱地址'),
  password: z.string().min(1, '密码不能为空').min(6, '密码至少需要6个字符'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
