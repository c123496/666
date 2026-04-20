import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { orders } from '@/db/schema';

export async function GET(
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

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: '获取订单详情失败' }, { status: 500 });
  }
}
