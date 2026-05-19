import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const formData = await request.formData();
  const userId = formData.get('userId') as String;

  if (!userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId as string }
  });

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set('userId', user.id);
  cookieStore.set('userRole', user.role);
  cookieStore.set('userName', user.name);

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
