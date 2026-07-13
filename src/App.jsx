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
  { group: "Fundamentos", items: [
    { idx: 0, tag: "01", title: "Motivación" },
    { idx: 1, tag: "02", title: "Regularidades empíricas" },
  ]},
  { group: "El modelo", items: [
    { idx: 2, tag: "03", title: "Modelo ARCH" },
    { idx: 3, tag: "04", title: "Modelo GARCH" },
    { idx: 4, tag: "05", title: "GARCH(1,1)" },
  ]},
  { group: "Análisis", items: [
    { idx: 5, tag: "06", title: "Propiedades teóricas" },
    { idx: 6, tag: "07", title: "Estimación y diagnóstico" },
  ]},
  { group: "Aplicación", items: [
    { idx: 7, tag: "08", title: "Aplicaciones" },
    { idx: 8, tag: "09", title: "Ventajas y límites" },
  ]},
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
  return <div className="page-foot">Grupo 10 · {page}⁄09</div>;
}

/* ------------------------------------------------------------------ */
/*  Slide content                                                     */
/* ------------------------------------------------------------------ */

function SlideMotivacion() {
  return (
    <div className="slide">
      <Eyebrow n="01">MOTIVACIÓN</Eyebrow>
      <h2 className="title">¿Por qué modelar la volatilidad?</h2>
      <div className="slide-body layout-chart">
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

        <div className="card-grid cols-3 compact">
          <Card n="01" title="El problema">Los modelos clásicos (MCO, ARIMA) asumen homocedasticidad: varianza constante. En los mercados reales esto no se cumple.</Card>
          <Card n="02" title="La evidencia">Acciones, tipos de cambio e inflación alternan períodos de calma con turbulencia: la varianza cambia con el tiempo.</Card>
          <Card n="03" title="La consecuencia">La volatilidad es la medida central del riesgo: sin modelarla no hay VaR, derivados ni gestión de carteras confiable.</Card>
        </div>
        <p className="pull-quote">La volatilidad llega en ráfagas — cambios grandes siguen a cambios grandes.</p>
      </div>
      <PageFoot page="01" />
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
      <div className="slide-body layout-compact">
        <p className="lede">Documentados desde Mandelbrot (1963) y Fama (1965); ningún modelo de varianza constante puede capturarlos.</p>

        <div className="card-grid facts">
          {facts.map(([n, t, b]) => <Card key={n} n={n} title={t}>{b}</Card>)}
        </div>

        <div className="implication">
          <span className="implication-label">Implicación</span>
          <span>Se necesita un modelo donde la varianza sea aleatoria y evolucione condicional al pasado: ARCH / GARCH.</span>
        </div>
      </div>
      <PageFoot page="02" />
    </div>
  );
}

function SlideARCH() {
  return (
    <div className="slide">
      <Eyebrow n="03">EL ANTECEDENTE</Eyebrow>
      <h2 className="title">Modelo ARCH — Engle (1982)</h2>
      <div className="slide-body layout-model">
        <p className="lede">Engle propuso que la varianza condicional de hoy dependa de los choques cuadráticos del pasado. Primera formalización del agrupamiento de volatilidad; Premio Nobel de Economía 2003.</p>

        <Eq note="ARCH(q):  ω > 0,  αᵢ ≥ 0 — la varianza es función lineal de los q choques pasados">
          <div>yₜ = σₜ εₜ ,&nbsp;&nbsp; εₜ ~ i.i.d. N(0, 1)</div>
          <div className="eq-main">σ²ₜ = ω + α₁y²ₜ₋₁ + α₂y²ₜ₋₂ + ⋯ + α_q y²ₜ₋q</div>
        </Eq>

        <div className="card-grid cols-2 compact">
          <Card title="Lo que logra" tone="blue">Captura la dependencia temporal de la varianza: y²ₜ evoluciona como un AR(q), reproduciendo el agrupamiento de volatilidad.</Card>
          <Card title="Su limitación" tone="amber">Requiere un orden q muy alto (decenas de rezagos) para capturar la persistencia: estimación pesada e inestable. Esto motiva el GARCH.</Card>
        </div>
      </div>
      <PageFoot page="03" />
    </div>
  );
}

