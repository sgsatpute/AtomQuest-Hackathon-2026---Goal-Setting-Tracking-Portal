import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const goalId = searchParams.get('goalId');

  if (!goalId) {
    return NextResponse.json({ error: 'goalId is required' }, { status: 400 });
  }

  const checkIns = await prisma.checkIn.findMany({
    where: { goalId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(checkIns);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  if (userRole === 'EMPLOYEE') {
    // Employee logging achievement
    const checkIn = await prisma.checkIn.create({
      data: {
        goalId: data.goalId,
        quarter: data.quarter,
        actual: parseFloat(data.actual),
        status: data.status,
      }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHECKIN_LOGGED',
        userId,
        details: `Employee logged ${data.quarter} check-in (Actual: ${data.actual}) for Goal ${data.goalId}`
      }
    });
    
    return NextResponse.json(checkIn);
  } else if (userRole === 'MANAGER') {
    // Manager updating comment
    const checkIn = await prisma.checkIn.update({
      where: { id: data.checkInId },
      data: { managerComment: data.managerComment }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'MANAGER_COMMENTED',
        userId,
        details: `Manager added comment to check-in ${data.checkInId}`
      }
    });
    
    return NextResponse.json(checkIn);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
