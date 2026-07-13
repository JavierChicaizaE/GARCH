import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import { ArrowLeft, ArrowRight, Sun, Moon, Menu, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data — extracted verbatim from Modelo_GARCH.pptx                  */
/* ------------------------------------------------------------------ */

const RETURNS = [-1.032,-0.134,-0.262,0.582,0.31,1.271,-0.346,-0.047,1.344,0.269,-0.204,0.441,0.534,0.362,-0.612,-0.2,0.089,-1.01,-2.123,-0.636,0.495,0.074,-0.465,0.219,-0.111,-2.076,1.561,0.023,-1.159,-0.709,-0.513,0.793,1.332,0.453,0.628,-1.398,2.243,-1.482,1.392,-1.214,-1.245,1.645,-0.888,0.366,-1.008,-0.583,-1.137,1.859,-1.76,2.04,-0.725,2.753,-1.358,2.606,-0.505,0.375,0.936,1.451,1.614,-0.354,-1.11,2.547,-1.602,0.476,0.424,-0.955,-1.41,0.17,1.741,1.899,0.154,-0.255,0.741,1.72,0.148,0.058,0.722,1.883,0.831,0.078,-0.057,0.726,1.338,0.639,0.453,0.268,-0.254,-1.08,-0.395,-0.314,-0.393,0.193,-0.231,1.444,-0.369,0.657,0.243,0.371,-0.773,-1.815,-0.626,-0.241,0.762,-0.488,0.649,1.494,-0.466,1.032,0.534,1.615,1.089,-0.451,-0.511,-0.889,-0.285,1.145,2.188,-1.653,-0.055,-0.76,-0.422,-0.241,-1.162,-0.524,0.34,0.603,-0.201,-0.21,-0.223,0.189,-1.565,-0.764,-1.106,-0.129,-0.781,-1.371,0.907,-0.097,0.514,0.301,-0.333,0.829,-0.242,-0.004,-0.564,0.102,0.583,0.595,0.925,0.559,-0.027,-0.578,-0.535,0.429,-0.522,-0.007,0.405,0.11,0.088,0.066,-0.228,0.822,-0.852,-0.107,-0.318,-0.275,-1.125,-0.137,0.383,-0.335,0.002,0.133,0.891,-0.78,-0.238,-0.736,0.007,0.374,-0.387,0.675,0.537,0.276,1.262,-0.643,-0.396,-0.948,1.347,0.534,-0.369,-0.043,-0.743,0.361,0.577,-0.156,0.175,-0.595,-0.727,0.217,0.49,0.084,0.295,0.807,-0.099,-0.284,-0.62,-1.092,-0.451,0.053,0.25,-0.721,-0.093,1.173,0.1,0.494,-0.374,0.244,-0.071,0.019,0.635,-0.079,-0.042,1.049,-0.18,0.041,-0.54,0.288,1.028,-0.935,1.028,-0.084,-0.637,0.473,0.283,0.74,-0.774,0.524,-0.301,0.924,0.715,0.378,-0.224,-0.37,0.021,0.844,0.015,-0.419,0.505,0.257,-0.057,-0.153,0.889,0.108,0.628,0.235,0.287,-0.111,0.652,1.063,-0.366,0.166];

const YEAR_TICKS = [0, 52, 104, 156, 208];
const YEAR_LABELS = ["2019", "2020", "2021", "2022", "2023"];
const chartData = RETURNS.map((v, i) => ({ i, v }));

const TEAM = ["Chicaiza Eduardo", "Navarrete Marlon", "Pineda Fabricio", "Soria Samanta", "Tapia Alex"];

/* ------------------------------------------------------------------ */
/*  Nav structure — grouped outline for the sidebar                   */
/* ------------------------------------------------------------------ */

const OUTLINE = [
  { group: "Inicio", items: [{ idx: 0, tag: "—", title: "Portada" }] },
  { group: "Fundamentos", items: [
    { idx: 1, tag: "01", title: "Motivación" },
    { idx: 2, tag: "02", title: "Regularidades empíricas" },
  ]},
  { group: "El modelo", items: [
    { idx: 3, tag: "03", title: "Modelo ARCH" },
    { idx: 4, tag: "04", title: "Modelo GARCH" },
    { idx: 5, tag: "05", title: "GARCH(1,1)" },
  ]},
  { group: "Análisis", items: [
    { idx: 6, tag: "06", title: "Propiedades teóricas" },
    { idx: 7, tag: "07", title: "Estimación y diagnóstico" },
  ]},
  { group: "Aplicación", items: [
    { idx: 8, tag: "08", title: "Aplicaciones" },
    { idx: 9, tag: "09", title: "Ventajas y límites" },
  ]},
  { group: "Cierre", items: [{ idx: 10, tag: "—", title: "Equipo" }] },
];

const FLAT = OUTLINE.flatMap((g) => g.items.map((it) => ({ ...it, group: g.group })));

/* ------------------------------------------------------------------ */
/*  Shared pieces                                                     */
/* ------------------------------------------------------------------ */

function Wave({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 10 L5 10 L7 4.5 L9 15.5 L11 2.5 L13 17.5 L15 10 L23 10 L25 8 L27 12.5 L29 10 L37 10 L39 5 L41 15 L43 3 L45 17 L47 10 L64 10"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Eyebrow({ n, children }) {
  return (
    <div className="eyebrow">
      {n && <span className="eyebrow-n">{n}</span>}
      <Wave className="eyebrow-wave" />
      <span>{children}</span>
    </div>
  );
}

function Card({ n, title, children, tone }) {
  return (
    <div className={"card" + (tone ? " tone-" + tone : "")}>
      {n && <div className="card-n">{n}</div>}
      {title && <div className="card-title">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}

function Eq({ children, note }) {
  return (
    <div className="eq-block">
      <div className="eq">{children}</div>
      {note && <div className="eq-note">{note}</div>}
    </div>
  );
}

function PageFoot({ page }) {
  return <div className="page-foot">Grupo 10 · {page}⁄11</div>;
}

/* ------------------------------------------------------------------ */
/*  Slide content                                                     */
/* ------------------------------------------------------------------ */

function SlideCover() {
  return (
    <div className="slide cover">
      <div className="cover-glyph" aria-hidden="true">σ²</div>
      <Wave className="cover-wave" />
      <div className="cover-main">
        <div className="eyebrow"><Wave className="eyebrow-wave" /><span>ECONOMETRÍA FINANCIERA · GRUPO 10</span></div>
        <h1 className="cover-title">El modelo<br />GARCH</h1>
        <p className="cover-sub">Heterocedasticidad condicional autorregresiva generalizada</p>
      </div>
      <div className="cover-credits">
        <div className="credits-label">Integrantes</div>
        <ul className="credits-list">
          {TEAM.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
    </div>
  );
}

function SlideMotivacion() {
  return (
    <div className="slide">
      <Eyebrow n="01">MOTIVACIÓN</Eyebrow>
      <h2 className="title">¿Por qué modelar la volatilidad?</h2>

      <div className="chart-wrap">
        <div className="chart-label">Retornos diarios simulados</div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--amber)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceLine y={0} stroke="var(--border-strong)" strokeWidth={1} />
            <XAxis dataKey="i" ticks={YEAR_TICKS} tickFormatter={(v) => YEAR_LABELS[YEAR_TICKS.indexOf(v)] || ""}
              stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
              axisLine={{ stroke: "var(--border-strong)" }} tickLine={false} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink)" }}
              labelFormatter={() => ""} formatter={(v) => [v + " %", "Retorno"]} />
            <Area type="monotone" dataKey="v" stroke="var(--amber)" strokeWidth={1.4} fill="url(#retGrad)" isAnimationActive={false} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card-grid cols-3">
        <Card n="01" title="El problema">Los modelos clásicos (MCO, ARIMA) asumen homocedasticidad: varianza constante. En los mercados reales esto no se cumple.</Card>
        <Card n="02" title="La evidencia">Acciones, tipos de cambio e inflación alternan períodos de calma con turbulencia: la varianza cambia con el tiempo.</Card>
        <Card n="03" title="La consecuencia">La volatilidad es la medida central del riesgo: sin modelarla no hay VaR, derivados ni gestión de carteras confiable.</Card>
      </div>
      <p className="pull-quote">La volatilidad llega en ráfagas — cambios grandes siguen a cambios grandes.</p>
      <PageFoot page="02" />
    </div>
  );
}

function SlideRegularidades() {
  const facts = [
    ["01", "Agrupamiento de volatilidad", "Ráfagas: períodos turbulentos y de calma se alternan y persisten."],
    ["02", "Autocorrelación en los cuadrados", "Los retornos no se autocorrelacionan, pero sus cuadrados sí, y de forma persistente."],
    ["03", "Colas pesadas (leptocurtosis)", "Más eventos extremos de los que predice la distribución normal."],
    ["04", "Efecto apalancamiento", "Las malas noticias aumentan la volatilidad futura más que las buenas."],
    ["05", "Reversión a la media", "La volatilidad fluctúa pero regresa a un nivel promedio de largo plazo."],
  ];
  return (
    <div className="slide">
      <Eyebrow n="02">REGULARIDADES EMPÍRICAS</Eyebrow>
      <h2 className="title">Hechos estilizados de los retornos financieros</h2>
      <p className="lede">Documentados desde Mandelbrot (1963) y Fama (1965); ningún modelo de varianza constante puede capturarlos.</p>

      <div className="card-grid cols-5 facts">
        {facts.map(([n, t, b]) => <Card key={n} n={n} title={t}>{b}</Card>)}
      </div>

      <div className="implication">
        <span className="implication-label">Implicación</span>
        <span>Se necesita un modelo donde la varianza sea aleatoria y evolucione condicional al pasado: ARCH / GARCH.</span>
      </div>
      <PageFoot page="03" />
    </div>
  );
}

function SlideARCH() {
  return (
    <div className="slide">
      <Eyebrow n="03">EL ANTECEDENTE</Eyebrow>
      <h2 className="title">Modelo ARCH — Engle (1982)</h2>
      <p className="lede">Engle propuso que la varianza condicional de hoy dependa de los choques cuadráticos del pasado. Primera formalización del agrupamiento de volatilidad; Premio Nobel de Economía 2003.</p>

      <Eq note="ARCH(q):  ω > 0,  αᵢ ≥ 0 — la varianza es función lineal de los q choques pasados">
        <div>yₜ = σₜ εₜ ,&nbsp;&nbsp; εₜ ~ i.i.d. N(0, 1)</div>
        <div className="eq-main">σ²ₜ = ω + α₁y²ₜ₋₁ + α₂y²ₜ₋₂ + ⋯ + α_q y²ₜ₋q</div>
      </Eq>

      <div className="card-grid cols-2">
        <Card title="Lo que logra" tone="blue">Captura la dependencia temporal de la varianza: y²ₜ evoluciona como un AR(q), reproduciendo el agrupamiento de volatilidad.</Card>
        <Card title="Su limitación" tone="amber">Requiere un orden q muy alto (decenas de rezagos) para capturar la persistencia: estimación pesada e inestable. Esto motiva el GARCH.</Card>
      </div>
      <PageFoot page="04" />
    </div>
  );
}

function SlideGARCH() {
  return (
    <div className="slide">
      <Eyebrow n="04">EL MODELO CENTRAL</Eyebrow>
      <h2 className="title">GARCH(p, q) — Bollerslev (1986)</h2>
      <p className="lede">Bollerslev (alumno de Engle) generalizó el ARCH añadiendo rezagos de la propia varianza condicional, igual que un ARMA generaliza a un AR puro.</p>

      <Eq note="q términos ARCH (choques)  +  p términos GARCH (varianzas);  ω > 0, αᵢ ≥ 0, βⱼ ≥ 0">
        <div className="eq-main">σ²ₜ = ω + Σᵢ αᵢ y²ₜ₋ᵢ + Σⱼ βⱼ σ²ₜ₋ⱼ</div>
      </Eq>

      <div className="card-grid cols-3">
        <Card title="Anidamiento">Con βⱼ = 0 se recupera el ARCH(q): el GARCH lo contiene como caso particular.</Card>
        <Card title="Parsimonia">Un GARCH pequeño equivale a un ARCH(∞): persistencia larga sin decenas de rezagos.</Card>
        <Card title="Suavizamiento">Las varianzas rezagadas actúan como término suavizador de la volatilidad estimada.</Card>
      </div>
      <PageFoot page="05" />
    </div>
  );
}

function SlideGARCH11() {
  return (
    <div className="slide">
      <Eyebrow n="05">EL CASO DE REFERENCIA</Eyebrow>
      <h2 className="title">GARCH(1,1)</h2>
      <p className="lede">Tres parámetros bastan para ajustar la mayoría de las series financieras reales.</p>

      <Eq>
        <div className="eq-main">σ²ₜ = ω + α₁ y²ₜ₋₁ + β₁ σ²ₜ₋₁</div>
      </Eq>

      <div className="card-grid cols-3">
        <Card title={<span>ω &nbsp;·&nbsp; Nivel base</span>}>Constante ligada a la varianza incondicional de largo plazo. Debe ser positiva.</Card>
        <Card title={<span>α₁ &nbsp;·&nbsp; Reacción (ARCH)</span>} tone="amber">Sensibilidad a la "sorpresa" de ayer: respuesta de corto plazo a las noticias.</Card>
        <Card title={<span>β₁ &nbsp;·&nbsp; Persistencia (GARCH)</span>} tone="blue">"Memoria" de la varianza: qué tan lento se disipa la volatilidad pasada.</Card>
      </div>

      <p className="pull-quote">En la práctica: α₁ ≈ 0.05–0.15 y β₁ ≈ 0.80–0.95, con α₁ + β₁ cercano a 1 — la volatilidad es muy persistente.</p>
      <PageFoot page="06" />
    </div>
  );
}

function SlideTeoria() {
  return (
    <div className="slide">
      <Eyebrow n="06">TEORÍA</Eyebrow>
      <h2 className="title">Propiedades estadísticas del proceso GARCH</h2>

      <div className="card-grid cols-2 tall">
        <Card title="Estacionariedad en covarianza">Si Σαᵢ + Σβⱼ &lt; 1, la varianza incondicional existe y es constante: σ² = ω / (1 − Σαᵢ − Σβⱼ).</Card>
        <Card title="Persistencia e IGARCH">α₁ + β₁ mide cuán lento se disipa un choque. En el límite α₁ + β₁ = 1 (IGARCH) los choques son permanentes y la varianza incondicional no está definida.</Card>
        <Card title="Colas pesadas">Aun con errores normales, la distribución incondicional de yₜ es leptocúrtica: mezcla de normales con varianzas cambiantes.</Card>
        <Card title="Representación ARMA de y²ₜ">Si yₜ es GARCH(p,q), y²ₜ sigue un ARMA(max(p,q), p): la ACF y la PACF de los cuadrados orientan la elección de p y q.</Card>
      </div>
      <PageFoot page="07" />
    </div>
  );
}

function SlideMetodologia() {
  return (
    <div className="slide">
      <Eyebrow n="07">METODOLOGÍA</Eyebrow>
      <h2 className="title">Estimación y diagnóstico</h2>

      <div className="method-grid">
        <div className="method-col">
          <div className="method-head">Máxima verosimilitud</div>
          <p className="method-intro">La varianza condicional no es observable y depende de forma no lineal de los parámetros: no puede usarse MCO. Se maximiza numéricamente:</p>
          <div className="method-step"><span className="step-n">01</span><span>Estimar la ecuación de la media (ARMA o media muestral) y obtener los residuos ε̂ₜ.</span></div>
          <div className="eq-block small">
            <div className="eq">ln L = −T⁄2 ln(2π) − ½ Σₜ [ ln σ²ₜ + y²ₜ ⁄ σ²ₜ ]</div>
          </div>
          <p className="method-note">QML (Bollerslev y Wooldridge, 1988): aun sin normalidad, los estimadores son consistentes si la ecuación de varianza está bien especificada; solo se corrigen los errores estándar (robustos).</p>
        </div>

        <div className="method-col">
          <div className="method-head">Prueba ARCH-LM <span className="method-head-sub">(Engle, 1982)</span></div>
          <div className="method-step"><span className="step-n">02</span><span>Regresión auxiliar por MCO: ε̂²ₜ sobre sus propios q rezagos.</span></div>
          <div className="method-step"><span className="step-n">03</span><span>LM = T·R² ~ χ²(q). Si p-valor &lt; 5%, hay efectos ARCH: conviene un GARCH.</span></div>
          <div className="confirm">
            <span className="confirm-check">✓</span>
            <span>Tras estimar: ẑₜ y ẑ²ₜ sin autocorrelación (Ljung-Box) confirman el ajuste.</span>
          </div>
        </div>
      </div>
      <PageFoot page="08" />
    </div>
  );
}

function SlideAplicaciones() {
  const apps = [
    ["Gestión de riesgo", "Valor en Riesgo (VaR) y Expected Shortfall bajo Basilea, con estimación dinámica de la volatilidad."],
    ["Derivados", "Valoración de opciones con volatilidad estocástica, más allá del supuesto constante de Black-Scholes."],
    ["Carteras", "Matrices de covarianza cambiantes para optimización y cobertura (modelos multivariados CCC / DCC)."],
    ["Política monetaria", "La aplicación original de Engle (1982): medir la incertidumbre de la inflación del Reino Unido."],
    ["Divisas y commodities", "Volatilidad de tipos de cambio, petróleo y materias primas; base de índices como el VIX."],
    ["Series mexicanas", "Ajuste de un GARCH(1,1) a los índices CAC, DAX, NASDAQ y al IPC de México (Mina, 2011)."],
  ];
  return (
    <div className="slide">
      <Eyebrow n="08">EN LA PRÁCTICA</Eyebrow>
      <h2 className="title">Aplicaciones del marco GARCH</h2>
      <div className="card-grid cols-3">
        {apps.map(([t, b]) => <Card key={t} title={t}>{b}</Card>)}
      </div>
      <PageFoot page="09" />
    </div>
  );
}

function SlideBalance() {
  const ventajas = [
    "Captura el agrupamiento de volatilidad observado empíricamente.",
    "Parsimonioso: un GARCH(1,1) sustituye a un ARCH(q) de orden alto.",
    "Genera colas pesadas de forma endógena, sin supuestos extra.",
    "Base de una familia amplia de extensiones (que abordan otros equipos).",
    "Estándar de la industria financiera y académica desde hace décadas.",
  ];
  const limitaciones = [
    "Es simétrico: no distingue buenas de malas noticias de igual magnitud.",
    "Sensible a la distribución supuesta para los errores.",
    "Estimación por optimización numérica, sin solución cerrada.",
    "Solo reacciona a la magnitud del choque, no a variables exógenas.",
    "Los modelos de orden alto pueden ser inestables o violar la no negatividad.",
  ];
  return (
    <div className="slide">
      <Eyebrow n="09">BALANCE</Eyebrow>
      <h2 className="title">Ventajas y limitaciones</h2>

      <div className="balance-grid">
        <div className="balance-col">
          <div className="balance-head tone-blue">Ventajas</div>
          <ul className="balance-list">{ventajas.map((v) => <li key={v}><span className="mark plus">+</span>{v}</li>)}</ul>
        </div>
        <div className="balance-col">
          <div className="balance-head tone-amber">Limitaciones</div>
          <ul className="balance-list">{limitaciones.map((v) => <li key={v}><span className="mark minus">−</span>{v}</li>)}</ul>
        </div>
      </div>
      <PageFoot page="10" />
    </div>
  );
}

function SlideCierre() {
  return (
    <div className="slide cover closing">
      <Wave className="cover-wave" />
      <div className="cover-main">
        <div className="eyebrow"><Wave className="eyebrow-wave" /><span>GRACIAS</span></div>
        <h1 className="cover-title small">El modelo<br />GARCH</h1>
        <p className="cover-sub">Heterocedasticidad condicional autorregresiva generalizada</p>
      </div>
      <div className="cover-credits center">
        <div className="credits-label">Grupo 10</div>
        <ul className="credits-list row">
          {TEAM.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
    </div>
  );
}

const SLIDES = [
  SlideCover, SlideMotivacion, SlideRegularidades, SlideARCH, SlideGARCH,
  SlideGARCH11, SlideTeoria, SlideMetodologia, SlideAplicaciones, SlideBalance, SlideCierre,
];
const TOTAL = SLIDES.length;

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [current, setCurrent] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goTo = useCallback((n) => setCurrent(Math.max(0, Math.min(TOTAL - 1, n))), []);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
      else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(TOTAL - 1);
      else if (e.key.toLowerCase() === "t") setTheme((t) => (t === "dark" ? "light" : "dark"));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo]);

  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40) next();
    if (dx > 40) prev();
    touchX.current = null;
  };

  const trackStyle = useMemo(() => ({
    transform: `translateX(-${(100 / TOTAL) * current}%)`,
    width: `${TOTAL * 100}%`,
  }), [current]);

  const currentMeta = FLAT[current];

  return (
    <div className={"app-shell theme-" + theme}>
      <style>{CSS}</style>

      {/* ---------------- Topbar ---------------- */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn only-mobile" onClick={() => setSidebarOpen((v) => !v)} aria-label="Abrir menú">
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
          <div className="brand">
            <span className="brand-mark">σ²</span>
            <span className="brand-word">GARCH</span>
          </div>
          <span className="brand-tag">Grupo 10</span>
        </div>

        <div className="topbar-center">
          <span className="crumb-group">{currentMeta.group}</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-title">{currentMeta.title}</span>
        </div>

        <div className="topbar-right">
          <div className="ticker" aria-hidden="true">
            <Wave className="ticker-wave" />
            <Wave className="ticker-wave" />
          </div>
          <button className="icon-btn" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label="Cambiar tema">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* ---------------- Sidebar ---------------- */}
        <aside className={"sidebar" + (sidebarOpen ? " open" : "")}>
          <nav className="outline">
            {OUTLINE.map((g) => (
              <div className="outline-group" key={g.group}>
                <div className="outline-group-label">{g.group}</div>
                {g.items.map((it) => (
                  <button
                    key={it.idx}
                    className={"outline-item" + (it.idx === current ? " active" : "")}
                    onClick={() => { goTo(it.idx); setSidebarOpen(false); }}
                  >
                    <span className="outline-tag">{it.tag}</span>
                    <span className="outline-title">{it.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-foot">
            <div className="sidebar-foot-label">Sesión</div>
            <div className="sidebar-foot-value">Modelo GARCH — presentación interactiva</div>
          </div>
        </aside>
        {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

        {/* ---------------- Main ---------------- */}
        <main className="main">
          <div className="stage-outer">
            <div className="stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div className="track" style={trackStyle}>
                {SLIDES.map((S, i) => (
                  <div className="slide-slot" style={{ width: `${100 / TOTAL}%` }} key={i} aria-hidden={i !== current}>
                    <S />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="controls">
            <button className="nav-btn" onClick={prev} disabled={current === 0} aria-label="Anterior">
              <ArrowLeft size={16} />
            </button>
            <div className="dots">
              {SLIDES.map((_, i) => (
                <button key={i} className={"dot" + (i === current ? " active" : "")} onClick={() => goTo(i)} aria-label={`Ir a la diapositiva ${i + 1}`} />
              ))}
            </div>
            <div className="counter">{String(current + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}</div>
            <button className="nav-btn" onClick={next} disabled={current === TOTAL - 1} aria-label="Siguiente">
              <ArrowRight size={16} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.app-shell {
  --radius: 12px;
  font-family: 'Inter', sans-serif;
  width: 100%;
  min-height: 720px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--border);
}

/* ---- dark theme ---- */
.theme-dark {
  --bg: #0A0B0D;
  --surface: #111217;
  --surface-2: #16181D;
  --surface-3: #1D2027;
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.16);
  --ink: #F3F1EA;
  --ink-dim: #9BA0A6;
  --ink-faint: #5B5F66;
  --amber: #FFB020;
  --amber-soft: rgba(255,176,32,0.14);
  --blue: #6C97F0;
  --blue-soft: rgba(108,151,240,0.14);
  --shadow: 0 20px 60px -24px rgba(0,0,0,0.6);
}

/* ---- light theme ---- */
.theme-light {
  --bg: #EFF1F4;
  --surface: #FFFFFF;
  --surface-2: #FFFFFF;
  --surface-3: #F1F3F6;
  --border: rgba(15,17,23,0.09);
  --border-strong: rgba(15,17,23,0.16);
  --ink: #14161B;
  --ink-dim: #565C66;
  --ink-faint: #93989F;
  --amber: #B5710C;
  --amber-soft: rgba(181,113,12,0.10);
  --blue: #3457C4;
  --blue-soft: rgba(52,87,196,0.10);
  --shadow: 0 20px 50px -28px rgba(20,22,27,0.25);
}

.app-shell * { box-sizing: border-box; }
.app-shell { background: var(--bg); color: var(--ink); }

/* ================= Topbar ================= */

.topbar {
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.topbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.brand { display: flex; align-items: baseline; gap: 6px; }
.brand-mark {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--amber);
  background: var(--amber-soft);
  border-radius: 6px;
  padding: 1px 6px;
}
.brand-word {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.01em;
}
.brand-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--ink-faint);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  padding: 2px 7px;
  white-space: nowrap;
}
.topbar-center {
  display: flex; align-items: center; gap: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--ink-dim);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}
.crumb-group { color: var(--ink-faint); }
.crumb-sep { color: var(--ink-faint); }
.crumb-title { color: var(--ink); font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.ticker { display: flex; gap: 4px; color: var(--ink-faint); overflow: hidden; width: 96px; height: 16px; opacity: 0.55; }
.ticker-wave { width: 64px; height: 16px; flex-shrink: 0; animation: ticker-scroll 5.5s linear infinite; }
@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-64px); } }
@media (prefers-reduced-motion: reduce) { .ticker-wave { animation: none; } }

.icon-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--ink-dim);
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease, background .15s ease;
  flex-shrink: 0;
}
.icon-btn:hover { color: var(--amber); border-color: var(--amber); }
.only-mobile { display: none; }

/* ================= Body layout ================= */

.app-body { flex: 1; display: flex; min-height: 0; }

/* ---- sidebar ---- */
.sidebar {
  width: 232px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
}
.outline { padding: 14px 10px; display: flex; flex-direction: column; gap: 16px; }
.outline-group-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
  padding: 0 8px 6px;
}
.outline-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--ink-dim);
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.outline-item:hover { background: var(--surface-3); color: var(--ink); }
.outline-item.active { background: var(--amber-soft); color: var(--ink); font-weight: 500; }
.outline-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--ink-faint);
  width: 18px;
  flex-shrink: 0;
}
.outline-item.active .outline-tag { color: var(--amber); }
.sidebar-foot {
  padding: 14px 18px 16px;
  border-top: 1px solid var(--border);
}
.sidebar-foot-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
  margin-bottom: 4px;
}
.sidebar-foot-value { font-size: 11.5px; color: var(--ink-dim); line-height: 1.4; }
.scrim { display: none; }

