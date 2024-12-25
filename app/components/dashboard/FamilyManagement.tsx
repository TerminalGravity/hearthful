"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Family {
  id: string;
  name: string;
  description: string;
  _count: {
    members: number;
    events: number;
    meals: number;
    games: number;
  };
}

export default function FamilyManagement() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFamilies() {
      try {
        const response = await fetch('/api/families');
        if (!response.ok) {
          throw new Error('Failed to fetch families');
        }
        const data = await response.json();
        setFamilies(data);
      } catch (error) {
        setError('Failed to load families');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFamilies();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Family Groups</h2>
        <Link 
          href="/families" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : families.length === 0 ? (
          <Link href="/families" className="block">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <div className="rounded-full bg-blue-50 p-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Join or Create Family</h3>
                <p className="text-sm text-gray-500">Connect with your family members</p>
              </div>
            </div>
          </Link>
        ) : (
          <>
            {families.slice(0, 3).map((family) => (
              <Link key={family.id} href={`/families/${family.id}`}>
                <div className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">{family.name}</h3>
                    <p className="text-sm text-gray-500">{family.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="font-medium">{family._count.members}</div>
                      <div className="text-xs">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{family._count.events}</div>
                      <div className="text-xs">Events</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {families.length > 3 && (
              <Link 
                href="/families"
                className="block text-sm text-center text-blue-600 hover:text-blue-500"
              >
                View all {families.length} families
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
} 