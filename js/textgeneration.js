const { GoogleGenAI } = require("@google/genai");

const SYSTEM_PROMPT = "Você é um NPC cientista dos Laboratórios ARK, laboratório de pesquisa de desextinção dos dinossauros que obteve sucesso. Você é responsável por me contratar e está finalizando o cadastro. Mantenha as mensagens muito curtas e concisas. Use frases extremamente curtas e secas e não fale mais de 3 frases.";
const AVATAR_PROMPT = process.env.AVATAR_PROMPT || `Você é um assistente de IA com a função de converter um texto descritivo em um prompt para geração de imagens com IA. NÃO inclua descrições do fundo. Você deve gerar APENAS a descrição do personagem. EXEMPLO DE ENTRADA: "Lucas é um homem velho com cabelos longos grisalhos. Seus olhos são vermelhos e sua barba é longa e desgrenhada". EXEMPLO DE SAÍDA: "An old man with pale skin, short messy black hair, a long untamed beard, and piercing red eyes". Retone APENAS o trecho de prompt descritivo do personagem. A saída deve SEMPRE ser em inglês.`;

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askGemini(message) {
  const response = await genai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: message,
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return response.text;
}

async function generateAvatarPrompt(appearance) {
  console.log(appearance)
  const response = await genai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: appearance,
    config: { systemInstruction: AVATAR_PROMPT },
  });

  return response.text;
}

module.exports = { askGemini, generateAvatarPrompt };