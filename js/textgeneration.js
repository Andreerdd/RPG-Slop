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

module.exports = { askGemini };