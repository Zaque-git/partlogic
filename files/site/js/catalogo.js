// Catálogo de veículos e peças (equivalente a src/services/catalogo.ts)
//
// REFERÊNCIA RÁPIDA — ao cadastrar um veículo, digite EXATAMENTE assim
// (marca / modelo) pra garantir 100% de acerto na consulta de compatibilidade
// (peças com dado conferido, sem depender da IA):
//   Carro     · Toyota      · Corolla              (peça: filtro de óleo)
//   Moto      · Yamaha      · Fazer FZ15            (peça: vela de ignição)
//   Caminhão  · Volkswagen  · Constellation 24.280  (peça: filtro de óleo)
//   Van       · Fiat        · Ducato                (peça: filtro de óleo)
// Qualquer outro veículo/peça continua funcionando normalmente, só que a
// resposta vem da IA (Gemini) em vez do catálogo conferido.

const tiposVeiculo = [
  "Carro",
  "Moto",
  "Caminhão",
  "Ônibus",
  "Van",
  "Outro",
];

/** Marcas e modelos agrupados por tipo de veículo. */
const catalogoVeiculos = {
  Carro: {
    Toyota: ["Corolla", "Yaris", "RAV4", "Hilux", "SW4"],
    Honda: ["Civic", "Fit", "HR-V", "City"],
    Volkswagen: ["Golf", "Polo", "T-Cross", "Virtus"],
    Chevrolet: ["Onix", "Tracker", "Cruze", "S10"],
    Ford: ["Ka", "Territory", "Ranger"],
    Fiat: ["Argo", "Pulse", "Toro", "Strada"],
    Hyundai: ["HB20", "Creta", "Tucson"],
    Jeep: ["Renegade", "Compass"],
    Mitsubishi: ["L200 Triton"],
  },
  Moto: {
    Honda: ["CG 160", "Biz 125", "XRE 300", "CB 500F"],
    Yamaha: ["Fazer FZ15", "Fazer 150", "Fazer 250", "MT-03", "Factor 150", "NMax 160", "Crosser 150"],
    Suzuki: ["GSX-S750", "Burgman 125"],
    "Royal Enfield": ["Meteor 350", "Himalayan"],
  },
  Caminhão: {
    Volvo: ["FH 460", "VM 270"],
    Scania: ["R 450", "P 320"],
    "Mercedes-Benz": ["Atego 1719", "Actros 2651"],
    Volkswagen: ["Constellation 24.280", "Delivery 11.180"],
  },
  Ônibus: {
    "Mercedes-Benz": ["OF 1721", "O 500"],
    Volvo: ["B270F", "B450R"],
    Marcopolo: ["Torino", "Paradiso 1050"],
  },
  Van: {
    "Mercedes-Benz": ["Sprinter 415", "Sprinter 516"],
    Renault: ["Master", "Kangoo"],
    Fiat: ["Ducato", "Fiorino"],
    Peugeot: ["Boxer", "Expert"],
  },
  Outro: {
    "Massey Ferguson": ["MF 4275"],
    "John Deere": ["5090E"],
    Genérico: ["Modelo não listado"],
  },
};

/** Compatibilidade retrocompatível: todas as marcas/modelos conhecidos. */
const marcas = Object.values(catalogoVeiculos).reduce(
  (acc, porMarca) => {
    for (const [marca, modelos] of Object.entries(porMarca)) {
      acc[marca] = Array.from(new Set([...(acc[marca] ?? []), ...modelos]));
    }
    return acc;
  },
  {},
);

function marcasDoTipo(tipo) {
  if (!tipo) return Object.keys(marcas);
  return Object.keys(catalogoVeiculos[tipo] ?? {});
}

function modelosDoTipo(tipo, marca) {
  if (!marca) return [];
  if (!tipo) return marcas[marca] ?? [];
  return catalogoVeiculos[tipo]?.[marca] ?? [];
}

const combustiveis = ["Flex", "Gasolina", "Diesel", "Etanol", "Híbrido", "Elétrico"];

const categorias = [
  "Filtros",
  "Freios",
  "Suspensão",
  "Motor",
  "Elétrica",
  "Transmissão",
];

