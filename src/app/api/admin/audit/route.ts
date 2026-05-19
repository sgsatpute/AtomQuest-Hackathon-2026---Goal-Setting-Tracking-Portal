import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit for dashboard
  });

  return NextResponse.json(logs);
}
