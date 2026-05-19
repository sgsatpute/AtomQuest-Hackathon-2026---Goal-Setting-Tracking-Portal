import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const goals = await prisma.goal.findMany({
    include: {
      owner: true,
      checkIns: true,
    }
  });

  // Generate CSV Header
  let csv = 'Goal ID,Employee Name,Employee Role,Thrust Area,Title,UoM,Target,Weightage,Status,CheckIn Quarter,CheckIn Actual,CheckIn Status,Manager Comment\n';

  // Generate CSV Rows
  goals.forEach((goal: any) => {
    if (goal.checkIns.length === 0) {
      csv += `"${goal.id}","${goal.owner.name}","${goal.owner.role}","${goal.thrustArea}","${goal.title}","${goal.uom}","${goal.target}","${goal.weightage}","${goal.status}","","","",""\n`;
    } else {
      goal.checkIns.forEach((ci: any) => {
        csv += `"${goal.id}","${goal.owner.name}","${goal.owner.role}","${goal.thrustArea}","${goal.title}","${goal.uom}","${goal.target}","${goal.weightage}","${goal.status}","${ci.quarter}","${ci.actual}","${ci.status}","${ci.managerComment || ''}"\n`;
      });
    }
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="achievement_report.csv"'
    }
  });
}