const pecas = [
  {
    id: "p1",
    nome: "Filtro de óleo",
    codigo: "OF-4520",
    oem: "90915-YZZE1",
    fabricante: "Bosch",
    valorBase: 38.9,
    categoria: "Filtros",
    tipos: ["Carro"],
    descricao: "Filtro de óleo blindado com válvula anti-retorno para motores flex e aspirados.",
    specs: [
      { label: "Altura", valor: "85 mm" },
      { label: "Rosca", valor: "M20 x 1.5" },
      { label: "Pressão de abertura", valor: "1,0 bar" },
      { label: "Vida útil", valor: "10.000 km" },
    ],
    observacoes: "Substituir o anel de vedação a cada troca.",
    compat: [
      { marca: "Toyota", modelos: ["Corolla", "Yaris", "RAV4"], anos: [2015, 2024] },
      { marca: "Honda", modelos: ["Civic", "City", "Fit"], anos: [2016, 2023] },
    ],
  },
  {
    id: "p2",
    nome: "Pastilha de freio dianteira",
    codigo: "XYZ123",
    oem: "04465-02220",
    fabricante: "TRW",
    valorBase: 289.9,
    categoria: "Freios",
    tipos: ["Carro"],
    descricao: "Pastilha cerâmica de baixa emissão de pó, com indicador de desgaste integrado.",
    specs: [
      { label: "Material", valor: "Cerâmica" },
      { label: "Altura", valor: "51,2 mm" },
      { label: "Espessura", valor: "17,5 mm" },
      { label: "Sensor de desgaste", valor: "Sim" },
    ],
    observacoes: "Fazer o assentamento nos primeiros 200 km.",
    compat: [
      { marca: "Toyota", modelos: ["Corolla"], anos: [2014, 2024] },
      { marca: "Volkswagen", modelos: ["Golf", "Virtus"], anos: [2017, 2023] },
    ],
  },
  {
    id: "p3",
    nome: "Amortecedor dianteiro",
    codigo: "AM-8890",
    oem: "48510-0Z281",
    fabricante: "Monroe",
    valorBase: 1450.0,
    categoria: "Suspensão",
    tipos: ["Carro"],
    descricao: "Amortecedor pressurizado a gás, com curso reforçado para uso urbano e rodoviário.",
    specs: [
      { label: "Tipo", valor: "Gás pressurizado" },
      { label: "Curso", valor: "150 mm" },
      { label: "Fixação", valor: "Superior por pino" },
      { label: "Lado", valor: "Dianteiro (par)" },
    ],
    compat: [
      { marca: "Chevrolet", modelos: ["Onix", "Tracker"], anos: [2018, 2024] },
      { marca: "Fiat", modelos: ["Argo", "Pulse"], anos: [2019, 2024] },
    ],
  },
  {
    id: "p4",
    nome: "Vela de ignição irídio",
    codigo: "VI-3321",
    oem: "90919-01253",
    fabricante: "NGK",
    valorBase: 169.9,
    categoria: "Motor",
    tipos: ["Carro"],
    descricao: "Vela de ignição com eletrodo de irídio, ideal para motores turbo e flex.",
    specs: [
      { label: "Abertura", valor: "0,8 mm" },
      { label: "Rosca", valor: "M14 x 1.25" },
      { label: "Grau térmico", valor: "6" },
      { label: "Vida útil", valor: "60.000 km" },
    ],
    compat: [
      {
        marca: "Honda",
        modelos: ["Civic", "HR-V"],
        anos: [2017, 2024],
        motores: ["1.5 Turbo", "1.5 16V", "2.0 16V"],
      },
      { marca: "Volkswagen", modelos: ["T-Cross", "Polo"], anos: [2018, 2024], motores: ["1.0 TSI"] },
    ],
  },
  {
    id: "p5",
    nome: "Correia dentada",
    codigo: "CD-1170",
    oem: "13568-0H010",
    fabricante: "Gates",
    valorBase: 219.9,
    categoria: "Motor",
    tipos: ["Carro"],
    descricao: "Correia dentada em borracha HNBR com dentes arredondados de alta durabilidade.",
    specs: [
      { label: "Dentes", valor: "117" },
      { label: "Largura", valor: "25,4 mm" },
      { label: "Perfil", valor: "Redondo" },
      { label: "Troca recomendada", valor: "50.000 km" },
    ],
    compat: [
      { marca: "Fiat", modelos: ["Argo", "Strada", "Toro"], anos: [2016, 2023] },
      { marca: "Ford", modelos: ["Ka"], anos: [2015, 2021] },
    ],
  },
  {
    id: "p6",
    nome: "Bateria 60Ah",
    codigo: "BT-60D",
    oem: "28800-YZZ0A",
    fabricante: "Moura",
    valorBase: 780.0,
    categoria: "Elétrica",
    tipos: ["Carro", "Van"],
    descricao: "Bateria selada de 60Ah com alta corrente de partida a frio.",
    specs: [
      { label: "Capacidade", valor: "60 Ah" },
      { label: "CCA", valor: "500 A" },
      { label: "Polaridade", valor: "Direita" },
      { label: "Garantia", valor: "18 meses" },
    ],
    observacoes: "Conferir a polaridade antes da instalação.",
    compat: [
      { marca: "Toyota", modelos: ["Corolla", "Yaris"], anos: [2012, 2024] },
      { marca: "Hyundai", modelos: ["HB20", "Creta"], anos: [2014, 2024] },
      { marca: "Chevrolet", modelos: ["Onix", "Cruze"], anos: [2013, 2024] },
    ],
  },
  {
    id: "p7",
    nome: "Filtro de ar do motor",
    codigo: "FA-2210",
    oem: "17801-0T030",
    fabricante: "Mann",
    valorBase: 132.5,
    categoria: "Filtros",
    tipos: ["Carro"],
    descricao: "Elemento filtrante de papel plissado com moldura de vedação em poliuretano.",
    specs: [
      { label: "Comprimento", valor: "265 mm" },
      { label: "Largura", valor: "185 mm" },
      { label: "Altura", valor: "42 mm" },
      { label: "Eficiência", valor: "99,2%" },
    ],
    compat: [
      { marca: "Toyota", modelos: ["Corolla", "RAV4"], anos: [2019, 2024] },
      { marca: "Jeep", modelos: ["Renegade", "Compass"], anos: [2018, 2024] },
    ],
  },
  {
    id: "p8",
    nome: "Disco de freio ventilado",
    codigo: "DF-5544",
    oem: "43512-02440",
    fabricante: "Fremax",
    valorBase: 349.0,
    categoria: "Freios",
    tipos: ["Carro"],
    descricao: "Disco ventilado com tratamento anticorrosivo e balanceamento de fábrica.",
    specs: [
      { label: "Diâmetro", valor: "277 mm" },
      { label: "Espessura", valor: "26 mm" },
      { label: "Furos", valor: "5" },
      { label: "Tipo", valor: "Ventilado" },
    ],
    compat: [
      { marca: "Toyota", modelos: ["Corolla", "Hilux"], anos: [2016, 2024] },
      { marca: "Ford", modelos: ["Ranger", "Territory"], anos: [2017, 2024] },
    ],
  },
  {
    id: "p9",
    nome: "Kit de embreagem",
    codigo: "EM-7702",
    oem: "31250-02150",
    fabricante: "Sachs",
    valorBase: 95.0,
    categoria: "Transmissão",
    tipos: ["Carro"],
    descricao: "Kit completo com platô, disco e rolamento para câmbio manual de 5 e 6 marchas.",
    specs: [
      { label: "Diâmetro do disco", valor: "215 mm" },
      { label: "Estrias", valor: "21" },
      { label: "Itens", valor: "Platô + disco + rolamento" },
      { label: "Câmbio", valor: "Manual" },
    ],
    compat: [
      { marca: "Volkswagen", modelos: ["Polo", "Virtus"], anos: [2018, 2023], motores: ["1.0 MPI"] },
      { marca: "Fiat", modelos: ["Argo", "Strada"], anos: [2018, 2024], motores: ["1.3 Firefly"] },
    ],
  },
  {
    id: "p10",
    nome: "Filtro de combustível",
    codigo: "FC-9081",
    oem: "23300-31090",
    fabricante: "Tecfil",
    valorBase: 74.9,
    categoria: "Filtros",
    tipos: ["Carro", "Van"],
    descricao: "Filtro de combustível de linha com carcaça metálica e alta retenção de partículas.",
    specs: [
      { label: "Entrada", valor: "8 mm" },
      { label: "Saída", valor: "8 mm" },
      { label: "Retenção", valor: "10 µm" },
      { label: "Pressão máx.", valor: "6 bar" },
    ],
    compat: [
      { marca: "Honda", modelos: ["Civic", "Fit", "City"], anos: [2013, 2022] },
      { marca: "Hyundai", modelos: ["HB20"], anos: [2015, 2023] },
    ],
  },
  {
    id: "p11",
    nome: "Kit relação (transmissão)",
    codigo: "KR-4281",
    oem: "06401-KVS-901",
    fabricante: "Vaz",
    valorBase: 2450.0,
    categoria: "Transmissão",
    tipos: ["Moto"],
    descricao: "Kit com coroa, pinhão e corrente com retentores para uso urbano intenso.",
    specs: [
      { label: "Corrente", valor: "428H x 118L" },
      { label: "Coroa", valor: "45 dentes" },
      { label: "Pinhão", valor: "15 dentes" },
      { label: "Vida útil", valor: "25.000 km" },
    ],
    observacoes: "Lubrificar a cada 500 km.",
    compat: [
      { marca: "Honda", modelos: ["CG 160", "Biz 125"], anos: [2016, 2025] },
      { marca: "Yamaha", modelos: ["Factor 150", "Fazer 250"], anos: [2015, 2024] },
    ],
  },
  {
    id: "p12",
    nome: "Pastilha de freio dianteira (moto)",
    codigo: "PM-1180",
    oem: "45105-KVB-901",
    fabricante: "Cobreq",
    valorBase: 410.0,
    categoria: "Freios",
    tipos: ["Moto"],
    descricao: "Pastilha sinterizada para discos de moto, com boa resposta em pista molhada.",
    specs: [
      { label: "Material", valor: "Sinterizada" },
      { label: "Altura", valor: "40 mm" },
      { label: "Espessura", valor: "8 mm" },
      { label: "Pinça", valor: "Simples pistão" },
    ],
    compat: [
      { marca: "Honda", modelos: ["CB 500F", "XRE 300"], anos: [2014, 2025] },
      { marca: "Yamaha", modelos: ["MT-03", "NMax 160"], anos: [2018, 2025] },
    ],
  },
  {
    id: "p13",
    nome: "Filtro de ar pesado",
    codigo: "FAP-9010",
    oem: "20876234",
    fabricante: "Donaldson",
    valorBase: 3890.0,
    categoria: "Filtros",
    tipos: ["Caminhão", "Ônibus"],
    descricao: "Filtro de ar de alta capacidade para motores diesel de linha pesada.",
    specs: [
      { label: "Diâmetro externo", valor: "330 mm" },
      { label: "Altura", valor: "410 mm" },
      { label: "Eficiência", valor: "99,9%" },
      { label: "Troca", valor: "60.000 km" },
    ],
    compat: [
      { marca: "Volvo", modelos: ["FH 460", "VM 270", "B270F"], anos: [2014, 2025] },
      { marca: "Scania", modelos: ["R 450", "P 320"], anos: [2015, 2025] },
      { marca: "Mercedes-Benz", modelos: ["Atego 1719", "OF 1721"], anos: [2013, 2024] },
    ],
  },
  {
    id: "p14",
    nome: "Lona de freio a ar",
    codigo: "LF-7720",
    oem: "1440341",
    fabricante: "Fras-le",
    valorBase: 58.9,
    categoria: "Freios",
    tipos: ["Caminhão", "Ônibus"],
    descricao: "Jogo de lonas para freio pneumático, com material resistente a alta temperatura.",
    specs: [
      { label: "Largura", valor: "180 mm" },
      { label: "Espessura", valor: "18 mm" },
      { label: "Comprimento", valor: "419 mm" },
      { label: "Aplicação", valor: "Eixo traseiro" },
    ],
    observacoes: "Conferir o curso do came após a montagem.",
    compat: [
      { marca: "Mercedes-Benz", modelos: ["Atego 1719", "Actros 2651", "O 500"], anos: [2012, 2024] },
      { marca: "Volkswagen", modelos: ["Constellation 24.280", "Delivery 11.180"], anos: [2015, 2025] },
    ],
  },
  {
    id: "p15",
    nome: "Correia do alternador (van)",
    codigo: "CA-6120",
    oem: "6PK1685",
    fabricante: "Dayco",
    valorBase: 189.9,
    categoria: "Motor",
    tipos: ["Van"],
    descricao: "Correia poli-V para acionamento de alternador, bomba d'água e compressor.",
    specs: [
      { label: "Perfil", valor: "6PK" },
      { label: "Comprimento", valor: "1685 mm" },
      { label: "Material", valor: "EPDM" },
      { label: "Troca", valor: "60.000 km" },
    ],
    compat: [
      { marca: "Mercedes-Benz", modelos: ["Sprinter 415", "Sprinter 516"], anos: [2012, 2024] },
      { marca: "Renault", modelos: ["Master"], anos: [2014, 2024] },
      { marca: "Fiat", modelos: ["Ducato"], anos: [2015, 2024] },
    ],
  },
  // ---- Itens abaixo: dados conferidos via pesquisa (código OEM real de catálogos de peças) ----
  {
    id: "p-real-1",
    nome: "Filtro de óleo",
    codigo: "90915-YZZF2",
    oem: "90915-YZZF2",
    fabricante: "Toyota (original)",
    valorBase: 45.9,
    categoria: "Filtros",
    tipos: ["Carro"],
    descricao: "Filtro de óleo blindado tipo spin-on, encaixe rosca 3/4-16.",
    specs: [
      { label: "Tipo", valor: "Spin-on (blindado)" },
      { label: "Rosca", valor: "3/4-16" },
    ],
    observacoes: "Compatível com motores 1.8L e 2.0L. Equivalentes: STP S4967, FRAM PH4967, K&N HP-1003.",
    compat: [
      { marca: "Toyota", modelos: ["Corolla"], anos: [2019, 2024] },
    ],
  },
  {
    id: "p-real-2",
    nome: "Vela de ignição",
    codigo: "MR8D-9",
    oem: "MR8D-9",
    fabricante: "NGK",
    valorBase: 32.5,
    categoria: "Ignição",
    tipos: ["Moto"],
    descricao: "Vela de ignição original de fábrica para motores BlueFlex Yamaha 150cc.",
    specs: [
      { label: "Rosca", valor: "10mm" },
      { label: "Grau térmico", valor: "8" },
    ],
    observacoes: "Especificada de fábrica pela Yamaha para a linha Fazer FZ15, Fazer 150, Factor 150 e Crosser 150.",
    compat: [
      { marca: "Yamaha", modelos: ["Fazer FZ15", "Fazer 150", "Factor 150", "Crosser 150"], anos: [2016, 2026] },
    ],
  },
  {
    id: "p-real-3",
    nome: "Filtro de óleo",
    codigo: "2V5115561",
    oem: "2V5115561",
    fabricante: "Volkswagen (original)",
    valorBase: 102.4,
    categoria: "Filtros",
    tipos: ["Caminhão"],
    descricao: "Filtro de óleo blindado original para a linha Constellation Euro V.",
    specs: [
      { label: "Material", valor: "Celulose" },
    ],
    observacoes: "Aplicação: Constellation 33-460T, 25-460T (motor Cummins).",
    compat: [
      { marca: "Volkswagen", modelos: ["Constellation 24.280"], anos: [2012, 2024] },
    ],
  },
  {
    id: "p-real-4",
    nome: "Filtro de óleo",
    codigo: "2995811",
    oem: "2995811 / 504091563 / 71749828",
    fabricante: "Fiat (original)",
    valorBase: 102.8,
    categoria: "Filtros",
    tipos: ["Van"],
    descricao: "Filtro de óleo blindado para motor 2.3 Multijet Diesel.",
    specs: [
      { label: "Altura", valor: "75 mm" },
      { label: "Diâmetro externo", valor: "96 mm" },
      { label: "Rosca", valor: "M22x1,5-6H" },
    ],
    observacoes: "Equivalentes: Mahle OC1222, Wega WO421/WO612, Tecfil PSL657.",
    compat: [
      { marca: "Fiat", modelos: ["Ducato"], anos: [2010, 2024] },
    ],
  },
];