function SlideGARCH() {
  return (
    <div className="slide">
      <Eyebrow n="04">EL MODELO CENTRAL</Eyebrow>
      <h2 className="title">GARCH(p, q) — Bollerslev (1986)</h2>
      <div className="slide-body layout-model">
        <p className="lede">Bollerslev (alumno de Engle) generalizó el ARCH añadiendo rezagos de la propia varianza condicional, igual que un ARMA generaliza a un AR puro.</p>

        <Eq note="q términos ARCH (choques)  +  p términos GARCH (varianzas);  ω > 0, αᵢ ≥ 0, βⱼ ≥ 0">
          <div className="eq-main">σ²ₜ = ω + Σᵢ αᵢ y²ₜ₋ᵢ + Σⱼ βⱼ σ²ₜ₋ⱼ</div>
        </Eq>

        <div className="card-grid cols-3 compact">
          <Card title="Anidamiento">Con βⱼ = 0 se recupera el ARCH(q): el GARCH lo contiene como caso particular.</Card>
          <Card title="Parsimonia">Un GARCH pequeño equivale a un ARCH(∞): persistencia larga sin decenas de rezagos.</Card>
          <Card title="Suavizamiento">Las varianzas rezagadas actúan como término suavizador de la volatilidad estimada.</Card>
        </div>
      </div>
      <PageFoot page="04" />
    </div>
  );
}

function SlideGARCH11() {
  return (
    <div className="slide">
      <Eyebrow n="05">EL CASO DE REFERENCIA</Eyebrow>
      <h2 className="title">GARCH(1,1)</h2>
      <div className="slide-body layout-model">
        <p className="lede">Tres parámetros bastan para ajustar la mayoría de las series financieras reales.</p>

        <Eq>
          <div className="eq-main">σ²ₜ = ω + α₁ y²ₜ₋₁ + β₁ σ²ₜ₋₁</div>
        </Eq>

        <div className="card-grid cols-3 compact">
          <Card title={<span>ω &nbsp;·&nbsp; Nivel base</span>}>Constante ligada a la varianza incondicional de largo plazo. Debe ser positiva.</Card>
          <Card title={<span>α₁ &nbsp;·&nbsp; Reacción (ARCH)</span>} tone="amber">Sensibilidad a la "sorpresa" de ayer: respuesta de corto plazo a las noticias.</Card>
          <Card title={<span>β₁ &nbsp;·&nbsp; Persistencia (GARCH)</span>} tone="blue">"Memoria" de la varianza: qué tan lento se disipa la volatilidad pasada.</Card>
        </div>

        <p className="pull-quote">En la práctica: α₁ ≈ 0.05–0.15 y β₁ ≈ 0.80–0.95, con α₁ + β₁ cercano a 1 — la volatilidad es muy persistente.</p>
      </div>
      <PageFoot page="05" />
    </div>
  );
}

