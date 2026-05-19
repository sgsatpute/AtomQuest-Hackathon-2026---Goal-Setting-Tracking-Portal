import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('userRole');
  cookieStore.delete('userName');

  return NextResponse.redirect(new URL('/', request.url));
}
