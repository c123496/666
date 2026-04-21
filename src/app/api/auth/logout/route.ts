import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '登出成功',
  });

  // 清除cookies
  response.cookies.delete('user_id');
  response.cookies.delete('username');

  return response;
}
