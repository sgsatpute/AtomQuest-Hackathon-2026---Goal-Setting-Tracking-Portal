import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const goals = await prisma.goal.findMany({
    include: { checkIns: true }
  });

  // Calculate Distribution by Thrust Area
  const distribution: Record<string, number> = {};
  goals.forEach((g: any) => {
    distribution[g.thrustArea] = (distribution[g.thrustArea] || 0) + 1;
  });

  // Calculate QoQ simple completion count
  const qoq: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  let totalCheckIns = 0;
  
  goals.forEach((g: any) => {
    g.checkIns.forEach((ci: any) => {
      if (ci.status === 'Completed' || ci.status === 'On Track') {
        if (qoq[ci.quarter] !== undefined) {
          qoq[ci.quarter]++;
        }
      }
      totalCheckIns++;
    });
  });

  return NextResponse.json({
    distribution,
    qoq,
    totalCheckIns
  });
}
