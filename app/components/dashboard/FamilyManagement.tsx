import Link from 'next/link';

export default function FamilyManagement() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Family Groups</h2>
        <Link 
          href="/families/create" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Create Group
        </Link>
      </div>
      
      <div className="space-y-4">
        <Link href="/families/join" className="block">
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
      </div>
    </div>
  );
} 