import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const logs = await prisma.escalationLog.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(logs);
}

export async function POST() {
  // Simulate the Rule-Based Escalation Engine
  
  // Rule 1: Manager has not approved goals (Goals stuck in Pending)
  const pendingGoals = await prisma.goal.findMany({
    where: { status: 'Pending' },
    include: { owner: { include: { manager: true } } }
  });

  const newLogs = [];

  for (const goal of pendingGoals) {
    if (goal.owner.manager) {
      const log = await prisma.escalationLog.create({
        data: {
          ruleTrigger: 'Manager Approval Delay',
          targetUser: goal.owner.manager.name,
          level: 'Manager',
          message: `Goal "${goal.title}" submitted by ${goal.owner.name} is pending approval.`
        }
      });
      newLogs.push(log);
    }
  }

  // Rule 2: Employee has not submitted goals (Weight < 100%)
  const users = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: { goals: true }
  });

  for (const user of users) {
    const totalWeight = user.goals.reduce((acc, g) => acc + g.weightage, 0);
    if (totalWeight < 100) {
      const log = await prisma.escalationLog.create({
        data: {
          ruleTrigger: 'Incomplete Goal Submission',
          targetUser: user.name,
          level: 'Employee',
          message: `User has only allocated ${totalWeight}% of their goal weightage.`
        }
      });
      newLogs.push(log);
    }
  }

  return NextResponse.json({ success: true, generated: newLogs.length });
}
