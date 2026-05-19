import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('userRole')?.value;

  if (!userId || userRole !== 'MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { goalId, status } = data;

  if (!goalId || !status) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: { status },
    include: { owner: true }
  });

  // Write audit log
  await prisma.auditLog.create({
    data: {
      action: status === 'Locked' ? 'GOAL_APPROVED' : 'GOAL_REJECTED',
      userId,
      details: `Manager ${status === 'Locked' ? 'approved' : 'rejected'} goal "${updatedGoal.title}" for ${updatedGoal.owner.name}`
    }
  });

  return NextResponse.json(updatedGoal);
}
