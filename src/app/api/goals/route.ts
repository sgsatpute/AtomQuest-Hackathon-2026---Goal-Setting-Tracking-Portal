import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');

  if (!ownerId) {
    return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
  }

  const goals = await prisma.goal.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  // Basic Validations
  const userGoals = await prisma.goal.findMany({ where: { ownerId: userId } });
  
  if (userGoals.length >= 8) {
    return NextResponse.json({ error: 'Maximum 8 goals allowed' }, { status: 400 });
  }

  if (data.weightage < 10) {
    return NextResponse.json({ error: 'Minimum weightage per goal is 10%' }, { status: 400 });
  }

  const currentTotalWeight = userGoals.reduce((sum: number, g: any) => sum + g.weightage, 0);
  if (currentTotalWeight + data.weightage > 100) {
    return NextResponse.json({ error: 'Total weightage cannot exceed 100%' }, { status: 400 });
  }

  const newGoal = await prisma.goal.create({
    data: {
      title: data.title,
      description: data.description || '',
      thrustArea: data.thrustArea,
      uom: data.uom,
      target: parseFloat(data.target),
      weightage: parseFloat(data.weightage),
      status: 'Pending',
      ownerId: userId,
    }
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'GOAL_SUBMITTED',
      userId,
      details: `Employee submitted goal "${newGoal.title}" (Weight: ${newGoal.weightage}%, Area: ${newGoal.thrustArea})`
    }
  });

  return NextResponse.json(newGoal);
}
