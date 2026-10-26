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

/**
 * Gera uma imagem com base nas instruções dadas, utilizando Nano Banana.
 * Informações sobre a api do Nano Banana: https://ai.google.dev/gemini-api/docs/image-generation
 * @param {String} prompt instrução para a criação da imagem
 * @return {Promise<String>} Promessa com o url da imagem, pronto para colocar numa tag HTML.
 */
async function generateImageWithNanoBanana(prompt) {
  const response = await genai.interactions.create({
    model: "gemini-nano-banana-2.1",
    input: prompt,

    // Força retornar apenas imagens, sem o texto descritivo
    response_format: [
      { type: "image" }
    ],
  });

  // Obtém o blob retornado
  const generatedImage = response.output_image;
  if (!generatedImage)
    throw new Error("Erro na geração da imagem. O limite pode ter sido atingido.");

  return `data:${generatedImage.mime_type};base64,${generatedImage.data}`;
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

module.exports = { askGemini, generateImageWithNanoBanana };