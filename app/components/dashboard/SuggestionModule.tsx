export default function SuggestionModule() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold mb-4">AI Suggestions</h2>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-purple-50">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Suggested Activity</h3>
              <p className="text-sm text-gray-600 mt-1">Based on your family's preferences, try "Family Trivia Night" for your next gathering!</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-green-50">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Recipe Suggestion</h3>
              <p className="text-sm text-gray-600 mt-1">Try making "Family Style Lasagna" - it accommodates everyone's dietary preferences!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 