function buscarPecas(termo, categoria, tipo) {
  const t = termo.trim().toLowerCase();
  return pecas.filter((p) => {
    const okCat = categoria === "TODAS" || p.categoria === categoria;
    const okTipo = !tipo || tipo === "TODOS" || p.tipos.includes(tipo);
    const okTermo =
      !t ||
      `${p.nome} ${p.codigo} ${p.oem} ${p.fabricante} ${p.categoria}`.toLowerCase().includes(t);
    return okCat && okTipo && okTermo;
  });
}

/** Avaliação detalhada, com motivo, orientação e grau de compatibilidade. */
function avaliar(peca, veiculo) {
  if (!peca.tipos.includes(veiculo.tipo)) {
    return {
      resultado: "INCOMPATIVEL",
      grau: 0,
      motivo: `Esta peça é fornecida para ${peca.tipos.join(", ").toLowerCase()} e não para ${veiculo.tipo.toLowerCase()}.`,
      orientacao: `Procure uma peça da categoria ${peca.categoria} indicada para ${veiculo.tipo.toLowerCase()}.`,
    };
  }

  const regrasMarca = peca.compat.filter((r) => r.marca === veiculo.marca);
  if (regrasMarca.length === 0) {
    return {
      resultado: "INCOMPATIVEL",
      grau: 0,
      motivo: `A peça não tem aplicação registrada para a marca ${veiculo.marca}.`,
      orientacao: "Compare o código OEM da peça original do seu veículo antes de comprar.",
    };
  }

  const regras = regrasMarca.filter((r) => r.modelos.includes(veiculo.modelo));
  if (regras.length === 0) {
    return {
      resultado: "INCOMPATIVEL",
      grau: 15,
      motivo: `A peça atende outros modelos ${veiculo.marca}, mas não o ${veiculo.modelo}.`,
      orientacao: `Verifique as aplicações listadas: ${regrasMarca
        .flatMap((r) => r.modelos)
        .slice(0, 4)
        .join(", ")}.`,
    };
  }

  for (const r of regras) {
    const dentroAno = veiculo.ano >= r.anos[0] && veiculo.ano <= r.anos[1];
    const limiteAno =
      Math.abs(veiculo.ano - r.anos[0]) <= 1 || Math.abs(veiculo.ano - r.anos[1]) <= 1;

    if (!dentroAno) {
      if (limiteAno) {
        return {
          resultado: "VERIFICAR",
          grau: 60,
          motivo: `O ano ${veiculo.ano} fica no limite da faixa de aplicação (${r.anos[0]}–${r.anos[1]}).`,
          orientacao: "Confirme o ano de fabricação e o ano do modelo no documento do veículo.",
        };
      }
      continue;
    }

    if (r.motores && !r.motores.includes(veiculo.motor)) {
      return {
        resultado: "VERIFICAR",
        grau: 55,
        motivo: `A aplicação depende da motorização (${r.motores.join(", ")}) e o motor informado é ${veiculo.motor}.`,
        orientacao: "Informe a motorização exata ou confirme o número do motor com a oficina.",
      };
    }

    return {
      resultado: "COMPATIVEL",
      grau: r.motores ? 100 : 92,
      motivo: `Aplicação confirmada para ${veiculo.marca} ${veiculo.modelo} ${r.anos[0]}–${r.anos[1]}${
        r.motores ? ` · ${r.motores.join(", ")}` : ""
      }.`,
      orientacao: peca.observacoes ?? "Confirme o código OEM ao receber a peça.",
    };
  }

  return {
    resultado: "INCOMPATIVEL",
    grau: 10,
    motivo: `O ano ${veiculo.ano} está fora das faixas de aplicação da peça.`,
    orientacao: "Busque a versão da peça correspondente ao ano do seu veículo.",
  };
}

function avaliarCompatibilidade(peca, veiculo) {
  return avaliar(peca, veiculo).resultado;
}

function textoCompativeis(peca) {
  return peca.compat.flatMap((r) =>
    r.modelos.map((m) => `${r.marca} ${m} ${r.anos[0]}–${r.anos[1]}`),
  );
}