import { useState, useEffect } from "react";

export default function ModelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ class: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Leaf Disease Detection</h1>

      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
          setResult(null);
          setError(null);

          if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
          } else {
            setPreview(null);
          }
        }}
      />

      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Uploaded leaf"
            className="max-h-64 rounded border"
          />
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading || !file}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Predict"}
      </button>

      {error && (
        <p className="mt-4 text-red-500 font-bold">Error: {error}</p>
      )}

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <p>
            <b>Class:</b> {result.class}
          </p>
          <p>
            <b>Confidence:</b> {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
