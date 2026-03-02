const prisma = require("../prisma");
const { generateLegalText } = require("../services/aiService");
const { generateDocx } = require("../utils/docxGenerator");

// ─── Busca para ComboBox ──────────────────────────────────────────────────────
exports.searchClientes = async (req, res) => {
  try {
    const userId = req.userId;
    const q = req.query.q || "";
    const results = await prisma.client.findMany({
      where: { userId, nome: { contains: q, mode: "insensitive" } },
      take: 8,
      select: { id: true, nome: true, cpfCnpj: true, tipoPessoa: true },
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro na busca de clientes." });
  }
};

exports.searchQualificacoes = async (req, res) => {
  try {
    const userId = req.userId;
    const q = req.query.q || "";
    const results = await prisma.qualification.findMany({
      where: { userId, nome: { contains: q, mode: "insensitive" } },
      take: 8,
      select: { id: true, nome: true, polo: true },
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro na busca de qualificações." });
  }
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const userId = req.userId;
    const processos = await prisma.processo.findMany({
      where: { userId },
      include: {
        clientes: { include: { cliente: true, qualificacao: true } },
        envolvidos: true,
        custos: true,
        acao: true,
        juizo: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(processos);
  } catch (err) {
    console.error("ERRO /processos:", err);
    res.status(500).json({ message: "Erro ao listar processos." });
  }
};

exports.getOne = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const processo = await prisma.processo.findFirst({
      where: { id, userId },
      include: {
        clientes: { include: { cliente: true, qualificacao: true } },
        envolvidos: true,
        custos: { orderBy: { data: "desc" } },
        acao: true,
        juizo: true,
      },
    });
    if (!processo) return res.status(404).json({ message: "Processo não encontrado." });
    res.json(processo);
  } catch (err) {
    console.error("ERRO GET /processos/:id:", err);
    res.status(500).json({ message: "Erro ao buscar processo." });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      pasta, titulo, numeroProcesso, linkTribunal, objeto,
      valorCausa, distribuidoEm, valorCondenacao, observacoes,
      responsavel, acesso, movimentacao, honorarios, parcerias, prazos,
      juizoId, juizoLivre, acaoId, acaoLivre, instancia,
      clientes, envolvidos, custos,
    } = req.body;

    if (!titulo) return res.status(400).json({ message: "Título é obrigatório." });

    const processo = await prisma.processo.create({
      data: {
        userId, pasta, titulo, numeroProcesso, linkTribunal, objeto,
        valorCausa: valorCausa ? parseFloat(valorCausa) : null,
        distribuidoEm: distribuidoEm ? new Date(distribuidoEm) : null,
        valorCondenacao: valorCondenacao ? parseFloat(valorCondenacao) : null,
        observacoes, responsavel,
        acesso: acesso || "PRIVADO",
        movimentacao, honorarios, parcerias, prazos,
        juizoId: juizoId || null,
        juizoLivre: juizoId ? null : (juizoLivre || null),
        acaoId: acaoId || null,
        acaoLivre: acaoId ? null : (acaoLivre || null),
        instancia: instancia || null,
        clientes: clientes?.length ? {
          create: clientes.map((c) => ({
            clienteId: c.clienteId || null,
            clienteLivre: c.clienteId ? null : (c.clienteLivre || null),
            qualificacaoId: c.qualificacaoId || null,
            qualLivre: c.qualificacaoId ? null : (c.qualLivre || null),
          })),
        } : undefined,
        envolvidos: envolvidos?.length ? {
          create: envolvidos.map((e) => ({
            nome: e.nome,
            papel: e.papel || null,
            documento: e.documento || null,
            contato: e.contato || null,
          })),
        } : undefined,
        custos: custos?.length ? {
          create: custos.filter(c => !c.id).map((c) => ({
            descricao: c.descricao,
            valor: parseFloat(c.valor),
            data: new Date(c.data),
            tipo: c.tipo,
            pago: c.pago || false,
          })),
        } : undefined,
      },
      include: {
        clientes: { include: { cliente: true, qualificacao: true } },
        envolvidos: true,
        custos: true,
        acao: true,
        juizo: true,
      },
    });
    res.status(201).json(processo);
  } catch (err) {
    console.error("ERRO POST /processos:", err);
    res.status(500).json({ message: "Erro ao criar processo." });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      pasta, titulo, numeroProcesso, linkTribunal, objeto,
      valorCausa, distribuidoEm, valorCondenacao, observacoes,
      responsavel, acesso, movimentacao, honorarios, parcerias, prazos,
      juizoId, juizoLivre, acaoId, acaoLivre, instancia,
      clientes, envolvidos, custos,
    } = req.body;

    const existing = await prisma.processo.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "Processo não encontrado." });

    await prisma.processo.update({
      where: { id },
      data: {
        pasta, titulo, numeroProcesso, linkTribunal, objeto,
        valorCausa: valorCausa ? parseFloat(valorCausa) : null,
        distribuidoEm: distribuidoEm ? new Date(distribuidoEm) : null,
        valorCondenacao: valorCondenacao ? parseFloat(valorCondenacao) : null,
        observacoes, responsavel,
        acesso: acesso || "PRIVADO",
        movimentacao, honorarios, parcerias, prazos,
        juizoId: juizoId || null,
        juizoLivre: juizoId ? null : (juizoLivre || null),
        acaoId: acaoId || null,
        acaoLivre: acaoId ? null : (acaoLivre || null),
        instancia: instancia || null,
      },
    });

    await prisma.processoCliente.deleteMany({ where: { processoId: id } });
    await prisma.processoEnvolvido.deleteMany({ where: { processoId: id } });

    if (clientes?.length) {
      await prisma.processoCliente.createMany({
        data: clientes.map((c) => ({
          processoId: id,
          clienteId: c.clienteId || null,
          clienteLivre: c.clienteId ? null : (c.clienteLivre || null),
          qualificacaoId: c.qualificacaoId || null,
          qualLivre: c.qualificacaoId ? null : (c.qualLivre || null),
        })),
      });
    }

    if (envolvidos?.length) {
      await prisma.processoEnvolvido.createMany({
        data: envolvidos.map((e) => ({
          processoId: id,
          nome: e.nome,
          papel: e.papel || null,
          documento: e.documento || null,
          contato: e.contato || null,
        })),
      });
    }

    // Apenas novos custos (sem id)
    const newCustos = (custos || []).filter(c => !c.id);
    if (newCustos.length) {
      await prisma.custoProcessual.createMany({
        data: newCustos.map((c) => ({
          processoId: id,
          descricao: c.descricao,
          valor: parseFloat(c.valor),
          data: new Date(c.data),
          tipo: c.tipo,
          pago: c.pago || false,
        })),
      });
    }

    const updated = await prisma.processo.findFirst({
      where: { id },
      include: {
        clientes: { include: { cliente: true, qualificacao: true } },
        envolvidos: true,
        custos: { orderBy: { data: "desc" } },
        acao: true,
        juizo: true,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("ERRO PUT /processos:", err);
    res.status(500).json({ message: "Erro ao atualizar processo." });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const result = await prisma.processo.deleteMany({ where: { id, userId } });
    if (result.count === 0) return res.status(404).json({ message: "Processo não encontrado." });
    res.json({ message: "Processo excluído." });
  } catch (err) {
    console.error("ERRO DELETE /processos:", err);
    res.status(500).json({ message: "Erro ao excluir processo." });
  }
};

// ─── Gerar minuta com IA (mantém compatibilidade com aiService existente) ─────
exports.gerarMinuta = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const processo = await prisma.processo.findFirst({
      where: { id, userId },
      include: {
        clientes: { include: { cliente: true, qualificacao: true } },
        envolvidos: true,
        acao: true,
        juizo: true,
      },
    });
    if (!processo) return res.status(404).json({ message: "Processo não encontrado." });

    const partes = processo.clientes.map((c) =>
      `${c.cliente?.nome || c.clienteLivre} (${c.qualificacao?.nome || c.qualLivre || "sem qualificação"})`
    ).join(", ");

    const envolvidos = processo.envolvidos.map((e) =>
      `${e.nome} — ${e.papel || "envolvido"}`
    ).join(", ");

    // Reutiliza o generateLegalText existente no seu aiService
    const generatedText = await generateLegalText({
      authorName: partes || processo.titulo,
      defendantName: envolvidos || "Não informado",
      cpfCnpj: processo.clientes[0]?.cliente?.cpfCnpj || "Não informado",
      vara: processo.juizo
        ? `${processo.juizo.tribunal} — ${processo.juizo.orgaoJulgador}`
        : (processo.juizoLivre || "Não informado"),
      caseValue: processo.valorCausa || 0,
      narrative: [
        `Ação: ${processo.acao?.nomeAcao || processo.acaoLivre || "Não informado"}`,
        `Objeto: ${processo.objeto || "Não informado"}`,
        `Observações: ${processo.observacoes || "Nenhuma"}`,
        `Honorários: ${processo.honorarios || "Não informado"}`,
        `Prazos: ${processo.prazos || "Não informado"}`,
      ].join("\n"),
    });

    // Salva o texto gerado no processo
    await prisma.processo.update({
      where: { id },
      data: { generatedText },
    });

    res.json({ texto: generatedText });
  } catch (err) {
    console.error("ERRO /processos/gerar-minuta:", err);
    res.status(500).json({ message: "Erro ao gerar minuta." });
  }
};

// ─── Download DOCX (mantém compatibilidade) ───────────────────────────────────
exports.downloadDocx = async (req, res) => {
  try {
    const { id } = req.params;
    const processo = await prisma.processo.findFirst({
      where: { id, userId: req.userId },
    });
    if (!processo) return res.status(404).json({ message: "Processo não encontrado." });
    if (!processo.generatedText) return res.status(400).json({ message: "Gere a minuta antes de baixar." });

    const buffer = await generateDocx(processo.generatedText);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="processo-${id}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error("Erro ao gerar DOCX:", err);
    res.status(500).json({ message: "Erro ao gerar documento." });
  }
};