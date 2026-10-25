export type LineId = "coral" | "azul" | "lima";
export type Station = {
  id: string;
  name: string;
  x: number;
  y: number;
  area: string;
  accessible: boolean;
  note: string;
};
export const lines: Record<
  LineId,
  { name: string; code: string; color: string; stops: string[] }
> = {
  coral: {
    name: "Coral",
    code: "01",
    color: "#cf462f",
    stops: [
      "mirante",
      "mercado",
      "republica",
      "central",
      "jardim",
      "porto",
      "farol",
    ],
  },
  azul: {
    name: "Azul",
    code: "02",
    color: "#245fd0",
    stops: [
      "observatorio",
      "museu",
      "republica",
      "aurora",
      "universidade",
      "bosque",
    ],
  },
  lima: {
    name: "Lima",
    code: "03",
    color: "#526c23",
    stops: [
      "lago",
      "oficina",
      "universidade",
      "estufa",
      "jardim",
      "praia",
      "ilha",
    ],
  },
};
export const stations: Station[] = [
  {
    id: "mirante",
    name: "Mirante",
    x: 80,
    y: 250,
    area: "Alto da cidade",
    accessible: true,
    note: "O começo da linha, com vista para os telhados. Saída A: Praça do Vento.",
  },
  {
    id: "mercado",
    name: "Mercado",
    x: 200,
    y: 250,
    area: "Centro antigo",
    accessible: true,
    note: "Bancas, flores e café passado. Saída A: Mercado das Cores; saída B: Rua do Comércio.",
  },
  {
    id: "republica",
    name: "República",
    x: 320,
    y: 250,
    area: "Centro antigo",
    accessible: true,
    note: "Encontro das linhas Coral e Azul. A ligação entre plataformas fica no mezanino.",
  },
  {
    id: "central",
    name: "Central",
    x: 440,
    y: 250,
    area: "Centro",
    accessible: true,
    note: "Sob o relógio da praça, uma estação para todos os caminhos. Saída A: Praça Central.",
  },
  {
    id: "jardim",
    name: "Jardim",
    x: 560,
    y: 250,
    area: "Distrito verde",
    accessible: true,
    note: "Conexão Coral–Lima, com corredor interno. Saída B: Jardim das Águas.",
  },
  {
    id: "porto",
    name: "Porto",
    x: 680,
    y: 250,
    area: "Beira-rio",
    accessible: true,
    note: "Armazéns antigos e passeios à beira-rio. Saída A: Cais das Garças.",
  },
  {
    id: "farol",
    name: "Farol",
    x: 800,
    y: 250,
    area: "Beira-rio",
    accessible: false,
    note: "Fim da linha Coral. A saída tem escadas; esta estação fictícia ainda não possui elevador.",
  },
  {
    id: "observatorio",
    name: "Observatório",
    x: 320,
    y: 70,
    area: "Colina norte",
    accessible: true,
    note: "Saída A: Parque do Céu. O observatório da cidade fica a uma curta caminhada.",
  },
  {
    id: "museu",
    name: "Museu",
    x: 320,
    y: 160,
    area: "Centro antigo",
    accessible: false,
    note: "Saída A: Museu da Cidade. Acesso por escadas nesta simulação.",
  },
  {
    id: "aurora",
    name: "Aurora",
    x: 320,
    y: 340,
    area: "Bairro Aurora",
    accessible: true,
    note: "Uma vizinhança de ateliês e pequenas livrarias. Saída A: Rua das Letras.",
  },
  {
    id: "universidade",
    name: "Universidade",
    x: 320,
    y: 430,
    area: "Campus sul",
    accessible: true,
    note: "Conexão Azul–Lima, com elevadores entre plataformas. Saída A: Campus do Sol.",
  },
  {
    id: "bosque",
    name: "Bosque",
    x: 320,
    y: 520,
    area: "Parque sul",
    accessible: true,
    note: "Saída A: entrada norte do Bosque das Folhas. Bicicletário junto ao acesso.",
  },
  {
    id: "lago",
    name: "Lago",
    x: 80,
    y: 430,
    area: "Lago oeste",
    accessible: true,
    note: "O terminal junto à água. Saída A: Lago das Pedras; bicicletário no nível da rua.",
  },
  {
    id: "oficina",
    name: "Oficina",
    x: 200,
    y: 430,
    area: "Distrito criativo",
    accessible: false,
    note: "Galpões de cerâmica e marcenaria. A plataforma é acessada apenas por escadas.",
  },
  {
    id: "estufa",
    name: "Estufa",
    x: 440,
    y: 430,
    area: "Distrito verde",
    accessible: true,
    note: "Saída A: Horto das Estações. Plantas de todo tipo na vizinhança.",
  },
  {
    id: "praia",
    name: "Praia",
    x: 680,
    y: 160,
    area: "Orla leste",
    accessible: true,
    note: "Saída A: calçadão da Brisa. Estação coberta, com elevador e bicicletário.",
  },
  {
    id: "ilha",
    name: "Ilha",
    x: 800,
    y: 160,
    area: "Orla leste",
    accessible: true,
    note: "A última parada da Lima. Saída A: Ponte da Ilha, apenas para pedestres.",
  },
];
export const stationById = Object.fromEntries(
  stations.map((s) => [s.id, s]),
) as Record<string, Station>;
export const lineIds = Object.keys(lines) as LineId[];
export const stationLines = (id: string) =>
  lineIds.filter((l) => lines[l].stops.includes(id));
