import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

type Family = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    userId: string;
    role: string;
  }>;
};

export function useCurrentFamily() {
  const searchParams = useSearchParams();
  const familyId = searchParams.get('familyId');

  const { data: families, isLoading: isFamiliesLoading } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const response = await fetch('/api/families');
      if (!response.ok) {
        throw new Error('Failed to fetch families');
      }
      return response.json();
    },
  });

  const currentFamily = families?.find((family: Family) => family.id === familyId);

  return {
    families,
    currentFamily,
    isLoading: isFamiliesLoading,
  };
} 