import { ReactNode } from 'react';

// Generate static params for all listing IDs
export async function generateStaticParams() {
  // In a real app, this would fetch from your API/database
  // For now, we'll generate params for the mock listings
  const listingIds = ['1', '2', '3'];
  
  return listingIds.map((id) => ({
    id: id,
  }));
}

export default function ListingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}