function SlideTeoria() {
  const props = [
    ["01", "Estacionariedad", "Σαᵢ + Σβⱼ < 1 garantiza varianza incondicional estable."],
    ["02", "Persistencia", "α₁ + β₁ mide cuánto tarda en disiparse un choque."],
    ["03", "Colas pesadas", "La mezcla de varianzas cambiantes genera leptocurtosis."],
    ["04", "ARMA en y²ₜ", "La ACF/PACF de cuadrados ayuda a elegir p y q."],
  ];
  return (
    <div className="slide">
      <Eyebrow n="06">TEORÍA</Eyebrow>
      <h2 className="title">Propiedades estadísticas del proceso GARCH</h2>
      <div className="slide-body layout-theory">
        <div className="theory-hero">
          <div className="theory-label">Condición central</div>
          <div className="theory-formula">Σαᵢ + Σβⱼ &lt; 1</div>
          <p>Si se cumple, la volatilidad fluctúa pero regresa a un nivel de largo plazo.</p>
          <div className="theory-mini-eq">σ² = ω / (1 − Σαᵢ − Σβⱼ)</div>
        </div>

        <div className="theory-list">
          {props.map(([n, title, body]) => (
            <div className="theory-item" key={n}>
              <span>{n}</span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="persistence-strip">
          <span>Calma</span>
          <div className="persistence-bar"><i /></div>
          <span>IGARCH: choques permanentes</span>
        </div>
      </div>
      <PageFoot page="06" />
    </div>
  );
}

function SlideMetodologia() {
  const steps = [
    ["01", "Media", "Estimar ARMA o media muestral y obtener residuos ε̂ₜ."],
    ["02", "Varianza", "Maximizar la verosimilitud con σ²ₜ dependiente del pasado."],
    ["03", "ARCH-LM", "Regresar ε̂²ₜ sobre q rezagos y revisar T·R²."],
    ["04", "Diagnóstico", "Validar que ẑₜ y ẑ²ₜ no mantengan autocorrelación."],
  ];
  return (
    <div className="slide">
      <Eyebrow n="07">METODOLOGÍA</Eyebrow>
      <h2 className="title">Estimación y diagnóstico</h2>
      <div className="slide-body layout-method">
        <div className="method-flow">
          {steps.map(([n, title, body]) => (
            <div className="flow-step" key={n}>
              <span>{n}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="method-detail">
          <div className="likelihood-panel">
            <div className="method-head">Máxima verosimilitud</div>
            <p>La varianza condicional no es observable y depende de forma no lineal de los parámetros; por eso se maximiza numéricamente.</p>
            <div className="eq-block small">
              <div className="eq">ln L = −T⁄2 ln(2π) − ½ Σₜ [ ln σ²ₜ + y²ₜ ⁄ σ²ₜ ]</div>
            </div>
          </div>

          <div className="diagnostic-panel">
            <div className="method-head">Criterio de decisión</div>
            <div className="diagnostic-rule">
              <span>p-valor &lt; 5%</span>
              <strong>hay efectos ARCH</strong>
              <em>conviene estimar un GARCH</em>
            </div>
            <p>QML conserva consistencia si la ecuación de varianza está bien especificada; se corrigen errores estándar robustos.</p>
          </div>
        </div>
      </div>
      <PageFoot page="07" />
    </div>
  );
}

function SlideAplicaciones() {
  const apps = [
    ["Riesgo", "VaR / ES", "Estimación dinámica de pérdidas extremas bajo Basilea."],
    ["Derivados", "Opciones", "Volatilidad cambiante frente al supuesto constante de Black-Scholes."],
    ["Carteras", "Cobertura", "Matrices de covarianza variables para optimización."],
    ["Política", "Inflación", "Medición de incertidumbre macroeconómica."],
    ["Mercados", "FX / crudo", "Volatilidad de divisas, petróleo e índices como el VIX."],
    ["México", "IPC", "Ajustes GARCH(1,1) en índices CAC, DAX, NASDAQ e IPC."],
  ];
  return (
    <div className="slide">
      <Eyebrow n="08">EN LA PRÁCTICA</Eyebrow>
      <h2 className="title">Aplicaciones del marco GARCH</h2>
      <div className="slide-body layout-apps">
        <p className="lede">GARCH se usa cuando el riesgo cambia en el tiempo y la volatilidad no puede tratarse como una constante.</p>
        <div className="app-map">
          {apps.map(([area, tag, body]) => (
            <div className="app-tile" key={area}>
              <span>{tag}</span>
              <strong>{area}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
      <PageFoot page="08" />
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
      <div className="slide-body layout-balance">
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
        <div className="balance-summary">
          <strong>Lectura final</strong>
          <span>GARCH es potente para capturar persistencia y agrupamiento de volatilidad, pero requiere diagnóstico y extensiones cuando hay asimetrías o choques externos.</span>
        </div>
      </div>
      <PageFoot page="09" />
    </div>
  );
}

const SLIDES = [
  SlideMotivacion, SlideRegularidades, SlideARCH, SlideGARCH,
  SlideGARCH11, SlideTeoria, SlideMetodologia, SlideAplicaciones, SlideBalance,
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
          <div className="brand-lockup">
            <div className="brand-kicker">GRUPO 10</div>
            <div className="brand-title">
              <span>El modelo</span>
              <strong>GARCH</strong>
            </div>
            <div className="brand-subtitle">Heterocedasticidad condicional autorregresiva generalizada</div>
          </div>
        </div>

        <div className="topbar-center">
          <span className="crumb-group">{currentMeta.group}</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-title">{currentMeta.title}</span>
        </div>

        <div className="topbar-right">
          <div className="team-strip" aria-label="Integrantes del Grupo 10">
            <span>Grupo 10</span>
            {TEAM.map((m) => <span key={m}>{m}</span>)}
          </div>
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
            <div className="sidebar-foot-value">Modelo GARCH</div>
          </div>
        </aside>
        {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

        {/* ---------------- Main ---------------- */}
        <main className="main">
          <div className="stage-outer">
            <div className="stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div className="track" style={trackStyle}>
                {SLIDES.map((S, i) => (
                  <div className={"slide-slot" + (i === current ? " active" : "")} style={{ width: `${100 / TOTAL}%` }} key={i} aria-hidden={i !== current}>
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
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  border: 0;
}

/* ---- dark theme ---- */
.theme-dark {
  --bg: #03070B;
  --surface: rgba(9,16,24,0.88);
  --surface-2: rgba(15,25,36,0.82);
  --surface-3: rgba(26,39,53,0.90);
  --border: rgba(222,239,248,0.11);
  --border-strong: rgba(222,239,248,0.24);
  --ink: #F8F4EC;
  --ink-dim: #A9B6BE;
  --ink-faint: #697782;
  --amber: #F6B84B;
  --amber-soft: rgba(246,184,75,0.13);
  --blue: #42D3DC;
  --blue-soft: rgba(66,211,220,0.13);
  --rose: #FF6E59;
  --rose-soft: rgba(255,110,89,0.13);
  --green: #64E7A0;
  --green-soft: rgba(100,231,160,0.11);
  --shadow: 0 32px 110px -36px rgba(0,0,0,0.88);
}

/* ---- light theme ---- */
.theme-light {
  --bg: #F7F4EC;
  --surface: rgba(255,253,248,0.92);
  --surface-2: rgba(255,255,255,0.9);
  --surface-3: rgba(237,242,243,0.95);
  --border: rgba(20,35,45,0.10);
  --border-strong: rgba(20,35,45,0.18);
  --ink: #14212A;
  --ink-dim: #5A646B;
  --ink-faint: #8A9298;
  --amber: #9C6412;
  --amber-soft: rgba(156,100,18,0.11);
  --blue: #15777D;
  --blue-soft: rgba(21,119,125,0.11);
  --rose: #B4513E;
  --rose-soft: rgba(180,81,62,0.12);
  --green: #287D55;
  --green-soft: rgba(40,125,85,0.10);
  --shadow: 0 24px 58px -30px rgba(20,35,45,0.25);
}

.app-shell * { box-sizing: border-box; }
.app-shell {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--blue) 8%, transparent) 0 12%, transparent 12.2% 100%),
    linear-gradient(315deg, color-mix(in srgb, var(--rose) 7%, transparent) 0 10%, transparent 10.2% 100%),
    var(--bg);
  color: var(--ink);
}

/* ================= Topbar ================= */

.topbar {
  min-height: 92px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 18px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--blue-soft) 72%, transparent), transparent 44%),
    var(--surface);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(18px);
  position: relative;
  overflow: hidden;
}
.topbar::before {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--blue), var(--amber), var(--rose), transparent);
  opacity: .9;
}
.topbar::after {
  content: "";
  position: absolute;
  right: 12%;
  top: -44px;
  width: 280px;
  height: 120px;
  border: 1px solid color-mix(in srgb, var(--blue) 18%, transparent);
  transform: skewX(-24deg);
  pointer-events: none;
  opacity: .7;
}
.topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1.1 1 360px; }
.brand-lockup { min-width: 0; display: grid; gap: 2px; }
.brand-kicker {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--amber);
  font-weight: 600;
}
.brand-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: 'Fraunces', serif;
  line-height: 1;
  color: var(--ink);
}
.brand-title span { font-size: clamp(20px, 2.2vw, 30px); font-weight: 600; }
.brand-title strong {
  font-size: clamp(36px, 4.5vw, 60px);
  letter-spacing: 0;
  color: transparent;
  background: linear-gradient(90deg, var(--ink), var(--amber) 52%, var(--blue));
  -webkit-background-clip: text;
  background-clip: text;
}
.brand-subtitle {
  font-size: clamp(11px, 1vw, 13px);
  color: var(--ink-dim);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
  flex: 0.8 1 230px;
  justify-content: center;
}
.crumb-group { color: var(--ink-faint); }
.crumb-sep { color: var(--ink-faint); }
.crumb-title { color: var(--ink); font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
.topbar-right { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex: 1 1 390px; min-width: 0; }
.team-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}
.team-strip span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.2px;
  line-height: 1;
  color: var(--ink-dim);
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 999px;
  padding: 5px 7px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}
.team-strip span:first-child {
  color: var(--amber);
  border-color: var(--border-strong);
  background: var(--amber-soft);
}
.ticker { display: flex; gap: 4px; color: var(--ink-faint); overflow: hidden; width: 96px; height: 16px; opacity: 0.55; }
.ticker-wave { width: 64px; height: 16px; flex-shrink: 0; animation: ticker-scroll 5.5s linear infinite; }
@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-64px); } }
@media (prefers-reduced-motion: reduce) { .ticker-wave { animation: none; } }

