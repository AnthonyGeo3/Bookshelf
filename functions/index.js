/**
 * Bookshelf Cloud Functions
 *
 * recommendBooks — takes a reader's rated-books + reviews digest and asks a
 * Haiku model for book suggestions. The Anthropic API key lives here (server
 * side) and is never shipped to the browser. Called from index.html via the
 * Firebase callable-functions SDK.
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const Anthropic = require("@anthropic-ai/sdk");

// Set once with:  firebase functions:secrets:set ANTHROPIC_API_KEY
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

exports.recommendBooks = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: "us-central1" },
  async (request) => {
    // Anonymous auth is the app's gate — just require a signed-in caller.
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }

    const { digest, exclude, count } = request.data || {};
    if (typeof digest !== "string" || digest.trim().length < 10) {
      throw new HttpsError("invalid-argument", "Missing reading-history digest.");
    }
    const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 8);
    const excludeList = Array.isArray(exclude) ? exclude.slice(0, 500) : [];

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

    const system =
      "You are a warm, well-read librarian who gives sharp, personal book recommendations. " +
      "You are given a reader's rated books and their own written reviews. Recommend books they " +
      "have NOT read that genuinely fit their taste, using the specifics of their reviews as evidence. " +
      "Favour real, well-regarded, findable books, and vary the authors you suggest. " +
      "Never recommend a book that appears in the exclude list.";

    const user =
      `Reader's history (rating out of 5, then their own review):\n${digest}\n\n` +
      (excludeList.length
        ? `Do NOT recommend any of these (already read or already suggested):\n${excludeList.join("\n")}\n\n`
        : "") +
      `Suggest ${n} books. For each: the exact title, the author, and one sentence ` +
      `(max ~20 words) on why THIS reader will like it, grounded in their ratings and reviews.`;

    let message;
    try {
      message = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: user }],
        // Structured output — guarantees clean JSON, no fragile parsing.
        output_config: {
          format: {
            type: "json_schema",
            schema: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      author: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["title", "author", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["recommendations"],
              additionalProperties: false,
            },
          },
        },
      });
    } catch (err) {
      console.error("Anthropic request failed:", err);
      throw new HttpsError("internal", "Recommendation service is unavailable.");
    }

    const text = message.content.find((b) => b.type === "text")?.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Could not parse model output:", text);
      throw new HttpsError("internal", "Recommendation service returned bad data.");
    }

    const recs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    return {
      recommendations: recs
        .filter((r) => r && typeof r.title === "string" && typeof r.author === "string")
        .map((r) => ({
          title: r.title.trim(),
          author: r.author.trim(),
          reason: typeof r.reason === "string" ? r.reason.trim() : "",
        })),
    };
  }
);
