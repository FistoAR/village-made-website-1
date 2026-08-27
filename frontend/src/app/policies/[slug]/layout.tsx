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
    description: `Read the ${title} of Village Made Organics.`,
    keywords: [title, 'village made organics policy', 'terms', 'privacy policy', 'refund policy'],
    alternates: {
      canonical: `/policies/${slug}`,
    },
    openGraph: {
      title: `${title} | Village Made Organics`,
      description: `Read the ${title} of Village Made Organics.`,
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
