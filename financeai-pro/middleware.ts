import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(tr|en)/:path*']
};