/* ---- main ---- */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 22px 24px;
  background:
    radial-gradient(900px 420px at 90% -10%, var(--amber-soft), transparent 60%),
    radial-gradient(900px 480px at 5% 115%, var(--blue-soft), transparent 60%);
}

.stage-outer { width: 100%; max-width: 1040px; }
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow);
}
.track { display: flex; height: 100%; transition: transform 0.55s cubic-bezier(0.65,0,0.15,1); }
@media (prefers-reduced-motion: reduce) { .track { transition: none; } }
.slide-slot { height: 100%; flex-shrink: 0; }

.slide {
  height: 100%; width: 100%;
  padding: clamp(22px, 3vw, 40px) clamp(26px, 3.8vw, 50px);
  display: flex; flex-direction: column;
  position: relative;
}

/* ---- typography ---- */
.eyebrow { display: flex; align-items: center; gap: 10px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--amber); margin-bottom: 8px; }
.eyebrow-n { color: var(--ink-faint); border: 1px solid var(--border-strong); border-radius: 4px; padding: 1px 6px; }
.eyebrow-wave { width: 24px; height: 11px; color: var(--ink-faint); }
.title { font-family: 'Fraunces', serif; font-weight: 600; font-size: clamp(21px, 2.3vw, 29px); line-height: 1.12; letter-spacing: -0.01em; margin: 0 0 9px; max-width: 900px; }
.lede { font-size: clamp(12px, 1.05vw, 13.5px); color: var(--ink-dim); line-height: 1.55; max-width: 780px; margin: 0 0 14px; }
.pull-quote { font-family: 'Fraunces', serif; font-size: clamp(13px, 1.15vw, 15px); font-weight: 500; font-style: italic; color: var(--ink); opacity: 0.9; margin: 12px 0 0; }

