export default function IdeasList({ ideas, onSelect }) {
  if (!ideas?.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">
        Choose a Build
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ideas.map((idea, index) => (
          <button
            key={index}
            onClick={() => onSelect(idea)}
            className="bg-green-100 text-green-800 font-medium py-4 rounded-xl
                       hover:bg-green-200 transition"
          >
            {idea.name}
          </button>
        ))}
      </div>
    </div>
  );
}
