import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `${title}`,
    description: `Read the ${title} of Village Made.`,
    keywords: [title, 'village made policy', 'terms', 'privacy policy', 'refund policy'],
    alternates: {
      canonical: `/policies/${slug}`,
    },
    openGraph: {
      title: `${title} | Village Made`,
      description: `Read the ${title} of Village Made.`,
    },
  };
}

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