/* ---- cards ---- */
.card-grid { display: grid; gap: 11px; margin-top: 2px; }
.card-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
.card-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.card-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }
.card-grid.tall { flex: 1; }
.card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 13px; display: flex; flex-direction: column; gap: 5px; }
.card-n { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--ink-faint); letter-spacing: 0.06em; }
.card-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 13px; color: var(--ink); }
.card-body { font-size: 11.5px; line-height: 1.48; color: var(--ink-dim); }
.card.tone-amber .card-title { color: var(--amber); }
.card.tone-blue .card-title { color: var(--blue); }
.card-grid.facts .card-title { font-size: 12px; }
.card-grid.facts .card-body { font-size: 10.8px; }

/* ---- equations ---- */
.eq-block { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; margin: 4px 0 14px; }
.eq-block.small { padding: 11px 14px; margin: 8px 0; }
.eq { font-family: 'IBM Plex Mono', monospace; font-size: clamp(12.5px, 1.25vw, 15px); color: var(--ink); line-height: 1.7; }
.eq-main { color: var(--amber); font-size: clamp(13.5px, 1.45vw, 17px); margin-top: 2px; }
.eq-note { margin-top: 7px; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--ink-faint); }

/* ---- implication ---- */
.implication { margin-top: auto; background: var(--amber-soft); border: 1px solid var(--border-strong); border-radius: 10px; padding: 11px 15px; display: flex; gap: 10px; align-items: baseline; font-size: 12px; color: var(--ink); }
.implication-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; color: var(--amber); flex-shrink: 0; }

