const prisma = require("../prisma");

exports.financeiro = async (req, res) => {
  try {
    const userId = req.userId;
    const { clienteId, previsaoDias = "30" } = req.query;
    const dias = parseInt(previsaoDias);

    // ─── Filtro base ───────────────────────────────────────────────────────────
    const processoWhere = {
      userId,
      ...(clienteId ? { clientes: { some: { clienteId } } } : {}),
    };

    // ─── KPI 1: Faturamento (lançamentos pagos) ────────────────────────────────
    const faturamento = await prisma.lancamento.aggregate({
      where: { status: "PAGO", processo: processoWhere },
      _sum: { valorTotal: true },
    });

    // ─── KPI 2: Inadimplência (atrasados) ─────────────────────────────────────
    const inadimplencia = await prisma.lancamento.aggregate({
      where: { status: "ATRASADO", processo: processoWhere },
      _sum: { valorTotal: true },
    });

    // ─── KPI 3: Previsão de recebimento ───────────────────────────────────────
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);

    const previsao = await prisma.lancamento.aggregate({
      where: {
        status: "PENDENTE",
        dataVencimento: { gte: hoje, lte: dataLimite },
        processo: processoWhere,
      },
      _sum: { valorTotal: true },
    });

    // ─── KPI 4: Saldo de repassess ────────────────────────────────────────────
    const repassesAbertos = await prisma.repasse.findMany({
      where: { pago: false, processo: processoWhere },
      include: {
        processo: {
          include: { lancamentos: { where: { status: "PAGO" } } },
        },
      },
    });

    const saldoRepassess = repassesAbertos.reduce((acc, r) => {
      const totalPago = r.processo.lancamentos.reduce((s, l) => s + l.valorTotal, 0);
      return acc + (totalPago * r.percentual / 100);
    }, 0);

    // ─── Gráfico 1: Evolução mensal (últimos 12 meses) ────────────────────────
    const dozeAtras = new Date();
    dozeAtras.setMonth(dozeAtras.getMonth() - 11);
    dozeAtras.setDate(1);
    dozeAtras.setHours(0, 0, 0, 0);

    const lancamentosMensais = await prisma.lancamento.findMany({
      where: {
        dataVencimento: { gte: dozeAtras },
        processo: processoWhere,
      },
      select: {
        valorTotal: true,
        status: true,
        dataVencimento: true,
      },
    });

    // Agrupa por mês
    const mesesMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      mesesMap[key] = { mes: key, previsto: 0, recebido: 0 };
    }

    lancamentosMensais.forEach(l => {
      const key = l.dataVencimento.toISOString().slice(0, 7);
      if (mesesMap[key]) {
        mesesMap[key].previsto += l.valorTotal;
        if (l.status === "PAGO") mesesMap[key].recebido += l.valorTotal;
      }
    });

    const evolucaoMensal = Object.values(mesesMap).map(m => ({
      ...m,
      mes: new Date(m.mes + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    }));

    // ─── Gráfico 2: Status de pagamentos ──────────────────────────────────────
    const statusGrupos = await prisma.lancamento.groupBy({
      by: ["status"],
      where: { processo: processoWhere },
      _sum: { valorTotal: true },
      _count: true,
    });

    const statusPagamentos = statusGrupos.map(s => ({
      status: s.status,
      valor: s._sum.valorTotal || 0,
      count: s._count,
    }));

    // ─── Gráfico 3 + Tabela: Processos com cálculo líquido ────────────────────
    const processos = await prisma.processo.findMany({
      where: processoWhere,
      include: {
        lancamentos: true,
        repassess: true,
        custos: true,
        acao: { select: { nomeAcao: true, rito: true } },
        clientes: {
          include: { cliente: { select: { id: true, nome: true } } },
        },
      },
    });

    // Composição por área
    const areaMap = {};
    processos.forEach(p => {
      const area = p.acao?.rito || "OUTROS";
      const totalL = p.lancamentos.reduce((s, l) => s + l.valorTotal, 0);
      if (!areaMap[area]) areaMap[area] = 0;
      areaMap[area] += totalL;
    });

    const composicaoArea = Object.entries(areaMap)
      .map(([area, valor]) => ({ area: formatarArea(area), valor }))
      .sort((a, b) => b.valor - a.valor);

    // Honorários líquidos por processo
    const honorariosLiquidos = processos.map(p => {
      const totalBruto = p.lancamentos.reduce((s, l) => s + l.valorTotal, 0);
      const totalPago  = p.lancamentos.filter(l => l.status === "PAGO").reduce((s, l) => s + l.valorTotal, 0);
      const totalRepassess = p.repassess.reduce((s, r) => s + (totalPago * r.percentual / 100), 0);
      const totalCustos = p.custos.reduce((s, c) => s + c.valor, 0);
      const clientes = p.clientes.map(c => c.cliente?.nome || c.clienteLivre).filter(Boolean).join(", ");

      return {
        processoId: p.id,
        titulo: p.titulo,
        area: p.acao?.areaDireito || "OUTROS",
        clientes,
        totalBruto,
        totalPago,
        totalRepassess,
        totalCustos,
        liquido: totalPago - totalRepassess - totalCustos,
        lancamentos: p.lancamentos,
      };
    }).sort((a, b) => b.totalBruto - a.totalBruto);

    // ─── LTV (quando filtro por cliente) ──────────────────────────────────────
    let ltv = null;
    if (clienteId) {
      const cliente = await prisma.client.findFirst({
        where: { id: clienteId, userId },
        select: { id: true, nome: true, createdAt: true },
      });

      const totalRecebido = honorariosLiquidos.reduce((s, p) => s + p.totalPago, 0);
      const totalLiquido  = honorariosLiquidos.reduce((s, p) => s + p.liquido, 0);
      const inadCliente   = await prisma.lancamento.aggregate({
        where: { status: "ATRASADO", processo: processoWhere },
        _sum: { valorTotal: true },
      });

      ltv = {
        cliente,
        totalProcessos: processos.length,
        totalRecebido,
        totalLiquido,
        inadimplencia: inadCliente._sum.valorTotal || 0,
      };
    }

    res.json({
      kpis: {
        faturamento:   faturamento._sum.valorTotal || 0,
        inadimplencia: inadimplencia._sum.valorTotal || 0,
        previsao:      previsao._sum.valorTotal || 0,
        saldoRepassess,
        previsaoDias:  dias,
      },
      evolucaoMensal,
      statusPagamentos,
      composicaoArea,
      honorariosLiquidos,
      ltv,
    });
  } catch (err) {
    console.error("ERRO /dashboard/financeiro:", err);
    res.status(500).json({ message: "Erro ao carregar dashboard." });
  }
};

// ─── Busca clientes para o filtro ─────────────────────────────────────────────
exports.clientes = async (req, res) => {
  try {
    const userId = req.userId;
    const q = req.query.q || "";
    const clientes = await prisma.client.findMany({
      where: {
        userId,
        nome: { contains: q, mode: "insensitive" },
      },
      select: { id: true, nome: true, cpfCnpj: true },
      take: 20,
      orderBy: { nome: "asc" },
    });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar clientes." });
  }
};

function formatarArea(area) {
  const map = {
    COMUM:       "Rito Comum",
    SUMARISSIMO: "Sumaríssimo",
    ESPECIAL:    "Especial",
    OUTROS:      "Outros",
  };
  return map[area] || area;
}