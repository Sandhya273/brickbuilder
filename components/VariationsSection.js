'use client';

import { useEffect, useState } from 'react';
import { generateVariations } from '@/lib/variations';

export default function VariationsSection({ selectedIdea, inventoryText, onSelectVariation }) {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!selectedIdea?.name || variations.length > 0) return;

    let mounted = true;
    setLoading(true);

    generateVariations(selectedIdea.name, inventoryText)
      .then((vars) => {
        if (mounted) {
          setVariations(vars);
          if (vars.length > 0) {
            setActiveId(vars[0].id);
            onSelectVariation(vars[0]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load variations:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedIdea?.name, inventoryText, onSelectVariation]);

  if (!selectedIdea) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Variations</h2>

      {loading && <p className="text-gray-500">Generating creative variations...</p>}

      {!loading && variations.length === 0 && (
        <p className="text-gray-600">No variations available yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {variations.map((varItem) => (
          <div
            key={varItem.id}
            onClick={() => {
              setActiveId(varItem.id);
              onSelectVariation(varItem);
            }}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              activeId === varItem.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <h3 className="font-semibold text-lg">{varItem.name}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{varItem.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Difficulty: <span className="font-medium">{varItem.difficulty}</span>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {varItem.brickUsageDiff}
            </div>
            {varItem.missingBricks?.length > 0 && (
              <div className="mt-2 text-xs text-orange-600">
                Missing: {varItem.missingBricks.map((b) => `${b.qty}× ${b.color} ${b.type}`).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-50"
        onClick={() => {
          setLoading(true);
          generateVariations(selectedIdea.name, inventoryText)
            .then((newVars) => {
              setVariations((prev) => [
                ...prev,
                ...newVars.map((v, i) => ({ ...v, id: `extra-${Date.now() + i}` })),
              ]);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
        }}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate More Variations'}
      </button>
    </div>
  );
}