.icon-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--ink-dim);
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease, background .15s ease, transform .15s ease;
  flex-shrink: 0;
}
.icon-btn:hover { color: var(--amber); border-color: var(--amber); transform: translateY(-1px); }
.only-mobile { display: none; }

/* ================= Body layout ================= */

.app-body { flex: 1; display: flex; min-height: 0; }

/* ---- sidebar ---- */
.sidebar {
  width: 244px;
  flex-shrink: 0;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface-3) 24%, transparent), transparent 38%),
    var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  backdrop-filter: blur(18px);
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
  padding: 8px 9px;
  border-radius: 11px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-dim);
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: background .15s ease, color .15s ease, transform .15s ease, border-color .15s ease;
}
.outline-item:hover { background: var(--surface-3); color: var(--ink); border-color: var(--border); transform: translateX(2px); }
.outline-item.active { background: linear-gradient(90deg, var(--blue-soft), var(--amber-soft)); color: var(--ink); font-weight: 500; border-color: var(--border-strong); box-shadow: inset 3px 0 0 var(--blue); }
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
  gap: 14px;
  padding: clamp(16px, 2vw, 28px);
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--blue-soft) 44%, transparent) 1px, transparent 1px),
    linear-gradient(180deg, color-mix(in srgb, var(--amber-soft) 32%, transparent) 1px, transparent 1px),
    linear-gradient(135deg, transparent 0 58%, color-mix(in srgb, var(--blue) 7%, transparent) 58.1% 58.7%, transparent 58.8% 100%),
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 45%, transparent), transparent 42%),
    var(--bg);
  background-size: 34px 34px, 34px 34px, auto, auto, auto;
}
.main::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, transparent 0 18%, color-mix(in srgb, var(--blue) 12%, transparent) 18.2% 18.6%, transparent 18.8% 100%),
    linear-gradient(290deg, transparent 0 62%, color-mix(in srgb, var(--amber) 14%, transparent) 62.2% 62.7%, transparent 63% 100%);
  opacity: 0.7;
}

