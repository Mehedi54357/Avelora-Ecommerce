import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Client-side AdminLayout and AuthGuard handle authentication securely against the backend API
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
