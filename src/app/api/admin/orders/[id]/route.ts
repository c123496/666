import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { orders } from '@/db/schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: rawId } = await params;

    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的订单 ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'paid', 'cancelled', 'refunded'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    const updated = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updated[0],
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: '更新订单失败' }, { status: 500 });
  }
}