/* ---- chart ---- */
.chart-wrap { height: 132px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 8px 6px 4px 2px; margin-bottom: 12px; position: relative; }
.chart-label { position: absolute; top: 9px; left: 15px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--ink-faint); letter-spacing: 0.06em; z-index: 2; }

/* ---- methodology ---- */
.method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; flex: 1; }
.method-col { display: flex; flex-direction: column; }
.method-head { font-family: 'Fraunces', serif; font-weight: 600; font-size: 14.5px; margin-bottom: 7px; }
.method-head-sub { font-size: 10.5px; color: var(--ink-faint); font-weight: 400; margin-left: 4px; font-family: 'Inter', sans-serif; }
.method-intro { font-size: 11.3px; color: var(--ink-dim); line-height: 1.5; margin: 0 0 9px; }
.method-step { display: flex; gap: 9px; font-size: 11.3px; color: var(--ink-dim); line-height: 1.5; margin-bottom: 7px; }
.step-n { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--blue); border: 1px solid var(--border-strong); border-radius: 4px; padding: 1px 5px; height: fit-content; flex-shrink: 0; }
.method-note { font-size: 10.6px; color: var(--ink-faint); line-height: 1.5; margin-top: 7px; }
.confirm { margin-top: auto; display: flex; gap: 8px; align-items: flex-start; background: var(--blue-soft); border: 1px solid var(--border-strong); border-radius: 9px; padding: 9px 11px; font-size: 11px; color: var(--ink); }
.confirm-check { color: var(--blue); font-weight: 600; }

