export default function Instructions({ steps }) {
  if (!steps) return null;

  return (
    <div className="mt-8 bg-gray-50 border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Building Instructions
      </h2>

      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap">{steps}</pre>
      </div>
    </div>
  );
}
