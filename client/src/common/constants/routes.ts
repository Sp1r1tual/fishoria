export const PUBLIC_ROUTES = [
  '/welcome',
  '/reset-password',
  '/privacy',
  '/terms',
] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

export const isPublicRoute = (pathname: string): boolean => {
  return (PUBLIC_ROUTES as readonly string[]).includes(pathname);
};
