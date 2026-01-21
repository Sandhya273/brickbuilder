export default function BrickList({ bricks, onGenerateIdeas }) {
  if (!bricks?.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">
        Detected Bricks
      </h2>

      <ul className="space-y-2">
        {bricks.map((brick, index) => (
          <li
            key={index}
            className="bg-gray-50 border rounded-lg p-3 flex justify-between"
          >
            <span>
              {brick.name} – {brick.color}
            </span>
            <span className="text-sm text-gray-500">
              {brick.productId}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onGenerateIdeas}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full
                   hover:bg-blue-700 transition"
      >
        Generate Ideas
      </button>
    </div>
  );
}