.stage-outer { width: min(100%, 1120px); position: relative; z-index: 1; }
.stage {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid var(--border);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--surface-3) 34%, transparent), transparent 42%),
    var(--surface);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  transition: min-height .25s ease;
  isolation: isolate;
}
.stage::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 21px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--ink) 7%, transparent);
}
.stage::before {
  content: "VOLATILITY LAB";
  position: absolute;
  right: 22px;
  top: 16px;
  z-index: 2;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  letter-spacing: .16em;
  color: color-mix(in srgb, var(--ink-faint) 80%, transparent);
  pointer-events: none;
}
.slide::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--green), var(--amber), var(--rose));
  opacity: 0.9;
}
.track { display: flex; align-items: flex-start; transition: transform 0.55s cubic-bezier(0.65,0,0.15,1); }
@media (prefers-reduced-motion: reduce) { .track { transition: none; } }
.slide-slot { flex-shrink: 0; opacity: 0.25; transition: opacity .25s ease; }
.slide-slot.active { opacity: 1; }

.slide {
  width: 100%;
  min-height: clamp(430px, 62vh, 640px);
  padding: clamp(22px, 2.7vw, 38px) clamp(24px, 3.2vw, 48px) clamp(34px, 3.5vw, 48px);
  display: flex; flex-direction: column;
  position: relative;
  overflow: hidden;
}
.slide::after {
  content: "GARCH";
  position: absolute;
  right: clamp(20px, 4vw, 54px);
  bottom: -24px;
  font-family: 'Fraunces', serif;
  font-size: clamp(74px, 12vw, 150px);
  font-weight: 700;
  letter-spacing: 0;
  color: color-mix(in srgb, var(--ink) 4%, transparent);
  pointer-events: none;
  line-height: .8;
}

.slide-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  justify-content: flex-start;
  gap: clamp(14px, 2vh, 22px);
  position: relative;
  z-index: 1;
}
.layout-chart { gap: 14px; }
.layout-model {
  max-width: 920px;
  margin: 0 auto;
  width: 100%;
}
.layout-compact {
  gap: 16px;
}
.layout-theory {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(360px, 1.2fr);
  grid-template-rows: 1fr auto;
  gap: 16px;
  align-items: stretch;
}
.layout-method,
.layout-apps,
.layout-balance {
  gap: 16px;
}

/* ---- typography ---- */
.eyebrow { display: flex; align-items: center; gap: 10px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--amber); margin-bottom: 4px; position: relative; z-index: 1; }
.eyebrow-n { color: var(--ink-faint); border: 1px solid var(--border-strong); border-radius: 4px; padding: 1px 6px; }
.eyebrow-wave { width: 24px; height: 11px; color: var(--ink-faint); }
.title { font-family: 'Fraunces', serif; font-weight: 600; font-size: clamp(25px, 2.8vw, 40px); line-height: 1.05; letter-spacing: 0; margin: 0 0 12px; max-width: 920px; position: relative; z-index: 1; }
.lede { font-size: clamp(12px, 1.05vw, 13.5px); color: var(--ink-dim); line-height: 1.55; max-width: 780px; margin: 0; }
.pull-quote { font-family: 'Fraunces', serif; font-size: clamp(13px, 1.15vw, 15px); font-weight: 500; font-style: italic; color: var(--ink); opacity: 0.9; margin: 0; }

