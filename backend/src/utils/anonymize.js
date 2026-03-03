/**
 * utils/anonymize.js
 *
 * LGPD — Anonimização de dados antes do envio para APIs de terceiros (Gemini).
 *
 * Fluxo:
 *   1. anonymizeForAI()   → substitui PII por tokens antes de enviar à IA
 *   2. restoreFromAI()    → reinsere os dados reais no texto gerado pela IA
 *
 * Isso garante que CPF, nomes e outros dados identificadores NUNCA
 * trafeguem para servidores externos (LGPD Art. 33 — Transferência Internacional).
 */

/**
 * Substitui dados pessoais reais por placeholders neutros.
 * O objeto retornado é seguro para enviar à API Gemini.
 *
 * @param {Object} data - Dados originais do processo
 * @returns {{ anonymized: Object, mapping: Object }}
 *   - anonymized : objeto com PII substituída (enviar à IA)
 *   - mapping    : mapa token → valor real (usar em restoreFromAI)
 */
function anonymizeForAI(data) {
  const { authorName, defendantName, cpfCnpj, ...rest } = data;

  // Tokens que a IA vai usar no texto gerado
  const TOKEN_AUTHOR    = "[[PARTE_AUTORA]]";
  const TOKEN_DEFENDANT = "[[PARTE_RE]]";
  const TOKEN_DOC       = "[[DOCUMENTO]]";

  const anonymized = {
    ...rest,                        // vara, caseValue, narrative — podem ir sem alteração
    authorName:    TOKEN_AUTHOR,
    defendantName: TOKEN_DEFENDANT,
    cpfCnpj:       TOKEN_DOC,       // CPF/CNPJ NUNCA deve ser enviado à IA
  };

  // Mapa inverso para restaurar os valores no texto final
  const mapping = {
    [TOKEN_AUTHOR]:    authorName    || "",
    [TOKEN_DEFENDANT]: defendantName || "",
    [TOKEN_DOC]:       cpfCnpj       || "",
  };

  return { anonymized, mapping };
}

/**
 * Reinsere os dados reais nos tokens deixados pela IA no texto gerado.
 *
 * @param {string} generatedText - Texto retornado pela API Gemini
 * @param {Object} mapping       - Mapa retornado por anonymizeForAI()
 * @returns {string} Texto final com nomes e documento reais
 */
function restoreFromAI(generatedText, mapping) {
  let restored = generatedText;
  for (const [token, realValue] of Object.entries(mapping)) {
    // Substitui todas as ocorrências do token pelo valor real
    restored = restored.split(token).join(realValue);
  }
  return restored;
}

module.exports = { anonymizeForAI, restoreFromAI };
