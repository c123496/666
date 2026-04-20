import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: rawId } = await params;

    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的用户 ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'suspended', 'deleted'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    const updated = await db
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updated[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}
