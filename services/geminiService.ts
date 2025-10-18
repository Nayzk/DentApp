/**
 * Calls the serverless API to generate a product description.
 * This keeps the GEMINI_API_KEY on the server only.
 */
export async function generateProductDescription(productName: string): Promise<string> {
  if (!productName) throw new Error("Product name cannot be empty.");
  const res = await fetch("/api/generate-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productName }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error || "Failed to generate description");
  }
  const data = await res.json();
  return data.text as string;
}
