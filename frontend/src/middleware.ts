import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'banhosa_auth';

// Rotas que exigem login. Qualquer caminho fora desta lista (ex.: /login) fica liberado.
const PROTECTED_PREFIXES = ['/dashboard', '/agendamentos', '/pets', '/tutores', '/profissionais'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === '1';

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/agendamentos/:path*', '/pets/:path*', '/tutores/:path*', '/profissionais/:path*'],
};
