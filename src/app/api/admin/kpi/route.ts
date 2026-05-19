import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function GET() {
  // Return all users eligible to receive a shared KPI
  const users = await prisma.user.findMany({
    where: { role: { in: ['EMPLOYEE', 'MANAGER'] } },
    select: { id: true, name: true, role: true }
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const userRole = cookieStore.get('userRole')?.value;

  if (!userId || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { title, description, thrustArea, uom, target, weightage, assignToAll, targetUserId } = data;

  if (!title || !thrustArea || !uom || !target || !weightage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let targets: string[] = [];

  if (assignToAll) {
    const employees = await prisma.user.findMany({
      where: { role: { in: ['EMPLOYEE', 'MANAGER'] } },
      select: { id: true }
    });
    targets = employees.map(e => e.id);
  } else if (targetUserId) {
    targets = [targetUserId];
  } else {
    return NextResponse.json({ error: 'Specify a target user or assignToAll' }, { status: 400 });
  }

  const created = await prisma.goal.createMany({
    data: targets.map(ownerId => ({
      title,
      description: description || '',
      thrustArea,
      uom,
      target: parseFloat(target),
      weightage: parseFloat(weightage),
      status: 'Locked', // Shared KPIs are auto-locked (approved by Admin)
      ownerId,
    }))
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'SHARED_KPI_ASSIGNED',
      userId,
      details: `Admin assigned Shared KPI "${title}" to ${targets.length} user(s)`
    }
  });

  return NextResponse.json({ success: true, count: created.count });
}
