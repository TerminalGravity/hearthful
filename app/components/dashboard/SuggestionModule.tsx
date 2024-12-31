export default function SuggestionModule() {
  const suggestions = [
    {
      title: "Plan a Family Reunion",
      description: "It's been a while since everyone got together. Why not plan a big family reunion?",
      icon: "🎉",
      action: "Plan Now",
      href: "/events/new?type=reunion",
    },
    {
      title: "Start a Photo Album",
      description: "Create a shared album to collect memories from recent gatherings.",
      icon: "📸",
      action: "Create Album",
      href: "/photos/albums/new",
    },
    {
      title: "Share Family Recipes",
      description: "Add your favorite family recipes to share with everyone.",
      icon: "👩‍🍳",
      action: "Add Recipe",
      href: "/meals/new",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Suggestions</h2>
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.title}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{suggestion.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium">{suggestion.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{suggestion.description}</p>
                <a
                  href={suggestion.href}
                  className="inline-block mt-2 text-sm text-black hover:text-gray-700"
                >
                  {suggestion.action} →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 