export type Edge = { from: string; to: string; line: LineId; minutes: number };
export const edges: Edge[] = lineIds.flatMap((line) =>
  lines[line].stops.slice(1).map((to, i) => ({
    from: lines[line].stops[i],
    to,
    line,
    minutes: line === "lima" && to === "jardim" ? 5 : i % 2 === 0 ? 3 : 2,
  })),
);
export type Preferences = {
  from: string;
  to: string;
  mode: "fast" | "simple";
  stepFree: boolean;
  works: boolean;
};
export type Journey = {
  edges: Edge[];
  minutes: number;
  transfers: number;
  stops: string[];
};
export const initial: Preferences = {
  from: "mirante",
  to: "ilha",
  mode: "fast",
  stepFree: false,
  works: false,
};
export function plan(p: Preferences): Journey | null {
  if (
    !Object.hasOwn(stationById, p.from) ||
    !Object.hasOwn(stationById, p.to) ||
    p.from === p.to
  )
    return null;
  if (
    p.stepFree &&
    (!stationById[p.from].accessible || !stationById[p.to].accessible)
  )
    return null;
  type Node = {
    at: string;
    line: LineId | null;
    path: Edge[];
    minutes: number;
    transfers: number;
    score: number;
  };
  const queue: Node[] = [
    { at: p.from, line: null, path: [], minutes: 3, transfers: 0, score: 3 },
  ];
  const visited = new Set<string>();
  while (queue.length) {
    queue.sort((a, b) => a.score - b.score || a.minutes - b.minutes);
    const n = queue.shift()!;
    const key = `${n.at}:${n.line}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (n.at === p.to)
      return {
        edges: n.path,
        minutes: n.minutes,
        transfers: n.transfers,
        stops: [p.from, ...n.path.map((e) => e.to)],
      };
    for (const e of edges) {
      if (p.works && e.from === "central" && e.to === "jardim") continue;
      if (e.from !== n.at && e.to !== n.at) continue;
      const change = n.line !== null && n.line !== e.line;
      if (change && p.stepFree && !stationById[n.at].accessible) continue;
      const minutes = n.minutes + e.minutes + (change ? 4 : 0);
      const transfers = n.transfers + (change ? 1 : 0);
      const next = { ...e, from: n.at, to: e.from === n.at ? e.to : e.from };
      queue.push({
        at: next.to,
        line: e.line,
        path: [...n.path, next],
        minutes,
        transfers,
        score: minutes + (p.mode === "simple" ? transfers * 1000 : 0),
      });
    }
  }
  return null;
}
export function groups(j: Journey) {
  const result: {
    line: LineId;
    from: string;
    to: string;
    minutes: number;
    count: number;
    direction: string;
  }[] = [];
  for (const edge of j.edges) {
    const last = result.at(-1);
    if (last?.line === edge.line) {
      last.to = edge.to;
      last.minutes += edge.minutes;
      last.count++;
    } else {
      const stops = lines[edge.line].stops;
      result.push({
        line: edge.line,
        from: edge.from,
        to: edge.to,
        minutes: edge.minutes,
        count: 1,
        direction:
          stops.indexOf(edge.to) > stops.indexOf(edge.from)
            ? stops.at(-1)!
            : stops[0],
      });
    }
  }
  return result;
}
export const routeKey = (p: Preferences) =>
  JSON.stringify([p.from, p.to, p.mode, p.stepFree, p.works]);
export function readSaved(raw: string | null): Preferences[] {
  try {
    const value = JSON.parse(raw || "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (p): p is Preferences =>
          !!p &&
          typeof p.from === "string" &&
          Object.hasOwn(stationById, p.from) &&
          typeof p.to === "string" &&
          Object.hasOwn(stationById, p.to) &&
          p.from !== p.to &&
          ["fast", "simple"].includes(p.mode) &&
          typeof p.stepFree === "boolean" &&
          typeof p.works === "boolean" &&
          plan(p) !== null,
      )
      .filter(
        (p, i, a) => a.findIndex((q) => routeKey(q) === routeKey(p)) === i,
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}
export function routeText(p: Preferences, j: Journey) {
  return (
    `DESVIO · Vila Brisa (cidade fictícia)\n${stationById[p.from].name} → ${stationById[p.to].name}\n${j.minutes} min estimados · ${j.transfers} baldeação(ões)\n\n` +
    groups(j)
      .map(
        (g) =>
          `Linha ${lines[g.line].code} ${lines[g.line].name}, sentido ${stationById[g.direction].name}: ${stationById[g.from].name} → ${stationById[g.to].name} (${g.count} trechos, ${g.minutes} min).`,
      )
      .join("\n") +
    `\n\nInclui 3 min de espera inicial e 4 min por baldeação. Não inclui caminhada fora das estações.\n${p.works ? "Obras simuladas: Central–Jardim interrompido." : "Rede simulada sem interrupções."}\nDemonstração de front-end. Não use para uma viagem real.\nhttps://gustapaz.github.io/desvio/`
  );
}