/* ---- balance ---- */
.balance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; flex: 1; }
.balance-col { display: flex; flex-direction: column; }
.balance-head { font-family: 'Fraunces', serif; font-weight: 600; font-size: 14.5px; margin-bottom: 9px; }
.balance-head.tone-blue { color: var(--blue); }
.balance-head.tone-amber { color: var(--amber); }
.balance-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.balance-list li { display: flex; gap: 8px; font-size: 11.7px; color: var(--ink-dim); line-height: 1.42; }
.mark { font-family: 'IBM Plex Mono', monospace; font-weight: 600; flex-shrink: 0; width: 11px; }
.mark.plus { color: var(--blue); }
.mark.minus { color: var(--amber); }

/* ---- cover ---- */
.cover { justify-content: space-between; }
.cover-glyph { position: absolute; right: clamp(8px, 2.6vw, 34px); top: -6%; font-family: 'Fraunces', serif; font-size: clamp(140px, 19vw, 260px); font-weight: 700; color: var(--ink); opacity: 0.045; line-height: 1; user-select: none; pointer-events: none; }
.cover-wave { position: absolute; bottom: 27%; left: 0; width: 55%; height: 36px; color: var(--amber); opacity: 0.16; }
.cover-main { margin-top: clamp(8px, 3.4vh, 32px); position: relative; z-index: 1; }
.cover-title { font-family: 'Fraunces', serif; font-weight: 700; font-size: clamp(36px, 5.6vw, 64px); line-height: 0.98; letter-spacing: -0.01em; margin: 6px 0 14px; }
.cover-title.small { font-size: clamp(24px, 3.4vw, 38px); }
.cover-sub { font-size: clamp(12.5px, 1.15vw, 14.5px); color: var(--ink-dim); max-width: 460px; line-height: 1.5; }
.cover-credits { position: relative; z-index: 1; display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 12px; }
.cover-credits.center { justify-content: center; flex-direction: column; align-items: center; text-align: center; gap: 9px; }
.credits-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.1em; color: var(--amber); flex-shrink: 0; }
.credits-list { list-style: none; margin: 0; padding: 0; display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: var(--ink-dim); font-family: 'IBM Plex Mono', monospace; }
.credits-list.row { justify-content: center; }
.credits-list li { white-space: nowrap; }