/* ---- cards ---- */
.card-grid { display: grid; gap: 12px; margin-top: 0; align-items: start; align-content: start; }
.card-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
.card-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.card-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }
.card-grid.tall { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card-grid.compact .card { min-height: 118px; }
.card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 16px; padding: 15px 16px; display: flex; flex-direction: column; gap: 6px; min-height: 0; position: relative; overflow: hidden; transition: transform .18s ease, border-color .18s ease, background .18s ease; }
.card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--blue), var(--amber));
  opacity: 0.75;
}
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--ink) 5%, transparent), transparent 38%);
  opacity: 0;
  transition: opacity .18s ease;
  pointer-events: none;
}
.card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.card:hover::after { opacity: 1; }
.card-n { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--ink-faint); letter-spacing: 0.06em; }
.card-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 13px; color: var(--ink); }
.card-body { font-size: 11.5px; line-height: 1.48; color: var(--ink-dim); }
.card.tone-amber .card-title { color: var(--amber); }
.card.tone-blue .card-title { color: var(--blue); }
.card-grid.facts { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.card-grid.facts .card { min-height: 132px; }
.card-grid.facts .card:nth-child(4) { grid-column: 1 / span 1; }
.card-grid.facts .card:nth-child(5) { grid-column: 2 / span 1; }
.card-grid.facts .card-title { font-size: 12px; }
.card-grid.facts .card-body { font-size: 10.8px; }

/* ---- theory ---- */
.theory-hero {
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  background:
    linear-gradient(145deg, var(--blue-soft), transparent 48%),
    var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  position: relative;
  overflow: hidden;
}
.theory-hero::after {
  content: "";
  position: absolute;
  right: -28px;
  bottom: 18px;
  width: 190px;
  height: 70px;
  border: 1px solid color-mix(in srgb, var(--amber) 32%, transparent);
  border-left: 0;
  border-bottom: 0;
  transform: skewX(-22deg);
  opacity: .55;
}
.theory-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--amber);
  text-transform: uppercase;
}
.theory-formula {
  font-family: 'Fraunces', serif;
  font-size: clamp(30px, 4.1vw, 50px);
  line-height: 1;
  color: var(--ink);
}
.theory-hero p {
  margin: 0;
  color: var(--ink-dim);
  line-height: 1.5;
  font-size: 12.5px;
}
.theory-mini-eq {
  margin-top: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--blue);
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.theory-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.theory-item {
  display: flex;
  gap: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  position: relative;
  overflow: hidden;
}
.theory-item::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--blue), transparent);
  opacity: .55;
}
.theory-item > span {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--amber);
  font-size: 10px;
  flex-shrink: 0;
}
.theory-item strong {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 13px;
  margin-bottom: 4px;
}
.theory-item p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 11.2px;
  line-height: 1.45;
}
.persistence-strip {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--ink-faint);
}
.persistence-bar {
  height: 8px;
  border-radius: 99px;
  background: var(--surface-3);
  overflow: hidden;
}
.persistence-bar i {
  display: block;
  width: 78%;
  height: 100%;
  background: linear-gradient(90deg, var(--blue), var(--amber), var(--rose));
  border-radius: inherit;
}

/* ---- equations ---- */
.eq-block { background: linear-gradient(135deg, var(--surface-2), color-mix(in srgb, var(--blue-soft) 42%, var(--surface-2))); border: 1px solid var(--border); border-radius: 16px; padding: 18px 20px; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.eq-block {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 4%, transparent);
}
.eq-block.small { padding: 11px 14px; margin: 4px 0; }
.eq { font-family: 'IBM Plex Mono', monospace; font-size: clamp(12.5px, 1.25vw, 15px); color: var(--ink); line-height: 1.7; width: 100%; text-align: center; }
.eq-main { color: var(--amber); font-size: clamp(13.5px, 1.45vw, 17px); margin-top: 2px; width: 100%; text-align: center; }
.eq-note { margin-top: 7px; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--ink-faint); }

/* ---- implication ---- */
.implication { margin-top: 0; background: linear-gradient(90deg, var(--amber-soft), var(--blue-soft)); border: 1px solid var(--border-strong); border-radius: 16px; padding: 12px 15px; display: flex; gap: 10px; align-items: baseline; font-size: 12px; color: var(--ink); }
.implication-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; color: var(--amber); flex-shrink: 0; }

