import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const totalUsers = await prisma.user.count();
  const totalGoals = await prisma.goal.count();
  const lockedGoals = await prisma.goal.count({ where: { status: 'Locked' } });

  return NextResponse.json({ totalUsers, totalGoals, lockedGoals });
}
