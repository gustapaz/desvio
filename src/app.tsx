import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  edges,
  groups,
  initial,
  lineIds,
  lines,
  plan,
  readSaved,
  routeKey,
  routeText,
  stationById,
  stationLines,
  stations,
} from "./network";
import type { LineId, Preferences } from "./network";
import "./app.css";

const key = "desvio:routes:1";
const alphabet = [...stations].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR"),
);
const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function Badge({ line }: { line: LineId }) {
  return <span class={`badge ${line}`}>{lines[line].code}</span>;
}
function saveText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function App() {
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [submitted, setSubmitted] = useState<Preferences>(initial);
  const [saved, setSaved] = useState<Preferences[]>(() => {
    try {
      return readSaved(localStorage.getItem(key));
    } catch {
      return [];
    }
  });
  const [page, setPage] = useState<"map" | "stations" | "saved">("map");
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<Preferences | null>(null);
  const main = useRef<HTMLElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLElement>(null);
  const journey = useMemo(() => plan(submitted), [submitted]);
  const activeEdges = new Set(
    journey?.edges.map((e) => [e.from, e.to].sort().join(":")),
  );
  const dirty = routeKey(prefs) !== routeKey(submitted);
  const isSaved = saved.some((p) => routeKey(p) === routeKey(submitted));
  useEffect(() => {
    if (selected) info.current?.focus();
  }, [selected]);
  function navigate(next: typeof page) {
    setPage(next);
    setSelected(null);
    requestAnimationFrame(() => main.current?.focus());
  }
  function persist(next: Preferences[]) {
    setSaved(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      return true;
    } catch {
      setNotice(
        "Não foi possível salvar neste navegador. Os trajetos ficam disponíveis só até fechar esta página.",
      );
      return false;
    }
  }
  function bookmark() {
    if (isSaved) {
      setNotice("Este trajeto já está nos seus bilhetes.");
      return;
    }
    if (saved.length === 6) {
      setNotice(
        "Seus seis espaços estão ocupados. Remova um bilhete antes de guardar outro.",
      );
      return;
    }
    if (persist([...saved, submitted]))
      setNotice("Trajeto guardado neste navegador.");
  }
  function remove(p: Preferences) {
    setUndo(p);
    if (persist(saved.filter((s) => routeKey(s) !== routeKey(p))))
      setNotice("Bilhete removido. Você pode desfazer.");
  }
  function restore() {
    if (!undo) return;
    if (saved.some((p) => routeKey(p) === routeKey(undo))) {
      setUndo(null);
      setNotice("Este bilhete já está guardado.");
      return;
    }
    if (saved.length >= 6) {
      setNotice("Remova um bilhete para liberar espaço antes de desfazer.");
      return;
    }
    persist([...saved, undo]);
    setUndo(null);
    setNotice("Bilhete restaurado.");
  }
  function calculate(event: Event) {
    event.preventDefault();
    if (prefs.from === prefs.to) {
      setError("Escolha uma chegada diferente da partida.");
      return;
    }
    if (!plan(prefs)) {
      setError(
        "Essa partida ou chegada tem escadas. Desative “Sem escadas” ou escolha outra estação.",
      );
      return;
    }
    setError("");
    setSubmitted({ ...prefs });
    setSelected(null);
    setNotice("Trajeto calculado. Confira o itinerário.");
    requestAnimationFrame(() => result.current?.focus());
  }
  function closeDetails() {
    const previous = selected;
    setSelected(null);
    requestAnimationFrame(() =>
      document.getElementById(`station-${previous}`)?.focus(),
    );
  }
  function choose(id: string, field: "from" | "to") {
    setPrefs({ ...prefs, [field]: id });
    setSelected(null);
    setNotice(
      `${field === "from" ? "Partida" : "Chegada"} alterada para ${stationById[id].name}. Calcule para atualizar o trajeto.`,
    );
    document.getElementById(field)?.focus();
  }
  const filtered = alphabet.filter(
    (s) =>
      (filter === "all" || stationLines(s.id).includes(filter as LineId)) &&
      normalize(`${s.name} ${s.area}`).includes(normalize(search)),
  );
  const detail = selected ? stationById[selected] : null;
  return (
    <>
      <a class="skip" href="#main">
        Pular para o conteúdo
      </a>
      <div class="demo-bar">
        <span>VILA BRISA / REDE IMAGINÁRIA</span>
        <span>DEMONSTRAÇÃO · NÃO É TRANSPORTE REAL</span>
      </div>
      <header class="masthead">
        <button
          class="wordmark"
          onClick={() => navigate("map")}
          aria-label="Desvio, abrir mapa"
        >
          desvio<span aria-hidden="true">↗</span>
        </button>
        <p>
          O caminho também
          <br />
          faz parte do passeio.
        </p>
        <nav aria-label="Navegação principal">
          {(
            [
              ["map", "01", "Mapa"],
              ["stations", "02", "Estações"],
              ["saved", "03", "Bilhetes"],
            ] as const
          ).map(([id, n, label]) => (
            <button
              key={id}
              aria-current={page === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <small>{n}</small>
              {label}
              {id === "saved" && <span class="counter">{saved.length}</span>}
            </button>
          ))}
        </nav>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        {page === "map" && (
          <>
            <div class="section-heading">
              <div>
                <span class="eyebrow">
                  ESCOLHA UM PONTO. DESCUBRA O CAMINHO.
                </span>
                <h1>A cidade é uma conexão.</h1>
              </div>
              <span class="network-stamp">
                3 LINHAS
                <br />
                17 ESTAÇÕES
              </span>
            </div>
            <div class="workspace">
              <section class="map-panel" aria-labelledby="map-title">
                <div class="map-top">
                  <h2 id="map-title">Mapa da rede</h2>
                  <span>
                    <i class={submitted.works ? "dot warning" : "dot"} />
                    {submitted.works ? "OBRAS SIMULADAS" : "REDE DISPONÍVEL"}
                  </span>
                </div>
                <div
                  class="map-scroll"
                  tabIndex={0}
                  aria-label="Mapa esquemático rolável. Use Tab para selecionar estações ou a lista de estações abaixo."
                >
                  <div
                    class="map-art"
                    style={{ width: `max(${zoom * 100}%, ${590 * zoom}px)` }}
                  >
                    <svg
                      viewBox="0 0 900 610"
                      aria-hidden="true"
                      class="tracks"
                    >
                      <defs>
                        <pattern
                          id="dots"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle
                            cx="1"
                            cy="1"
                            r=".7"
                            fill="#39293d"
                            opacity=".15"
                          />
                        </pattern>
                      </defs>
                      <rect width="900" height="610" fill="url(#dots)" />
                      <path
                        class="river"
                        d="M850 -50 Q600 50 750 330 T690 680"
                      />
                      <text
                        x="755"
                        y="495"
                        class="water-label"
                        transform="rotate(-70 755 495)"
                      >
                        RIO DA BRISA
                      </text>
                      {edges.map((e) => {
                        const a = stationById[e.from],
                          b = stationById[e.to],
                          on = activeEdges.has([e.from, e.to].sort().join(":")),
                          closed =
                            submitted.works &&
                            e.from === "central" &&
                            e.to === "jardim";
                        return (
                          <g key={`${e.from}-${e.to}`}>
                            <path
                              d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
                              stroke={lines[e.line].color}
                              class={`track ${on ? "chosen" : ""} ${closed ? "closed" : ""}`}
                            />
                            {on && !closed && (
                              <path
                                d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
                                class="route-core"
                              />
                            )}
                            {closed && (
                              <text
                                x={(a.x + b.x) / 2}
                                y={a.y + 7}
                                class="closed-mark"
                              >
                                ×
                              </text>
                            )}
                          </g>
                        );
                      })}
                      <text x="75" y="105" class="map-cardinal">
                        N ↑
                      </text>
                      <text x="75" y="125" class="map-small">
                        MAPA ESQUEMÁTICO
                      </text>
                      <text x="75" y="565" class="map-small">
                        DISTÂNCIAS NÃO PROPORCIONAIS
                      </text>
                      <text x="770" y="570" class="map-number">
                        VB / 03
                      </text>
                    </svg>
                    {stations.map((s) => {
                      const start = s.id === submitted.from,
                        end = s.id === submitted.to,
                        active = journey?.stops.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          id={`station-${s.id}`}
                          class={`station ${stationLines(s.id).length > 1 ? "interchange" : ""} ${active ? "on-route" : ""} ${start ? "origin" : ""} ${end ? "destination" : ""} ${["museu", "aurora", "bosque", "observatorio"].includes(s.id) ? "label-side" : ""}`}
                          style={{ left: `${s.x / 9}%`, top: `${s.y / 6.1}%` }}
                          aria-label={`${s.name}${start ? ", partida" : end ? ", chegada" : ""}. Linhas ${stationLines(
                            s.id,
                          )
                            .map((l) => lines[l].name)
                            .join(
                              " e ",
                            )}${s.accessible ? "" : ". Acesso com escadas"}`}
                          aria-pressed={selected === s.id}
                          onClick={() => setSelected(s.id)}
                        >
                          <span class="station-dot">
                            {start ? "A" : end ? "B" : ""}
                          </span>
                          <span class="station-label">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div class="map-bottom">
                  <div class="legend">
                    {lineIds.map((l) => (
                      <span key={l}>
                        <Badge line={l} />
                        {lines[l].name}
                      </span>
                    ))}
                  </div>
                  <div class="zoom" aria-label="Escala do mapa">
                    <button
                      disabled={zoom <= 1}
                      onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                      aria-label="Reduzir mapa"
                    >
                      −
                    </button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button
                      disabled={zoom >= 1.75}
                      onClick={() => setZoom((z) => Math.min(1.75, z + 0.25))}
                      aria-label="Ampliar mapa"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p class="map-hint">
                  <span>Deslize o mapa para os lados quando necessário.</span>
                  Toque em uma estação para explorar.{" "}
                  <button onClick={() => navigate("stations")}>
                    Prefere uma lista? ↗
                  </button>
                </p>
                {detail && (
                  <div
                    class="station-detail"
                    ref={info}
                    tabIndex={-1}
                    aria-label={`Detalhes de ${detail.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        closeDetails();
                      }
                    }}
                  >
                    <div>
                      <span class="eyebrow">{detail.area}</span>
                      <h3>{detail.name}</h3>
                      <div>
                        {stationLines(detail.id).map((l) => (
                          <Badge line={l} key={l} />
                        ))}{" "}
                        <span>
                          {detail.accessible
                            ? "Acesso sem escadas"
                            : "Acesso com escadas"}
                        </span>
                      </div>
                      <p>{detail.note}</p>
                    </div>
                    <div class="detail-actions">
                      <button onClick={() => choose(detail.id, "from")}>
                        Partir daqui A
                      </button>
                      <button onClick={() => choose(detail.id, "to")}>
                        Chegar aqui B
                      </button>
                      <button class="text-button" onClick={closeDetails}>
                        Fechar detalhes ×
                      </button>
                    </div>
                  </div>
                )}
              </section>
              <aside class="planner" aria-label="Planejador de trajeto">
                <form onSubmit={calculate}>
                  <div class="ticket-heading">
                    <h2>
                      Seu próximo
                      <br />
                      <em>desvio.</em>
                    </h2>
                    <span aria-hidden="true">↗</span>
                  </div>
                  <label class="station-field" htmlFor="from">
                    <span class="field-letter">A</span>
                    <span>
                      PARTIDA
                      <select
                        id="from"
                        value={prefs.from}
                        onChange={(e) =>
                          setPrefs({ ...prefs, from: e.currentTarget.value })
                        }
                      >
                        {alphabet.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <button
                    type="button"
                    class="swap"
                    aria-label="Inverter partida e chegada"
                    onClick={() =>
                      setPrefs({ ...prefs, from: prefs.to, to: prefs.from })
                    }
                  >
                    ↕
                  </button>
                  <label class="station-field" htmlFor="to">
                    <span class="field-letter end">B</span>
                    <span>
                      CHEGADA
                      <select
                        id="to"
                        value={prefs.to}
                        onChange={(e) =>
                          setPrefs({ ...prefs, to: e.currentTarget.value })
                        }
                      >
                        {alphabet.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <fieldset class="preferences">
                    <legend>O que importa no caminho?</legend>
                    <label>
                      <input
                        type="radio"
                        name="mode"
                        checked={prefs.mode === "fast"}
                        onChange={() => setPrefs({ ...prefs, mode: "fast" })}
                      />{" "}
                      Menor tempo
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="mode"
                        checked={prefs.mode === "simple"}
                        onChange={() => setPrefs({ ...prefs, mode: "simple" })}
                      />{" "}
                      Menos baldeações
                    </label>
                  </fieldset>
                  <label class="check">
                    <input
                      type="checkbox"
                      checked={prefs.stepFree}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          stepFree: e.currentTarget.checked,
                        })
                      }
                    />{" "}
                    Sem escadas nos acessos
                  </label>
                  <label class="check">
                    <input
                      type="checkbox"
                      checked={prefs.works}
                      onChange={(e) =>
                        setPrefs({ ...prefs, works: e.currentTarget.checked })
                      }
                    />{" "}
                    Simular obras Central–Jardim
                  </label>
                  {error && (
                    <p class="error" role="alert">
                      {error}
                    </p>
                  )}
                  <button class="primary calculate" type="submit">
                    Traçar caminho <span aria-hidden="true">↗</span>
                  </button>
                  {dirty && (
                    <p class="pending">
                      Opções alteradas. Calcule para atualizar.
                    </p>
                  )}
                </form>
                {journey && (
                  <section
                    class="itinerary"
                    ref={result}
                    tabIndex={-1}
                    aria-labelledby="route-title"
                  >
                    <span class="eyebrow">
                      ITINERÁRIO {dirty ? "ANTERIOR" : "CALCULADO"}
                    </span>
                    <h2 id="route-title">
                      {stationById[submitted.from].name} <span>→</span>{" "}
                      {stationById[submitted.to].name}
                    </h2>
                    <div class="route-stats">
                      <strong>
                        {journey.minutes}
                        <small>MIN ESTIMADOS</small>
                      </strong>
                      <span>
                        {journey.edges.length} trechos
                        <br />
                        {journey.transfers}{" "}
                        {journey.transfers === 1 ? "baldeação" : "baldeações"}
                      </span>
                    </div>
                    <ol class="directions">
                      {groups(journey).map((g, i) => (
                        <li
                          key={`${g.line}-${i}`}
                          style={{ "--line": lines[g.line].color }}
                        >
                          <Badge line={g.line} />
                          <div>
                            <strong>
                              {i === 0 ? "Embarque" : "Troque de linha"} em{" "}
                              {stationById[g.from].name}
                            </strong>
                            <span>
                              Linha {lines[g.line].name} · sentido{" "}
                              {stationById[g.direction].name}
                            </span>
                            <p>
                              {g.count} {g.count === 1 ? "trecho" : "trechos"} ·{" "}
                              {g.minutes} min até{" "}
                              <b>{stationById[g.to].name}</b>
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <p class="arrival">
                      ◎ Chegada em {stationById[submitted.to].name}
                    </p>
                    <div class="ticket-actions">
                      <button onClick={bookmark} disabled={isSaved}>
                        {isSaved ? "✓ Guardado" : "＋ Guardar bilhete"}
                      </button>
                      <button
                        onClick={() =>
                          saveText(
                            "desvio-itinerario.txt",
                            routeText(submitted, journey),
                          )
                        }
                      >
                        Baixar .txt ↓
                      </button>
                    </div>
                    <p class="fine-print">
                      Inclui 3 min de espera e 4 min por baldeação. Sem
                      caminhada externa. Estimativas fixas, sem dados em tempo
                      real.
                    </p>
                    <div class="barcode" aria-hidden="true" />
                  </section>
                )}
              </aside>
            </div>
            <section class="network-notes" aria-label="Como esta rede funciona">
              <div>
                <span>01 / A REDE</span>
                <h2>
                  Três linhas.
                  <br />
                  Muitas possibilidades.
                </h2>
              </div>
              <p>
                Uma cidade inventada para experimentar caminhos. Troque de linha
                em República, Universidade ou Jardim. O traço branco acompanha o
                itinerário calculado.
              </p>
              <details>
                <summary>Como os trajetos são calculados?</summary>
                <p>
                  Escolhemos o menor tempo somando os trechos, a espera inicial
                  e as baldeações. Em “Menos baldeações”, priorizamos o menor
                  número de trocas e depois o tempo. “Sem escadas” verifica
                  partida, chegada e locais de troca; o trem pode passar por
                  estações com escadas.
                </p>
                <p>
                  As obras removem somente o trecho Central–Jardim, nos dois
                  sentidos. Todos os números e lugares desta rede são fictícios.
                </p>
              </details>
            </section>
          </>
        )}
        {page === "stations" && (
          <section class="directory">
            <div class="section-heading">
              <div>
                <span class="eyebrow">CADA PARADA, UMA POSSIBILIDADE</span>
                <h1>Onde você quer ir?</h1>
              </div>
              <span class="network-stamp">
                GUIA DA
                <br />
                REDE / VB
              </span>
            </div>
            <div class="directory-tools">
              <label>
                Buscar estação ou bairro
                <input
                  type="search"
                  value={search}
                  onInput={(e) => setSearch(e.currentTarget.value)}
                  placeholder="Experimente jardim…"
                />
              </label>
              <label>
                Linha
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.currentTarget.value)}
                >
                  <option value="all">Todas as linhas</option>
                  {lineIds.map((l) => (
                    <option key={l} value={l}>
                      {lines[l].code} · {lines[l].name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p class="result-count" role="status">
              {filtered.length}{" "}
              {filtered.length === 1
                ? "estação encontrada"
                : "estações encontradas"}
            </p>
            <div class="station-list">
              {filtered.map((s) => (
                <article key={s.id}>
                  <div class="list-number">
                    {String(stations.indexOf(s) + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <span class="eyebrow">{s.area}</span>
                    <h2>{s.name}</h2>
                    <p>{s.note}</p>
                    <span class="access">
                      {s.accessible ? "↗ Sem escadas" : "↟ Com escadas"}
                    </span>
                  </div>
                  <div class="list-actions">
                    <div>
                      {stationLines(s.id).map((l) => (
                        <Badge key={l} line={l} />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setPage("map");
                        setSelected(s.id);
                      }}
                      aria-label={`Ver ${s.name} no mapa`}
                    >
                      Explorar ↗
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <div class="empty">
                <span aria-hidden="true">⌕</span>
                <h2>Nenhuma parada por aqui.</h2>
                <p>Tente outro nome ou escolha uma linha diferente.</p>
                <button
                  class="primary"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Limpar busca e filtros
                </button>
              </div>
            )}
          </section>
        )}
        {page === "saved" && (
          <section class="wallet">
            <div class="section-heading">
              <div>
                <span class="eyebrow">PEQUENOS PLANOS PARA DEPOIS</span>
                <h1>Seus caminhos, guardados.</h1>
              </div>
              <span class="network-stamp">
                {saved.length} / 06
                <br />
                BILHETES
              </span>
            </div>
            <p class="wallet-intro">
              Uma coleção de trajetos neste navegador. Sem conta, sem
              sincronização e sem bilhete de transporte real.
            </p>
            {saved.length === 0 ? (
              <div class="empty">
                <span aria-hidden="true">↗</span>
                <h2>A cidade ainda está em aberto.</h2>
                <p>Calcule um caminho e guarde seu primeiro bilhete.</p>
                <button class="primary" onClick={() => navigate("map")}>
                  Explorar o mapa ↗
                </button>
              </div>
            ) : (
              <div class="tickets">
                {saved.map((p, i) => {
                  const j = plan(p)!;
                  return (
                    <article class="saved-ticket" key={routeKey(p)}>
                      <div class="ticket-serial">
                        VILA BRISA / {String(i + 1).padStart(3, "0")}
                        <span>{j.minutes} MIN</span>
                      </div>
                      <h2>
                        {stationById[p.from].name}
                        <span>↘</span>
                        {stationById[p.to].name}
                      </h2>
                      <p>
                        {j.transfers}{" "}
                        {j.transfers === 1 ? "baldeação" : "baldeações"} ·{" "}
                        {p.mode === "fast" ? "Menor tempo" : "Menos baldeações"}
                      </p>
                      <p>
                        {p.stepFree ? "Sem escadas" : "Acessos sem filtro"} ·{" "}
                        {p.works ? "Obras simuladas" : "Rede completa"}
                      </p>
                      <div class="ticket-actions">
                        <button
                          onClick={() => {
                            setPrefs(p);
                            setSubmitted(p);
                            setError("");
                            navigate("map");
                            setNotice("Bilhete aberto com as opções salvas.");
                          }}
                        >
                          Abrir caminho ↗
                        </button>
                        <button
                          onClick={() => remove(p)}
                          aria-label={`Remover bilhete ${stationById[p.from].name} para ${stationById[p.to].name}`}
                        >
                          Remover ×
                        </button>
                      </div>
                      <div class="barcode" aria-hidden="true" />
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
      {notice && (
        <div class="notice">
          <span role="status">{notice}</span>
          {undo && <button onClick={restore}>Desfazer</button>}
          <button onClick={() => setNotice("")} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}
      <footer>
        <a
          href="https://github.com/gustapaz/desvio"
          target="_blank"
          rel="noreferrer"
        >
          Gustavo Paz · código ↗
        </a>
        <span>DESVIO / EXPERIMENTE OUTRO CAMINHO</span>
        <span>100% FICTÍCIO. 100% EXPLORÁVEL.</span>
      </footer>
    </>
  );
}
