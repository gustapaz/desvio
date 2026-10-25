import { describe, it, expect } from "vitest";
import {
  edges,
  groups,
  initial,
  plan,
  readSaved,
  routeKey,
  routeText,
  stations,
} from "../src/network";
describe("Rede e trajetos", () => {
  it("possui 17 estações distintas e trechos com tempos positivos", () => {
    expect(stations.length).toBe(17);
    expect(new Set(stations.map((s) => s.id)).size).toBe(17);
    expect(edges.every((e) => e.minutes > 0)).toBe(true);
  });
  it("encontra o caminho direto na linha Coral", () => {
    const j = plan({ ...initial, from: "mirante", to: "farol" })!;
    expect(j.transfers).toBe(0);
    expect(j.stops).toEqual([
      "mirante",
      "mercado",
      "republica",
      "central",
      "jardim",
      "porto",
      "farol",
    ]);
    expect(j.minutes).toBe(18);
  });
  it("inclui espera e tempo de baldeação no itinerário inicial", () => {
    const j = plan(initial)!;
    expect(j.transfers).toBe(1);
    expect(j.minutes).toBe(j.edges.reduce((n, e) => n + e.minutes, 0) + 3 + 4);
    expect(groups(j).map((g) => g.line)).toEqual(["coral", "lima"]);
  });
  it("inverte corretamente o sentido e os terminais", () => {
    const j = plan({ ...initial, from: "ilha", to: "mirante" })!;
    expect(j.minutes).toBe(plan(initial)!.minutes);
    expect(groups(j).map((g) => g.direction)).toEqual(["lago", "mirante"]);
  });
  it("remove o trecho em obras nos dois sentidos e encontra alternativa", () => {
    for (const [from, to] of [
      ["central", "jardim"],
      ["jardim", "central"],
    ]) {
      const j = plan({ ...initial, from, to, works: true })!;
      expect(j).not.toBeNull();
      expect(
        j.edges.some(
          (e) => [e.from, e.to].sort().join(":") === "central:jardim",
        ),
      ).toBe(false);
      expect(j.stops).toContain("universidade");
    }
  });
  it("rejeita mesmo ponto, destino desconhecido e acesso com escadas", () => {
    expect(plan({ ...initial, to: initial.from })).toBeNull();
    expect(plan({ ...initial, to: "invalid" })).toBeNull();
    expect(plan({ ...initial, to: "farol", stepFree: true })).toBeNull();
  });
  it("permite passar por estação com escadas sem desembarcar", () => {
    const j = plan({
      ...initial,
      from: "observatorio",
      to: "bosque",
      stepFree: true,
    })!;
    expect(j.stops).toContain("museu");
    expect(j.transfers).toBe(0);
  });
  it("mantém a rede conectada e os trajetos contínuos nos dois cenários", () => {
    for (const works of [false, true])
      for (const a of stations)
        for (const b of stations) {
          if (a.id === b.id) continue;
          const j = plan({ ...initial, from: a.id, to: b.id, works })!;
          expect(j).not.toBeNull();
          expect(j.stops[0]).toBe(a.id);
          expect(j.stops.at(-1)).toBe(b.id);
          for (let i = 1; i < j.edges.length; i++)
            expect(j.edges[i].from).toBe(j.edges[i - 1].to);
        }
  });
  it("prioriza menos trocas e mantém grupos completos", () => {
    for (const a of stations)
      for (const b of stations) {
        if (a.id === b.id) continue;
        const fast = plan({ ...initial, from: a.id, to: b.id })!,
          simple = plan({ ...initial, from: a.id, to: b.id, mode: "simple" })!;
        expect(simple.transfers).toBeLessThanOrEqual(fast.transfers);
        expect(fast.minutes).toBeLessThanOrEqual(simple.minutes);
        expect(groups(simple).reduce((n, g) => n + g.count, 0)).toBe(
          simple.edges.length,
        );
      }
  });
  it("exporta itinerário com contexto de demonstração e obras", () => {
    const p = { ...initial, works: true };
    const text = routeText(p, plan(p)!);
    expect(text).toContain("cidade fictícia");
    expect(text).toContain("Central–Jardim interrompido");
    expect(text).toContain("Não use para uma viagem real");
  });
});
describe("Persistência defensiva", () => {
  it("restaura preferências válidas e remove duplicatas", () => {
    expect(readSaved(JSON.stringify([initial, initial]))).toEqual([initial]);
    expect(routeKey(initial)).not.toBe(routeKey({ ...initial, works: true }));
  });
  it("ignora JSON inválido, estruturas erradas e referências desconhecidas", () => {
    for (const value of [
      "{",
      "null",
      "42",
      "{}",
      "[null]",
      JSON.stringify([{ ...initial, from: "???" }]),
      JSON.stringify([{ ...initial, works: "true" }]),
    ])
      expect(readSaved(value)).toEqual([]);
  });
  it("limita a coleção a seis bilhetes", () => {
    const entries = stations
      .filter((s) => s.id !== initial.to)
      .map((s) => ({ ...initial, from: s.id }));
    expect(readSaved(JSON.stringify(entries))).toHaveLength(6);
  });
});
