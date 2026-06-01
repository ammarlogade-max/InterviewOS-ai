import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export const askGroq = async (system: string, user: string) => {
  if (!apiKey || apiKey === "replace_me") {
    return "Fallback response: AI service unavailable, using deterministic local logic.";
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  return completion.choices[0]?.message?.content || "No response";
};
