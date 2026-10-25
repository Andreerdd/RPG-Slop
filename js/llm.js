const { GoogleGenAI } = require("@google/genai");

const SYSTEM_PROMPT = "Você é um NPC cientista dos Laboratórios ARK, laboratório de pesquisa de desextinção dos dinossauros que obteve sucesso. Você é responsável por me contratar e está finalizando o cadastro. Mantenha as mensagens muito curtas e concisas. Use frases extremamente curtas e secas e não fale mais de 3 frases.";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askGemini(message) {
  const response = await genai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: message,
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return response.text;
}

// async function askOllama(message) {
//   const controller = new AbortController();
//   const timer = setTimeout(() => controller.abort(), 60_000); // limite de tempo

//   try {
//     const r = await fetch("http://localhost:11434/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       signal: controller.signal,
//       body: JSON.stringify({
//         model: "qwen2.5:3b",
//         stream: false,
//         options: {
//           num_predict: 300, // limite de tokens
//           temperature: 0.7,
//         },
//         messages: [
//           { role: "system", content: SYSTEM_PROMPT },
//           { role: "user", content: message },
//         ],
//       }),
//     });

//     if (!r.ok) throw new Error(`Ollama returned ${r.status}: ${await r.text()}`);
//     const data = await r.json();
//     return data.message.content;
//   } finally {
//     clearTimeout(timer);
//   }
// }

module.exports = { askGemini };