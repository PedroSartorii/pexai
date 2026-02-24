require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildPrompt(data) {
  return `
Você é um assistente jurídico especializado em direito brasileiro.
Com base nos dados abaixo, redija um texto jurídico completo, formal e bem estruturado.

## Dados do Processo

- **Autor:** ${data.authorName}
- **Réu:** ${data.defendantName}
- **CPF/CNPJ:** ${data.cpfCnpj}
- **Vara:** ${data.vara}
- **Valor da Causa:** R$ ${data.caseValue}

## Narrativa dos Fatos

${data.narrative}

## Instruções

- Use linguagem jurídica formal
- Estruture o texto em: Qualificação das Partes, Dos Fatos, Do Direito, Do Pedido
- Finalize com local, data e espaço para assinatura do advogado
- Seja objetivo e preciso
  `.trim();
}

async function generateLegalText(data) {
  const prompt = buildPrompt(data);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

module.exports = { buildPrompt, generateLegalText };