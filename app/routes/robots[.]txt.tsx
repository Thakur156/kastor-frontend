import type { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async () => {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://kastordata.io/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );
};