/* ---- chart ---- */
.chart-wrap { height: clamp(170px, 28vh, 230px); background:
  linear-gradient(180deg, color-mix(in srgb, var(--green-soft) 72%, transparent), transparent 64%),
  var(--surface-2);
  border: 1px solid var(--border); border-radius: 18px; padding: 8px 6px 4px 2px; margin-bottom: 0; position: relative; overflow: hidden; }
.chart-wrap::after {
  content: "";
  position: absolute;
  inset: 34px 12px 26px;
  pointer-events: none;
  background-image: linear-gradient(to right, color-mix(in srgb, var(--ink) 6%, transparent) 1px, transparent 1px);
  background-size: 52px 100%;
  opacity: .45;
}
.chart-label { position: absolute; top: 9px; left: 15px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--ink-faint); letter-spacing: 0.06em; z-index: 2; }

/* ---- methodology ---- */
.method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.method-col { display: flex; flex-direction: column; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.method-head { font-family: 'Fraunces', serif; font-weight: 600; font-size: 14.5px; margin-bottom: 7px; }
.method-head-sub { font-size: 10.5px; color: var(--ink-faint); font-weight: 400; margin-left: 4px; font-family: 'Inter', sans-serif; }
.method-intro { font-size: 11.3px; color: var(--ink-dim); line-height: 1.5; margin: 0 0 9px; }
.method-step { display: flex; gap: 9px; font-size: 11.3px; color: var(--ink-dim); line-height: 1.5; margin-bottom: 7px; }
.step-n { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--blue); border: 1px solid var(--border-strong); border-radius: 4px; padding: 1px 5px; height: fit-content; flex-shrink: 0; }
.method-note { font-size: 10.6px; color: var(--ink-faint); line-height: 1.5; margin-top: 7px; }
.confirm { margin-top: 6px; display: flex; gap: 8px; align-items: flex-start; background: var(--blue-soft); border: 1px solid var(--border-strong); border-radius: 9px; padding: 9px 11px; font-size: 11px; color: var(--ink); }
.confirm-check { color: var(--blue); font-weight: 600; }
.method-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.flow-step {
  position: relative;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 13px;
  min-height: 118px;
  overflow: hidden;
}
.flow-step::before {
  content: "";
  position: absolute;
  inset: auto 12px 11px 12px;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--amber));
  border-radius: 99px;
  opacity: .65;
}
.flow-step span {
  display: inline-flex;
  font-family: 'IBM Plex Mono', monospace;
  color: var(--amber);
  font-size: 10px;
  margin-bottom: 8px;
}
.flow-step strong {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 13.5px;
  margin-bottom: 6px;
}
.flow-step p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 11px;
  line-height: 1.42;
}
.method-detail {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 14px;
}
.likelihood-panel,
.diagnostic-panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}
.likelihood-panel p,
.diagnostic-panel p {
  margin: 0 0 10px;
  color: var(--ink-dim);
  font-size: 11.4px;
  line-height: 1.5;
}
.diagnostic-rule {
  display: grid;
  gap: 5px;
  background: var(--blue-soft);
  border: 1px solid var(--border-strong);
  border-radius: 9px;
  padding: 12px;
  margin-bottom: 10px;
}
.diagnostic-rule span {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--amber);
  font-size: 10.5px;
}
.diagnostic-rule strong {
  font-family: 'Fraunces', serif;
  font-size: 15px;
}
.diagnostic-rule em {
  color: var(--ink-dim);
  font-size: 11px;
  font-style: normal;
}

/* ---- applications ---- */
.app-map {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.app-tile {
  min-height: 132px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  overflow: hidden;
}
.app-tile:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
}
.app-tile { transition: transform .18s ease, border-color .18s ease; }
.app-tile::after {
  content: "";
  position: absolute;
  right: -24px;
  top: -24px;
  width: 76px;
  height: 76px;
  border: 1px solid color-mix(in srgb, var(--blue) 28%, transparent);
  transform: rotate(35deg);
  opacity: .55;
}
.app-tile span {
  align-self: flex-start;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: var(--amber);
  background: var(--amber-soft);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 8px;
}
.app-tile strong {
  font-family: 'Fraunces', serif;
  font-size: 17px;
}
.app-tile p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 11.4px;
  line-height: 1.45;
}

