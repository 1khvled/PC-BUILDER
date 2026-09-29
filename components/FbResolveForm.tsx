"use client";

import { useState } from "react";

export default function FbResolveForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!trimmed.includes("facebook.com/marketplace/item/")) {
      setResult({
        ok: false,
        message: "Lien invalide. Collez un lien direct du type https://www.facebook.com/marketplace/item/...",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/fb-resolve?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.ok) {
        setResult({
          ok: true,
          message: data.note || "Lien reçu ! Analyse du tarif et comparaison avec le marché en cours.",
        });
        setUrl("");
      } else {
        setResult({
          ok: false,
          message: data.error || "Erreur lors de la résolution de l'annonce.",
        });
      }
    } catch {
      setResult({
        ok: false,
        message: "Erreur de connexion au serveur. Réessayez ultérieurement.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          name="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.facebook.com/marketplace/item/..."
          aria-label="Lien de l'annonce Facebook Marketplace"
          required
          className="flex-1 min-w-[260px] border border-slate-200 rounded px-3.5 py-2 text-xs bg-slate-50 focus:bg-white focus:border-[#2c87c3] outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Résolution...</span>
            </>
          ) : (
            <span>Résoudre le prix</span>
          )}
        </button>
      </form>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded text-xs flex items-start gap-2 border ${
            result.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <span className="font-bold">{result.ok ? "✓" : "✕"}</span>
          <span className="flex-1">{result.message}</span>
          <button
            onClick={() => setResult(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-1"
            aria-label="Fermer la notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