.page-foot { position: absolute; bottom: 14px; right: 18px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--ink-faint); }

/* ================= Controls ================= */
.controls { display: flex; align-items: center; gap: 16px; width: 100%; max-width: 1040px; justify-content: center; }
.nav-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border-strong); background: var(--surface); color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s ease, transform .15s ease, border-color .15s ease, color .15s ease; flex-shrink: 0; }
.nav-btn:hover:not(:disabled) { background: var(--surface-3); border-color: var(--amber); color: var(--amber); }
.nav-btn:active:not(:disabled) { transform: scale(0.94); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.dots { display: flex; align-items: center; gap: 6px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-faint); border: none; padding: 0; cursor: pointer; transition: background .2s ease, width .2s ease; }
.dot.active { background: var(--amber); width: 16px; border-radius: 3px; }
.counter { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--ink-faint); letter-spacing: 0.06em; min-width: 52px; text-align: center; }

/* ================= Responsive ================= */
@media (max-width: 900px) {
  .sidebar { position: fixed; top: 52px; left: 0; bottom: 0; z-index: 30; transform: translateX(-100%); transition: transform .25s ease; box-shadow: var(--shadow); }
  .sidebar.open { transform: translateX(0); }
  .scrim { display: block; position: fixed; top: 52px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 20; }
  .only-mobile { display: flex; }
  .topbar-center { display: none; }
  .stage { aspect-ratio: 3 / 4; }
  .card-grid.cols-2, .card-grid.cols-3, .card-grid.cols-5 { grid-template-columns: 1fr 1fr; }
  .method-grid, .balance-grid { grid-template-columns: 1fr; gap: 12px; }
  .cover-glyph { font-size: 120px; opacity: 0.06; }
  .cover-credits { flex-direction: column; align-items: flex-start; gap: 7px; }
}
@media (max-width: 480px) {
  .card-grid.cols-3 { grid-template-columns: 1fr; }
  .card-grid.cols-5 { grid-template-columns: 1fr 1fr; }
  .brand-tag { display: none; }
}
`;