/* ---- balance ---- */
.balance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.balance-col { display: flex; flex-direction: column; background: var(--surface-2); border: 1px solid var(--border); border-radius: 18px; padding: 16px; position: relative; overflow: hidden; }
.balance-col::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--amber), var(--rose));
}
.balance-head { font-family: 'Fraunces', serif; font-weight: 600; font-size: 14.5px; margin-bottom: 9px; }
.balance-head.tone-blue { color: var(--blue); }
.balance-head.tone-amber { color: var(--amber); }
.balance-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.balance-list li { display: flex; gap: 8px; font-size: 11.7px; color: var(--ink-dim); line-height: 1.42; padding: 6px 0; border-top: 1px solid var(--border); }
.balance-list li:first-child { border-top: 0; padding-top: 0; }
.mark { font-family: 'IBM Plex Mono', monospace; font-weight: 600; flex-shrink: 0; width: 11px; }
.mark.plus { color: var(--blue); }
.mark.minus { color: var(--amber); }
.balance-summary {
  display: flex;
  gap: 12px;
  align-items: baseline;
  background: var(--blue-soft);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  padding: 13px 15px;
}
.balance-summary strong {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--blue);
  text-transform: uppercase;
  flex-shrink: 0;
}
.balance-summary span {
  color: var(--ink);
  font-size: 12px;
  line-height: 1.45;
}

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
.controls { display: flex; align-items: center; gap: 16px; width: fit-content; max-width: min(100%, 1120px); justify-content: center; position: relative; z-index: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 999px; background: color-mix(in srgb, var(--surface) 76%, transparent); backdrop-filter: blur(16px); box-shadow: 0 18px 44px -28px rgba(0,0,0,.7); }
.nav-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border-strong); background: var(--surface-2); color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s ease, transform .15s ease, border-color .15s ease, color .15s ease; flex-shrink: 0; }
.nav-btn:hover:not(:disabled) { background: var(--surface-3); border-color: var(--amber); color: var(--amber); transform: translateY(-1px); }
.nav-btn:active:not(:disabled) { transform: scale(0.94); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.dots { display: flex; align-items: center; gap: 6px; }
.dot { width: 22px; height: 5px; border-radius: 999px; background: color-mix(in srgb, var(--ink-faint) 62%, transparent); border: none; padding: 0; cursor: pointer; transition: background .2s ease, width .2s ease, transform .15s ease; }
.dot:hover { transform: scaleY(1.45); }
.dot.active { background: linear-gradient(90deg, var(--blue), var(--green), var(--amber)); width: 42px; border-radius: 999px; }
.counter { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--ink-faint); letter-spacing: 0.06em; min-width: 52px; text-align: center; }

/* ================= Responsive ================= */
@media (max-width: 900px) {
  .topbar { align-items: flex-start; flex-wrap: wrap; min-height: 138px; padding: 12px 14px; gap: 10px; }
  .topbar-left { flex: 1 1 100%; }
  .topbar-right { flex: 1 1 100%; justify-content: flex-start; }
  .team-strip { justify-content: flex-start; }
  .ticker { display: none; }
  .brand-title { gap: 8px; flex-wrap: wrap; }
  .brand-subtitle { white-space: normal; }
  .sidebar { position: fixed; top: 138px; left: 0; bottom: 0; z-index: 30; transform: translateX(-100%); transition: transform .25s ease; box-shadow: var(--shadow); }
  .sidebar.open { transform: translateX(0); }
  .scrim { display: block; position: fixed; top: 138px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 20; }
  .only-mobile { display: flex; }
  .topbar-center { display: none; }
  .stage { aspect-ratio: auto; }
  .slide { min-height: auto; }
  .card-grid.cols-2, .card-grid.cols-3, .card-grid.cols-5 { grid-template-columns: 1fr 1fr; }
  .card-grid.facts { grid-template-columns: 1fr 1fr; }
  .card-grid.facts .card:nth-child(4),
  .card-grid.facts .card:nth-child(5) { grid-column: auto; }
  .layout-theory { grid-template-columns: 1fr; grid-template-rows: auto; }
  .theory-hero { grid-row: auto; }
  .theory-list,
  .method-flow,
  .method-detail,
  .app-map,
  .balance-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .method-grid { grid-template-columns: 1fr; gap: 12px; }
  .persistence-strip { grid-template-columns: 1fr; align-items: start; }
  .cover-glyph { font-size: 120px; opacity: 0.06; }
  .cover-credits { flex-direction: column; align-items: flex-start; gap: 7px; }
}
@media (max-width: 480px) {
  .card-grid.cols-3 { grid-template-columns: 1fr; }
  .card-grid.cols-5 { grid-template-columns: 1fr 1fr; }
  .card-grid.facts { grid-template-columns: 1fr; }
  .theory-list,
  .method-flow,
  .method-detail,
  .app-map,
  .balance-grid { grid-template-columns: 1fr; }
  .balance-summary { flex-direction: column; align-items: flex-start; }
  .team-strip span { font-size: 9.6px; padding: 5px 6px; }
}
`;
