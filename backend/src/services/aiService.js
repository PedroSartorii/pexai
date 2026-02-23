require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Você é um advogado experiente especializado em redigir peças jurídicas no Brasil.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  return response.choices[0].message.content;
}

module.exports = { buildPrompt, generateLegalText };