import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import { ArrowLeft, ArrowRight, Sun, Moon, Menu, X, Database, PlayCircle, Calculator } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data — extracted verbatim from Modelo_GARCH.pptx                  */
/* ------------------------------------------------------------------ */

const RETURNS = [-1.032,-0.134,-0.262,0.582,0.31,1.271,-0.346,-0.047,1.344,0.269,-0.204,0.441,0.534,0.362,-0.612,-0.2,0.089,-1.01,-2.123,-0.636,0.495,0.074,-0.465,0.219,-0.111,-2.076,1.561,0.023,-1.159,-0.709,-0.513,0.793,1.332,0.453,0.628,-1.398,2.243,-1.482,1.392,-1.214,-1.245,1.645,-0.888,0.366,-1.008,-0.583,-1.137,1.859,-1.76,2.04,-0.725,2.753,-1.358,2.606,-0.505,0.375,0.936,1.451,1.614,-0.354,-1.11,2.547,-1.602,0.476,0.424,-0.955,-1.41,0.17,1.741,1.899,0.154,-0.255,0.741,1.72,0.148,0.058,0.722,1.883,0.831,0.078,-0.057,0.726,1.338,0.639,0.453,0.268,-0.254,-1.08,-0.395,-0.314,-0.393,0.193,-0.231,1.444,-0.369,0.657,0.243,0.371,-0.773,-1.815,-0.626,-0.241,0.762,-0.488,0.649,1.494,-0.466,1.032,0.534,1.615,1.089,-0.451,-0.511,-0.889,-0.285,1.145,2.188,-1.653,-0.055,-0.76,-0.422,-0.241,-1.162,-0.524,0.34,0.603,-0.201,-0.21,-0.223,0.189,-1.565,-0.764,-1.106,-0.129,-0.781,-1.371,0.907,-0.097,0.514,0.301,-0.333,0.829,-0.242,-0.004,-0.564,0.102,0.583,0.595,0.925,0.559,-0.027,-0.578,-0.535,0.429,-0.522,-0.007,0.405,0.11,0.088,0.066,-0.228,0.822,-0.852,-0.107,-0.318,-0.275,-1.125,-0.137,0.383,-0.335,0.002,0.133,0.891,-0.78,-0.238,-0.736,0.007,0.374,-0.387,0.675,0.537,0.276,1.262,-0.643,-0.396,-0.948,1.347,0.534,-0.369,-0.043,-0.743,0.361,0.577,-0.156,0.175,-0.595,-0.727,0.217,0.49,0.084,0.295,0.807,-0.099,-0.284,-0.62,-1.092,-0.451,0.053,0.25,-0.721,-0.093,1.173,0.1,0.494,-0.374,0.244,-0.071,0.019,0.635,-0.079,-0.042,1.049,-0.18,0.041,-0.54,0.288,1.028,-0.935,1.028,-0.084,-0.637,0.473,0.283,0.74,-0.774,0.524,-0.301,0.924,0.715,0.378,-0.224,-0.37,0.021,0.844,0.015,-0.419,0.505,0.257,-0.057,-0.153,0.889,0.108,0.628,0.235,0.287,-0.111,0.652,1.063,-0.366,0.166];

const YEAR_TICKS = [0, 52, 104, 156, 208];
const YEAR_LABELS = ["2019", "2020", "2021", "2022", "2023"];
const chartData = RETURNS.map((v, i) => ({ i, v }));

const TEAM = ["Chicaiza Eduardo", "Navarrete Marlon", "Pineda Fabricio", "Soria Samanta", "Tapia Alex"];

const OIL_ANNUAL = [
  { year: 2007, prod: 511.1 }, { year: 2008, prod: 504.8 }, { year: 2009, prod: 486.1 },
  { year: 2010, prod: 485.2 }, { year: 2011, prod: 500.4 }, { year: 2012, prod: 503.6 },
  { year: 2013, prod: 526.2 }, { year: 2014, prod: 556.3 }, { year: 2015, prod: 543.2 },
  { year: 2016, prod: 548.4 }, { year: 2017, prod: 531.3 }, { year: 2018, prod: 517.2 },
  { year: 2019, prod: 531.1 }, { year: 2020, prod: 479.2 }, { year: 2021, prod: 473.3 },
  { year: 2022, prod: 480.8 }, { year: 2023, prod: 475.1 }, { year: 2024, prod: 475.3 },
  { year: 2025, prod: 441.2 }, { year: 2026, prod: 459.8 },
];

const OIL_SHOCKS = [
  { period: "Agosto 2025", ret: 1.154, from: 147.5, to: 468.1 },
  { period: "Julio 2025", ret: -1.152, from: 467.1, to: 147.5 },
  { period: "Abril 2020", ret: -0.946, from: 540.7, to: 209.9 },
  { period: "Diciembre 2021", ret: -0.677, from: 484.9, to: 246.3 },
  { period: "Enero 2022", ret: 0.616, from: 246.3, to: 456.0 },
];

const GARCH_FIT = {
  observations: 232,
  archLm: 55.6707,
  archP: 0.000000,
  postP: 0.908068,
  logLikelihood: 178.566,
  aic: -349.132,
  bic: -335.345,
  mu: -0.005023,
  omega: 0.000368,
  alpha: 0.0334,
  beta: 0.9535,
  persistence: 0.9869,
};

const FORECAST_2027 = [
  { month: "Ene", vol: 0.254240 }, { month: "Feb", vol: 0.253297 },
  { month: "Mar", vol: 0.252363 }, { month: "Abr", vol: 0.251439 },
  { month: "May", vol: 0.250522 }, { month: "Jun", vol: 0.249615 },
  { month: "Jul", vol: 0.248716 }, { month: "Ago", vol: 0.247826 },
  { month: "Sep", vol: 0.246944 }, { month: "Oct", vol: 0.246071 },
  { month: "Nov", vol: 0.245206 }, { month: "Dic", vol: 0.244349 },
];

/* ---- Datos del Excel GARCH-EXCEL.xlsx (índice bursátil, feb–jun 2026) ---- */
/* ---- Datos del Excel GARCH-EXCEL.xlsx (índice bursátil, feb–jun 2026) ---- */
const EXCEL_FULL_DATA = [{"t": 1, "fecha": "2026-02-17", "precio": 6843.22, "rt": 0.1031, "e2": 0.010624, "sig2": 0.819061, "sig": 0.905, "z": -0.214, "ysim": -0.1937}, {"t": 2, "fecha": "2026-02-18", "precio": 6881.31, "rt": 0.5551, "e2": 0.308098, "sig2": 0.817265, "sig": 0.904, "z": 0.7138, "ysim": 0.6453}, {"t": 3, "fecha": "2026-02-19", "precio": 6861.89, "rt": -0.2826, "e2": 0.07987, "sig2": 0.845485, "sig": 0.9195, "z": -0.4903, "ysim": -0.4509}, {"t": 4, "fecha": "2026-02-20", "precio": 6909.51, "rt": 0.6916, "e2": 0.478284, "sig2": 0.846649, "sig": 0.9201, "z": -0.1674, "ysim": -0.154}, {"t": 5, "fecha": "2026-02-23", "precio": 6837.75, "rt": -1.044, "e2": 1.089935, "sig2": 0.88748, "sig": 0.9421, "z": 2.3552, "ysim": 2.2187}, {"t": 6, "fecha": "2026-02-24", "precio": 6890.07, "rt": 0.7623, "e2": 0.581027, "sig2": 0.983352, "sig": 0.9916, "z": 1.8244, "ysim": 1.8092}, {"t": 7, "fecha": "2026-02-25", "precio": 6946.13, "rt": 0.8103, "e2": 0.656655, "sig2": 1.013952, "sig": 1.007, "z": -1.0047, "ysim": -1.0117}, {"t": 8, "fecha": "2026-02-26", "precio": 6908.86, "rt": -0.538, "e2": 0.289447, "sig2": 1.047524, "sig": 1.0235, "z": 1.128, "ysim": 1.1545}, {"t": 9, "fecha": "2026-02-27", "precio": 6878.88, "rt": -0.4349, "e2": 0.189117, "sig2": 1.039343, "sig": 1.0195, "z": -0.5338, "ysim": -0.5442}, {"t": 10, "fecha": "2026-03-02", "precio": 6881.62, "rt": 0.0398, "e2": 0.001586, "sig2": 1.022341, "sig": 1.0111, "z": -0.2962, "ysim": -0.2995}, {"t": 11, "fecha": "2026-03-03", "precio": 6816.63, "rt": -0.9489, "e2": 0.900392, "sig2": 0.989146, "sig": 0.9946, "z": -0.3167, "ysim": -0.315}, {"t": 12, "fecha": "2026-03-04", "precio": 6869.5, "rt": 0.7726, "e2": 0.596928, "sig2": 1.050829, "sig": 1.0251, "z": 1.2697, "ysim": 1.3015}, {"t": 13, "fecha": "2026-03-05", "precio": 6830.71, "rt": -0.5663, "e2": 0.320662, "sig2": 1.072877, "sig": 1.0358, "z": -0.2907, "ysim": -0.3011}, {"t": 14, "fecha": "2026-03-06", "precio": 6740.02, "rt": -1.3366, "e2": 1.786427, "sig2": 1.064027, "sig": 1.0315, "z": 0.2242, "ysim": 0.2313}, {"t": 15, "fecha": "2026-03-09", "precio": 6795.99, "rt": 0.827, "e2": 0.683901, "sig2": 1.203061, "sig": 1.0968, "z": -1.6278, "ysim": -1.7854}, {"t": 16, "fecha": "2026-03-10", "precio": 6781.48, "rt": -0.2137, "e2": 0.045682, "sig2": 1.21099, "sig": 1.1004, "z": -1.1041, "ysim": -1.215}, {"t": 17, "fecha": "2026-03-11", "precio": 6775.8, "rt": -0.0838, "e2": 0.007021, "sig2": 1.153907, "sig": 1.0742, "z": 0.6541, "ysim": 0.5951}, {"t": 18, "fecha": "2026-03-12", "precio": 6672.62, "rt": -1.5345, "e2": 2.354673, "sig2": 1.101538, "sig": 1.0495, "z": -0.8858, "ysim": -0.9296}, {"t": 19, "fecha": "2026-03-13", "precio": 6632.19, "rt": -0.6078, "e2": 0.369357, "sig2": 1.291771, "sig": 1.1366, "z": 1.952, "ysim": 2.2186}, {"t": 20, "fecha": "2026-03-16", "precio": 6699.38, "rt": 1.008, "e2": 1.01604, "sig2": 1.254938, "sig": 1.1202, "z": -1.1596, "ysim": -1.299}, {"t": 21, "fecha": "2026-03-17", "precio": 6716.09, "rt": 0.2491, "e2": 0.062061, "sig2": 1.288287, "sig": 1.135, "z": -1.088, "ysim": -1.2349}, {"t": 22, "fecha": "2026-03-18", "precio": 6624.7, "rt": -1.3701, "e2": 1.877209, "sig2": 1.221268, "sig": 1.1051, "z": -1.1477, "ysim": -1.2684}, {"t": 23, "fecha": "2026-03-19", "precio": 6606.49, "rt": -0.2753, "e2": 0.07577, "sig2": 1.345799, "sig": 1.1601, "z": -0.1947, "ysim": -0.2258}, {"t": 24, "fecha": "2026-03-20", "precio": 6506.48, "rt": -1.5254, "e2": 2.326815, "sig2": 1.271499, "sig": 1.1276, "z": -0.1974, "ysim": -0.2226}, {"t": 25, "fecha": "2026-03-23", "precio": 6581, "rt": 1.1388, "e2": 1.296886, "sig2": 1.433456, "sig": 1.1973, "z": 0.9678, "ysim": 1.1587}, {"t": 26, "fecha": "2026-03-24", "precio": 6556.37, "rt": -0.375, "e2": 0.140599, "sig2": 1.468126, "sig": 1.2117, "z": 0.021, "ysim": 0.0255}, {"t": 27, "fecha": "2026-03-25", "precio": 6591.9, "rt": 0.5405, "e2": 0.292081, "sig2": 1.381966, "sig": 1.1756, "z": 0.5914, "ysim": 0.6952}, {"t": 28, "fecha": "2026-03-26", "precio": 6477.16, "rt": -1.756, "e2": 3.083378, "sig2": 1.32388, "sig": 1.1506, "z": 0.859, "ysim": 0.9884}, {"t": 29, "fecha": "2026-03-27", "precio": 6368.85, "rt": -1.6863, "e2": 2.843685, "sig2": 1.553635, "sig": 1.2465, "z": -0.3084, "ysim": -0.3844}, {"t": 30, "fecha": "2026-03-30", "precio": 6343.72, "rt": -0.3954, "e2": 0.15631, "sig2": 1.724957, "sig": 1.3134, "z": 0.0773, "ysim": 0.1016}, {"t": 31, "fecha": "2026-03-31", "precio": 6528.52, "rt": 2.8715, "e2": 8.245428, "sig2": 1.601844, "sig": 1.2656, "z": -0.7756, "ysim": -0.9816}, {"t": 32, "fecha": "2026-04-01", "precio": 6575.32, "rt": 0.7143, "e2": 0.510228, "sig2": 2.30611, "sig": 1.5186, "z": 0.4683, "ysim": 0.7112}, {"t": 33, "fecha": "2026-04-02", "precio": 6582.69, "rt": 0.112, "e2": 0.012549, "sig2": 2.131216, "sig": 1.4599, "z": 0.1959, "ysim": 0.2859}, {"t": 34, "fecha": "2026-04-06", "precio": 6611.83, "rt": 0.4417, "e2": 0.195096, "sig2": 1.932788, "sig": 1.3903, "z": -1.923, "ysim": -2.6734}, {"t": 35, "fecha": "2026-04-07", "precio": 6616.85, "rt": 0.0759, "e2": 0.005761, "sig2": 1.782379, "sig": 1.3351, "z": -1.3562, "ysim": -1.8106}, {"t": 36, "fecha": "2026-04-08", "precio": 6782.81, "rt": 2.4772, "e2": 6.136511, "sig2": 1.635602, "sig": 1.2789, "z": -0.6858, "ysim": -0.877}, {"t": 37, "fecha": "2026-04-09", "precio": 6824.66, "rt": 0.6151, "e2": 0.378361, "sig2": 2.123913, "sig": 1.4574, "z": -1.5272, "ysim": -2.2257}, {"t": 38, "fecha": "2026-04-10", "precio": 6816.89, "rt": -0.1139, "e2": 0.012978, "sig2": 1.963162, "sig": 1.4011, "z": 1.682, "ysim": 2.3567}, {"t": 39, "fecha": "2026-04-13", "precio": 6886.24, "rt": 1.0122, "e2": 1.024526, "sig2": 1.789966, "sig": 1.3379, "z": 1.1277, "ysim": 1.5087}, {"t": 40, "fecha": "2026-04-14", "precio": 6967.38, "rt": 1.1714, "e2": 1.372186, "sig2": 1.743924, "sig": 1.3206, "z": 0.7804, "ysim": 1.0306}, {"t": 41, "fecha": "2026-04-15", "precio": 7022.95, "rt": 0.7944, "e2": 0.631089, "sig2": 1.739545, "sig": 1.3189, "z": -0.5681, "ysim": -0.7493}, {"t": 42, "fecha": "2026-04-16", "precio": 7041.28, "rt": 0.2607, "e2": 0.067942, "sig2": 1.661722, "sig": 1.2891, "z": 1.118, "ysim": 1.4412}, {"t": 43, "fecha": "2026-04-17", "precio": 7126.06, "rt": 1.1969, "e2": 1.432439, "sig2": 1.539258, "sig": 1.2407, "z": -0.6172, "ysim": -0.7657}, {"t": 44, "fecha": "2026-04-20", "precio": 7109.14, "rt": -0.2377, "e2": 0.056509, "sig2": 1.571613, "sig": 1.2536, "z": -0.1526, "ysim": -0.1913}, {"t": 45, "fecha": "2026-04-21", "precio": 7064.01, "rt": -0.6368, "e2": 0.405565, "sig2": 1.461536, "sig": 1.2089, "z": -0.6437, "ysim": -0.7782}, {"t": 46, "fecha": "2026-04-22", "precio": 7137.9, "rt": 1.0406, "e2": 1.082794, "sig2": 1.402862, "sig": 1.1844, "z": -0.7631, "ysim": -0.9038}, {"t": 47, "fecha": "2026-04-23", "precio": 7108.4, "rt": -0.4141, "e2": 0.171515, "sig2": 1.420712, "sig": 1.1919, "z": 0.463, "ysim": 0.5519}, {"t": 48, "fecha": "2026-04-24", "precio": 7165.08, "rt": 0.7942, "e2": 0.630761, "sig2": 1.344757, "sig": 1.1596, "z": 0.0188, "ysim": 0.0218}, {"t": 49, "fecha": "2026-04-27", "precio": 7173.91, "rt": 0.1232, "e2": 0.015169, "sig2": 1.326119, "sig": 1.1516, "z": -0.6832, "ysim": -0.7867}, {"t": 50, "fecha": "2026-04-28", "precio": 7138.8, "rt": -0.4906, "e2": 0.240702, "sig2": 1.248718, "sig": 1.1175, "z": 0.6558, "ysim": 0.7329}, {"t": 51, "fecha": "2026-04-29", "precio": 7135.95, "rt": -0.0399, "e2": 0.001594, "sig2": 1.205481, "sig": 1.0979, "z": 0.8484, "ysim": 0.9315}, {"t": 52, "fecha": "2026-04-30", "precio": 7209.01, "rt": 1.0186, "e2": 1.037596, "sig2": 1.144818, "sig": 1.07, "z": -0.2315, "ysim": -0.2477}, {"t": 53, "fecha": "2026-05-01", "precio": 7230.12, "rt": 0.2924, "e2": 0.085498, "sig2": 1.196855, "sig": 1.094, "z": -1.4312, "ysim": -1.5657}, {"t": 54, "fecha": "2026-05-04", "precio": 7200.75, "rt": -0.407, "e2": 0.165685, "sig2": 1.145876, "sig": 1.0705, "z": 0.3983, "ysim": 0.4263}, {"t": 55, "fecha": "2026-05-05", "precio": 7259.22, "rt": 0.8087, "e2": 0.654028, "sig2": 1.110563, "sig": 1.0538, "z": -0.1727, "ysim": -0.182}, {"t": 56, "fecha": "2026-05-06", "precio": 7365.12, "rt": 1.4483, "e2": 2.097561, "sig2": 1.129382, "sig": 1.0627, "z": 1.2242, "ysim": 1.301}, {"t": 57, "fecha": "2026-05-07", "precio": 7337.11, "rt": -0.381, "e2": 0.145185, "sig2": 1.289731, "sig": 1.1357, "z": 0.5947, "ysim": 0.6754}, {"t": 58, "fecha": "2026-05-08", "precio": 7398.93, "rt": 0.839, "e2": 0.703982, "sig2": 1.230789, "sig": 1.1094, "z": 0.1611, "ysim": 0.1787}, {"t": 59, "fecha": "2026-05-11", "precio": 7412.84, "rt": 0.1878, "e2": 0.035278, "sig2": 1.236569, "sig": 1.112, "z": 0.0184, "ysim": 0.0204}, {"t": 60, "fecha": "2026-05-12", "precio": 7400.96, "rt": -0.1604, "e2": 0.025725, "sig2": 1.174612, "sig": 1.0838, "z": 0.8264, "ysim": 0.8956}, {"t": 61, "fecha": "2026-05-13", "precio": 7444.25, "rt": 0.5832, "e2": 0.340146, "sig2": 1.120992, "sig": 1.0588, "z": 0.6935, "ysim": 0.7342}, {"t": 62, "fecha": "2026-05-14", "precio": 7501.24, "rt": 0.7626, "e2": 0.581622, "sig2": 1.106858, "sig": 1.0521, "z": 0.1196, "ysim": 0.1258}, {"t": 63, "fecha": "2026-05-15", "precio": 7408.5, "rt": -1.244, "e2": 1.547623, "sig2": 1.118992, "sig": 1.0578, "z": -0.9348, "ysim": -0.9888}, {"t": 64, "fecha": "2026-05-18", "precio": 7403.05, "rt": -0.0736, "e2": 0.005416, "sig2": 1.225905, "sig": 1.1072, "z": -1.3218, "ysim": -1.4636}, {"t": 65, "fecha": "2026-05-19", "precio": 7353.61, "rt": -0.6701, "e2": 0.448998, "sig2": 1.162561, "sig": 1.0782, "z": -0.1482, "ysim": -0.1598}, {"t": 66, "fecha": "2026-05-20", "precio": 7432.97, "rt": 1.0734, "e2": 1.152222, "sig2": 1.153077, "sig": 1.0738, "z": 0.0583, "ysim": 0.0626}, {"t": 67, "fecha": "2026-05-21", "precio": 7445.72, "rt": 0.1714, "e2": 0.029373, "sig2": 1.215337, "sig": 1.1024, "z": 0.5398, "ysim": 0.5951}, {"t": 68, "fecha": "2026-05-22", "precio": 7473.47, "rt": 0.372, "e2": 0.138387, "sig2": 1.155974, "sig": 1.0752, "z": -0.83, "ysim": -0.8924}, {"t": 69, "fecha": "2026-05-26", "precio": 7519.12, "rt": 0.609, "e2": 0.370844, "sig2": 1.116417, "sig": 1.0566, "z": 1.6126, "ysim": 1.7038}, {"t": 70, "fecha": "2026-05-27", "precio": 7520.36, "rt": 0.0165, "e2": 0.000272, "sig2": 1.106039, "sig": 1.0517, "z": 1.0974, "ysim": 1.1541}, {"t": 71, "fecha": "2026-05-28", "precio": 7563.63, "rt": 0.5737, "e2": 0.329157, "sig2": 1.06016, "sig": 1.0296, "z": 1.0766, "ysim": 1.1086}, {"t": 72, "fecha": "2026-05-29", "precio": 7580.06, "rt": 0.217, "e2": 0.047084, "sig2": 1.054052, "sig": 1.0267, "z": 0.1024, "ysim": 0.1052}, {"t": 73, "fecha": "2026-06-01", "precio": 7599.96, "rt": 0.2622, "e2": 0.068742, "sig2": 1.020652, "sig": 1.0103, "z": -0.1227, "ysim": -0.124}, {"t": 74, "fecha": "2026-06-02", "precio": 7609.78, "rt": 0.1291, "e2": 0.016674, "sig2": 0.994429, "sig": 0.9972, "z": -0.5747, "ysim": -0.5731}, {"t": 75, "fecha": "2026-06-03", "precio": 7553.68, "rt": -0.7399, "e2": 0.547511, "sig2": 0.966932, "sig": 0.9833, "z": -0.9964, "ysim": -0.9798}, {"t": 76, "fecha": "2026-06-04", "precio": 7584.31, "rt": 0.4047, "e2": 0.163764, "sig2": 0.996643, "sig": 0.9983, "z": 0.0775, "ysim": 0.0774}, {"t": 77, "fecha": "2026-06-05", "precio": 7383.74, "rt": -2.6801, "e2": 7.183126, "sig2": 0.983523, "sig": 0.9917, "z": 0.997, "ysim": 0.9888}, {"t": 78, "fecha": "2026-06-08", "precio": 7405.73, "rt": 0.2974, "e2": 0.088431, "sig2": 1.674307, "sig": 1.294, "z": -0.5026, "ysim": -0.6504}, {"t": 79, "fecha": "2026-06-09", "precio": 7386.65, "rt": -0.258, "e2": 0.066549, "sig2": 1.552004, "sig": 1.2458, "z": 0.8392, "ysim": 1.0454}, {"t": 80, "fecha": "2026-06-10", "precio": 7266.99, "rt": -1.6332, "e2": 2.667388, "sig2": 1.445859, "sig": 1.2024, "z": -0.3419, "ysim": -0.4111}, {"t": 81, "fecha": "2026-06-11", "precio": 7394.3, "rt": 1.7367, "e2": 3.016216, "sig2": 1.615719, "sig": 1.2711, "z": 1.1853, "ysim": 1.5066}, {"t": 82, "fecha": "2026-06-12", "precio": 7431.46, "rt": 0.5013, "e2": 0.251292, "sig2": 1.794982, "sig": 1.3398, "z": 0.631, "ysim": 0.8455}, {"t": 83, "fecha": "2026-06-15", "precio": 7554.29, "rt": 1.6393, "e2": 2.687394, "sig2": 1.670864, "sig": 1.2926, "z": -1.5005, "ysim": -1.9396}, {"t": 84, "fecha": "2026-06-16", "precio": 7511.35, "rt": -0.57, "e2": 0.324946, "sig2": 1.808974, "sig": 1.345, "z": -0.8621, "ysim": -1.1596}, {"t": 85, "fecha": "2026-06-17", "precio": 7420.1, "rt": -1.2223, "e2": 1.493938, "sig2": 1.690123, "sig": 1.3, "z": 0.9056, "ysim": 1.1773}, {"t": 86, "fecha": "2026-06-18", "precio": 7500.58, "rt": 1.0788, "e2": 1.16377, "sig2": 1.705998, "sig": 1.3061, "z": -1.0941, "ysim": -1.429}, {"t": 87, "fecha": "2026-06-22", "precio": 7472.79, "rt": -0.3712, "e2": 0.137784, "sig2": 1.686475, "sig": 1.2986, "z": 0.9276, "ysim": 1.2046}, {"t": 88, "fecha": "2026-06-23", "precio": 7365.46, "rt": -1.4467, "e2": 2.092917, "sig2": 1.567282, "sig": 1.2519, "z": 1.031, "ysim": 1.2907}, {"t": 89, "fecha": "2026-06-24", "precio": 7358.22, "rt": -0.0983, "e2": 0.009672, "sig2": 1.661482, "sig": 1.289, "z": 1.2018, "ysim": 1.5491}, {"t": 90, "fecha": "2026-06-25", "precio": 7357.49, "rt": -0.0099, "e2": 9.8e-05, "sig2": 1.533227, "sig": 1.2382, "z": -0.8573, "ysim": -1.0615}, {"t": 91, "fecha": "2026-06-26", "precio": 7354.02, "rt": -0.0472, "e2": 0.002225, "sig2": 1.423253, "sig": 1.193, "z": -1.7018, "ysim": -2.0303}, {"t": 92, "fecha": "2026-06-29", "precio": 7440.43, "rt": 1.1682, "e2": 1.364584, "sig2": 1.329987, "sig": 1.1533, "z": -0.0198, "ysim": -0.0228}, {"t": 93, "fecha": "2026-06-30", "precio": 7499.36, "rt": 0.7889, "e2": 0.62237, "sig2": 1.386947, "sig": 1.1777, "z": 0.6926, "ysim": 0.8157}, {"t": 94, "fecha": "2026-07-01", "precio": 7483.23, "rt": -0.2153, "e2": 0.046361, "sig2": 1.361142, "sig": 1.1667, "z": 1.0808, "ysim": 1.2609}, {"t": 95, "fecha": "2026-07-02", "precio": 7483.24, "rt": 0.0001, "e2": 0.0, "sig2": 1.281607, "sig": 1.1321, "z": -0.752, "ysim": -0.8513}, {"t": 96, "fecha": "2026-07-06", "precio": 7537.43, "rt": 0.7215, "e2": 0.520623, "sig2": 1.209366, "sig": 1.0997, "z": -0.3715, "ysim": -0.4086}, {"t": 97, "fecha": "2026-07-07", "precio": 7503.85, "rt": -0.4465, "e2": 0.199367, "sig2": 1.200023, "sig": 1.0955, "z": -0.4142, "ysim": -0.4537}, {"t": 98, "fecha": "2026-07-08", "precio": 7482.71, "rt": -0.2821, "e2": 0.079591, "sig2": 1.159957, "sig": 1.077, "z": 0.3695, "ysim": 0.3979}, {"t": 99, "fecha": "2026-07-09", "precio": 7543.64, "rt": 0.811, "e2": 0.657688, "sig2": 1.113922, "sig": 1.0554, "z": 0.6976, "ysim": 0.7363}, {"t": 100, "fecha": "2026-07-10", "precio": 7575.39, "rt": 0.42, "e2": 0.176401, "sig2": 1.132603, "sig": 1.0642, "z": -0.4711, "ysim": -0.5013}];

const EXCEL_FIT = {
  omega: 0.0000120, alpha: 0.10, beta: 0.85, persistence: 0.95,
  volDiaria: 1.5492, volAnual: 24.59,
  volMedia: 1.1454, volMax: 1.5186, volMin: 0.9040,
  nobs: 100, periodo: "Feb–Jun 2026",
};

/* ------------------------------------------------------------------ */
/*  Nav structure — grouped outline for the sidebar                   */
/* ------------------------------------------------------------------ */

const OUTLINE = [
  { group: "Introducción", items: [
    { idx: 0,  tag: "01", title: "¿Qué es el modelo GARCH?" },
    { idx: 1,  tag: "02", title: "Historia del modelo" },
    { idx: 2,  tag: "03", title: "¿Qué es la volatilidad?" },
    { idx: 3,  tag: "04", title: "¿Por qué se llama GARCH?" },
  ]},
  { group: "Fundamentos", items: [
    { idx: 4,  tag: "05", title: "Motivación" },
    { idx: 5,  tag: "06", title: "Regularidades empíricas" },
  ]},
  { group: "El modelo", items: [
    { idx: 6,  tag: "07", title: "Modelo ARCH" },
    { idx: 7,  tag: "08", title: "Modelo GARCH" },
    { idx: 8,  tag: "09", title: "GARCH(1,1)" },
  ]},
  { group: "Teoría", items: [
    { idx: 9,  tag: "10", title: "Propiedades estadísticas" },
    { idx: 10, tag: "11", title: "Fórmulas y parámetros" },
    { idx: 11, tag: "12", title: "Hipótesis y supuestos" },
    { idx: 12, tag: "13", title: "Interpretación" },
    { idx: 13, tag: "14", title: "Distribuciones" },
  ]},
  { group: "Análisis", items: [
    { idx: 14, tag: "15", title: "Estimación y diagnóstico" },
  ]},
  { group: "Aplicación", items: [
    { idx: 15, tag: "16", title: "Aplicaciones" },
    { idx: 16, tag: "17", title: "Ventajas y límites" },
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
  return <div className="page-foot">Grupo 10 · {page}⁄{String(TOTAL).padStart(2, "0")}</div>;
}

/* ------------------------------------------------------------------ */
/*  Slide content                                                     */
/* ------------------------------------------------------------------ */

function SlideQueEs() {
  return (
    <div className="slide">
      <Eyebrow n="01">INTRODUCCIÓN</Eyebrow>
      <h2 className="title">¿Qué es el modelo GARCH?</h2>
      <div className="slide-body layout-nombre-clean">
        <div className="acronym-table">
          <div className="acronym-row">
            <div className="acronym-letter">G</div>
            <div className="acronym-term">Generalized</div>
            <div className="acronym-def">Generaliza el modelo ARCH incorporando los rezagos de la propia varianza condicional para mayor parsimonia.</div>
          </div>
          <div className="acronym-row">
            <div className="acronym-letter">AR</div>
            <div className="acronym-term">Autoregressive</div>
            <div className="acronym-def">Los valores de volatilidad actuales dependen y se retroalimentan de sus propios valores históricos pasados.</div>
          </div>
          <div className="acronym-row">
            <div className="acronym-letter">C</div>
            <div className="acronym-term">Conditional</div>
            <div className="acronym-def">La estimación del riesgo futuro depende directamente de la información y choques acumulados del periodo anterior.</div>
          </div>
          <div className="acronym-row">
            <div className="acronym-letter">H</div>
            <div className="acronym-term">Heteroskedasticity</div>
            <div className="acronym-def">Reconoce formalmente que la volatilidad y la varianza de los errores no son constantes y cambian en el tiempo.</div>
          </div>
        </div>

        <div className="het-section-clean">
          <div className="section-label">Comparación del Supuesto de Varianza</div>
          <div className="problems-grid">
            <div className="problem-card">
              <strong>Regresión Clásica (Homocedasticidad)</strong>
              <p>Asume que la varianza de los errores es totalmente constante. Ignora la agrupación de volatilidad extrema en periodos de crisis.</p>
            </div>
            <div className="problem-card">
              <strong>Modelo GARCH (Heterocedasticidad)</strong>
              <p>Permite que el riesgo varíe dinámicamente según sorpresas del mercado recientes y la persistencia de la volatilidad histórica.</p>
            </div>
            <div className="problem-card">
              <strong>Utilidad Práctica Principal</strong>
              <p>Modelado del riesgo cambiario, cálculo dinámico de Valor en Riesgo (VaR), optimización de portafolios y valoración de derivados.</p>
            </div>
          </div>
        </div>
      </div>
      <PageFoot page="01" />
    </div>
  );
}

function SlideHistoria() {
  const hitos = [
    { year: "1963", author: "Mandelbrot", desc: "Evidencia colas pesadas y persistencia de volatilidad en mercados financieros." },
    { year: "1982", author: "Robert Engle", desc: "Introduce el modelo ARCH, formalizando la dependencia temporal de la varianza condicional." },
    { year: "1986", author: "Tim Bollerslev", desc: "Generaliza el modelo (GARCH), incorporando la varianza rezagada para mayor parsimonia." },
    { year: "2003", author: "Premio Nobel", desc: "Otorgado a Robert Engle por su contribución al desarrollo del modelado de volatilidad temporal." },
    { year: "Actualidad", author: "Estándar global", desc: "Uso generalizado en la gestión de riesgos y optimización de carteras en la industria y academia." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="02">INTRODUCCIÓN</Eyebrow>
      <h2 className="title">Historia del modelo GARCH</h2>
      <div className="slide-body layout-historia-clean">
        <p className="lede">Durante muchos años los economistas asumían que la variabilidad de una serie permanecía constante. Al analizar mercados financieros se observó que existían periodos de calma y otros de turbulencia extrema.</p>
        <div className="timeline-horizontal">
          {hitos.map((h, i) => (
            <div className="timeline-node" key={i}>
              <div className="node-year">{h.year}</div>
              <div className="node-line-marker">
                <div className="node-dot" />
                {i < hitos.length - 1 && <div className="node-connector" />}
              </div>
              <div className="node-content">
                <strong>{h.author}</strong>
                <p>{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="pull-quote">GARCH es la evolución natural de los modelos autoregresivos aplicados al análisis del riesgo financiero.</p>
      </div>
      <PageFoot page="02" />
    </div>
  );
}

function SlideVolatilidad() {
  const ejemplos = [
    { asset: "Precio del petróleo", level: "Alto", desc: "Sensible a crisis geopolíticas, shocks de oferta y variaciones de demanda global." },
    { asset: "Tipo de cambio (Dólar)", level: "Medio", desc: "Influenciado por diferenciales de tasas de interés y políticas macroeconómicas." },
    { asset: "Acciones bursátiles", level: "Alto", desc: "Sujeto a expectativas de beneficios corporativos y shocks de sentimiento del mercado." },
    { asset: "Criptoactivos (Bitcoin)", level: "Muy alto", desc: "Mercados jóvenes con alta especulación, desregulados y expuestos a fuertes movimientos." },
    { asset: "Tasas de interés", level: "Bajo", desc: "Ajustadas por bancos centrales; volatilidad acotada excepto en periodos de transición de política." },
    { asset: "Materias primas (Cacao)", level: "Alto", desc: "Afectado por factores climáticos, cuellos de botella en la oferta y especulación." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="03">INTRODUCCIÓN</Eyebrow>
      <h2 className="title">¿Qué es la volatilidad?</h2>
      <div className="slide-body layout-volatilidad-clean">
        <div className="vol-definition">
          <p>La volatilidad representa el grado de variación o dispersión de una serie temporal respecto a su media en un periodo determinado. Es una medida clave para cuantificar el riesgo financiero: una baja volatilidad indica un comportamiento estable y predecible, mientras que una alta volatilidad denota incertidumbre y riesgo elevado.</p>
        </div>
        <div className="vol-examples">
          <div className="vol-ex-label" style={{ fontFamily: "IBM Plex Mono", fontSize: "10.5px", color: "var(--amber)", textTransform: "uppercase", marginBottom: "6px" }}>Ejemplos de variables con distinta volatilidad</div>
          <div className="vol-ex-grid-clean">
            {ejemplos.map((e, idx) => (
              <div className="vol-item-clean" key={idx}>
                <div className="vol-item-top">
                  <strong>{e.asset}</strong>
                  <span className={`vol-badge level-${e.level.toLowerCase().replace(" ", "-")}`}>{e.level}</span>
                </div>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PageFoot page="03" />
    </div>
  );
}

function SlideNombre() {
  const letras = [
    { letter: "G", term: "Generalized", definition: "Porque generaliza el modelo ARCH incorporando los rezagos de la propia varianza condicional." },
    { letter: "A", term: "Autoregressive", definition: "Porque los valores de varianza actuales dependen y se correlacionan con sus propios valores pasados." },
    { letter: "C", term: "Conditional", definition: "Porque la varianza estimada depende del conjunto de información acumulada hasta el periodo anterior." },
    { letter: "H", term: "Heteroskedasticity", definition: "Porque la varianza cambia con el tiempo, reconociendo la variabilidad de la serie de datos." }
  ];

  const problemas = [
    { title: "Homocedasticidad clásica", desc: "Los modelos tradicionales asumen varianza constante, ignorando la realidad de los mercados." },
    { title: "Periodos de crisis bursátiles", desc: "Los retornos financieros presentan agrupamientos de alta volatilidad persistente en periodos de estrés." },
    { title: "Varianza continuamente móvil", desc: "La incertidumbre no es estática; GARCH actualiza el pronóstico de riesgo en base a nuevos shocks." }
  ];

  return (
    <div className="slide">
      <Eyebrow n="04">INTRODUCCIÓN</Eyebrow>
      <h2 className="title">¿Por qué se llama GARCH? — El acrónimo</h2>
      <div className="slide-body layout-nombre-clean">
        <div className="acronym-table">
          {letras.map((l) => (
            <div className="acronym-row" key={l.letter}>
              <div className="acronym-letter">{l.letter}</div>
              <div className="acronym-term">{l.term}</div>
              <div className="acronym-def">{l.definition}</div>
            </div>
          ))}
        </div>

        <div className="het-section-clean">
          <div className="section-label">Problemas que resuelve el modelo</div>
          <div className="problems-grid">
            {problemas.map((p, i) => (
              <div className="problem-card" key={i}>
                <strong>{p.title}</strong>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PageFoot page="04" />
    </div>
  );
}

function SlideMotivacion() {
  return (
    <div className="slide">
      <Eyebrow n="05">MOTIVACIÓN</Eyebrow>
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
      <PageFoot page="05" />
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
      <Eyebrow n="06">REGULARIDADES EMPÍRICAS</Eyebrow>
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
      <PageFoot page="06" />
    </div>
  );
}

function SlideARCH() {
  return (
    <div className="slide">
      <Eyebrow n="07">EL ANTECEDENTE</Eyebrow>
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
      <PageFoot page="07" />
    </div>
  );
}

function SlideGARCH() {
  return (
    <div className="slide">
      <Eyebrow n="08">EL MODELO CENTRAL</Eyebrow>
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
      <PageFoot page="08" />
    </div>
  );
}

function SlideGARCH11() {
  return (
    <div className="slide">
      <Eyebrow n="09">EL CASO DE REFERENCIA</Eyebrow>
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
      <PageFoot page="09" />
    </div>
  );
}function SlideTeoria() {
  const props = [
    { n: "01", title: "Estacionariedad en covarianza", body: "La suma de los coeficientes (Σαᵢ + Σβⱼ) debe ser estrictamente menor a 1 para garantizar que la varianza incondicional sea finita." },
    { n: "02", title: "Persistencia del shock", body: "La suma α₁ + β₁ mide la tasa de decaimiento de la volatilidad. Si se aproxima a 1, la volatilidad disipa muy lentamente en el tiempo." },
    { n: "03", title: "Colas pesadas (Leptocurtosis)", body: "Incluso si los shocks estandarizados son normales, la variabilidad temporal en el modelo induce colas anchas en los retornos." },
    { n: "04", title: "Reversión a la media", body: "El proceso tiende a retornar a su nivel de varianza incondicional de largo plazo σ̄² = ω / (1 − Σαᵢ − Σβⱼ)." },
    { n: "05", title: "Estructura ARMA en cuadrados", body: "Los retornos cuadráticos siguen un proceso equivalente a ARMA, lo que valida el análisis de correlogramas de cuadrados." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="10">TEORÍA</Eyebrow>
      <h2 className="title">Propiedades estadísticas del proceso GARCH</h2>
      <div className="slide-body layout-theory-clean">
        <div className="theory-hero-clean">
          <div className="theory-label">Condición fundamental</div>
          <div className="theory-formula">Σαᵢ + Σβⱼ &lt; 1</div>
          <p>Esta restricción paramétrica asegura que la varianza condicional no diverja y el proceso sea estacionario.</p>
          <div className="theory-mini-eq">Varianza de largo plazo: σ̄² = ω / (1 − Σαᵢ − Σβⱼ)</div>
        </div>

        <div className="theory-table-clean">
          {props.map((p) => (
            <div className="theory-row-clean" key={p.n}>
              <span className="row-num">{p.n}</span>
              <div className="row-main">
                <strong>{p.title}</strong>
                <p>{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="persistence-strip-clean">
          <span>Régimen Estacionario (Suma &lt; 1)</span>
          <div className="persistence-bar-clean"><i /></div>
          <span>Modelo IGARCH (Suma = 1)</span>
        </div>
      </div>
      <PageFoot page="10" />
    </div>
  );
}

function SlideFormulas() {
  const params = [
    { sym: "ω", title: "Varianza incondicional base", desc: "Parámetro constante de largo plazo. Requiere ser strictly positivo." },
    { sym: "α", title: "Efecto ARCH (Reacción)", desc: "Mide el impacto de los shocks de corto plazo del periodo anterior (residuos al cuadrado)." },
    { sym: "β", title: "Efecto GARCH (Persistencia)", desc: "Mide la memoria o persistencia de la varianza condicional de periodos anteriores." },
    { sym: "ε²", title: "Shock cuadrático rezagado", desc: "Sorpresa de mercado observada en el instante anterior." },
    { sym: "σ²", title: "Varianza rezagada", desc: "Componente suavizador que representa la volatilidad anterior predicha." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="11">TEORÍA</Eyebrow>
      <h2 className="title">Fórmulas del modelo GARCH y sus parámetros</h2>
      <div className="slide-body layout-model">
        <p className="lede">El modelo GARCH(1,1) se especifica mediante tres ecuaciones relacionadas entre sí. Cada componente cumple un rol distinto en la captura de la dinámica de la volatilidad.</p>

        <div className="formulas-stack-clean">
          <div className="formula-item">
            <span className="formula-type media">Media Condicional</span>
            <div className="formula-math">
              <div className="eq-main">rₜ = μ + εₜ</div>
              <p>El retorno real se define como el promedio condicional más una perturbación aleatoria.</p>
            </div>
          </div>
          <div className="formula-item">
            <span className="formula-type error">Término de Error</span>
            <div className="formula-math">
              <div className="eq-main">εₜ = σₜ zₜ ,&nbsp;&nbsp; zₜ ~ i.i.d. N(0, 1)</div>
              <p>El error se modela como el producto de la volatilidad condicional y un shock estandarizado.</p>
            </div>
          </div>
          <div className="formula-item">
            <span className="formula-type varianza">Varianza Condicional</span>
            <div className="formula-math">
              <div className="eq-main">σ²ₜ = ω + α ε²ₜ₋₁ + β σ²ₜ₋₁</div>
              <p>Varianza móvil para el periodo t, ponderada por la constante y rezagos de shocks y varianzas.</p>
            </div>
          </div>
        </div>

        <div className="params-table-clean">
          {params.map((p) => (
            <div className="param-row-clean" key={p.sym}>
              <span className="param-symbol">{p.sym}</span>
              <div className="param-info">
                <strong>{p.title}</strong>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageFoot page="11" />
    </div>
  );
}

function SlideHipotesis() {
  const supuestos = [
    { n: "01", title: "Estacionariedad débil", body: "La serie original de retornos debe ser estacionaria para evitar regresiones espurias." },
    { n: "02", title: "Heterocedasticidad condicional", body: "Existencia comprobada de autocorrelación en los residuos cuadráticos de la media." },
    { n: "03", title: "Media condicional nula", body: "El término de error debe poseer una media esperada igual a cero condicionada al pasado." },
    { n: "04", title: "Parámetros positivos", body: "Restricciones de no negatividad: ω > 0, α ≥ 0, β ≥ 0 para garantizar que la varianza sea positiva." },
    { n: "05", title: "Estabilidad del sistema", body: "La suma de los coeficientes de varianza debe cumplir la condición α + β < 1." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="12">TEORÍA</Eyebrow>
      <h2 className="title">Hipótesis ARCH-LM y supuestos del modelo</h2>
      <div className="slide-body layout-hipotesis-clean">
        <div className="hypothesis-row">
          <div className="hyp-card h0">
            <span className="card-label">Hipótesis Nula (H₀)</span>
            <strong>Homocedasticidad</strong>
            <p>No existen efectos ARCH en los residuos. La varianza de la perturbación es constante en el tiempo.</p>
          </div>
          <div className="hyp-card h1">
            <span className="card-label">Hipótesis Alternativa (H₁)</span>
            <strong>Heterocedasticidad Condicional</strong>
            <p>Existen efectos ARCH. La varianza de los errores cambia a lo largo de la muestra condicionado al pasado.</p>
          </div>
          <div className="hyp-card decision">
            <span className="card-label">Regla de Decisión</span>
            <strong>Rechazo de H₀</strong>
            <p>Si el p-valor de la prueba ARCH-LM es menor al nivel de significancia (α = 0.05), se concluye que el modelo GARCH es adecuado.</p>
          </div>
        </div>

        <div className="supuestos-header">Supuestos del modelo GARCH</div>
        <div className="supuestos-grid-clean">
          {supuestos.map((s) => (
            <div className="supuesto-item-clean" key={s.n}>
              <span className="supuesto-num">{s.n}</span>
              <div className="supuesto-main">
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageFoot page="12" />
    </div>
  );
}

function SlideInterpretacion() {
  const cases = [
    { label: "α Elevado", color: "amber", title: "Alta Reactividad", body: "La volatilidad responde rápidamente ante shocks recientes del mercado. Los picos de varianza son abruptos ante nuevas noticias.", example: "Comportamiento en activos altamente especulativos." },
    { label: "β Elevado", color: "blue", title: "Alta Persistencia", body: "La volatilidad presenta memoria larga. Los periodos de incertidumbre alta persisten y tardan en retornar al nivel promedio.", example: "Comportamiento típico de índices bursátiles generales." },
    { label: "α + β ≈ 1", color: "red", title: "Volatilidad Integrada (IGARCH)", body: "Los impactos sobre la volatilidad son permanentes. La varianza condicional de largo plazo no converge a un nivel finito.", example: "Mercados financieros bajo estrés continuo." },
    { label: "α + β < 1", color: "green", title: "Proceso Estacionario", body: "El modelo es estable y converge gradualmente hacia su volatilidad de largo plazo σ̄² = ω / (1 - α - β).", example: "Especificación requerida para predicción de riesgo estándar." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="13">TEORÍA</Eyebrow>
      <h2 className="title">Interpretación de los parámetros del modelo</h2>
      <div className="slide-body layout-interp-clean">
        <p className="lede">La lectura conjunta de α y β determina el perfil de volatilidad: qué tan rápido reacciona a noticias y qué tan largo es su efecto en el tiempo.</p>
        <div className="interp-grid-clean">
          {cases.map((c) => (
            <div className={`interp-card-clean color-${c.color}`} key={c.label}>
              <span className="interp-label">{c.label}</span>
              <strong>{c.title}</strong>
              <p>{c.body}</p>
              <em className="interp-example">{c.example}</em>
            </div>
          ))}
        </div>
        <div className="interp-table-summary">
          <div className="table-row-clean">
            <span className="param-comb">α Bajo, β Alto</span>
            <span>Efecto de suavizado predominante: volatilidad estable con memoria larga ante eventos pasados.</span>
          </div>
          <div className="table-row-clean">
            <span className="param-comb">α Alto, β Bajo</span>
            <span>Efecto de reacción inmediata predominante: picos rápidos de riesgo pero disipación veloz.</span>
          </div>
          <div className="table-row-clean">
            <span className="param-comb">α + β Cercano a 1</span>
            <span>Comportamiento típico en finanzas: alta persistencia agrupada de volatilidad (Volatility Clustering).</span>
          </div>
        </div>
      </div>
      <PageFoot page="13" />
    </div>
  );
}

function SlideDistribuciones() {
  const dists = [
    { name: "Normal estándar N(0,1)", pros: "Facilidad de cómputo y convergencia rápida del estimador.", cons: "Subestima sistemáticamente la probabilidad de ocurrencia de shocks extremos (colas delgadas).", uso: "Series temporales con colas moderadas o bajo Quasi-Máxima Verosimilitud (QML)." },
    { name: "t de Student condicional", pros: "Incorpora colas pesadas endógenas y modela adecuadamente la curtosis financiera.", cons: "Requiere estimar un parámetro adicional para los grados de libertad.", uso: "Series de retornos bursátiles y de tipos de cambio de alta frecuencia." },
    { name: "Distribución de Error Generalizado (GED)", pros: "Alta flexibilidad matemática, incluye la distribución normal y la de Laplace como casos específicos.", cons: "Estimación computacional más costosa y menor familiaridad interpretativa.", uso: "Series financieras con colas pesadas que no se ajustan de manera óptima a la t de Student." }
  ];
  return (
    <div className="slide">
      <Eyebrow n="14">TEORÍA</Eyebrow>
      <h2 className="title">Distribuciones de los errores estandarizados</h2>
      <div className="slide-body layout-dists-clean">
        <p className="lede">Para estimar el modelo mediante verosimilitud, se debe asumir una distribución de probabilidad para el residuo estandarizado.</p>
        
        <Eq note="El supuesto básico de GARCH requiere que z_t sea una variable independiente e idénticamente distribuida.">
          <div className="eq-main">zₜ ~ i.i.d. D(0, 1)</div>
        </Eq>

        <div className="dists-table">
          <div className="dists-table-header">
            <div>Distribución</div>
            <div>Ventajas principales</div>
            <div>Limitaciones</div>
            <div>Aplicación típica</div>
          </div>
          {dists.map((d) => (
            <div className="dists-table-row" key={d.name}>
              <div className="dist-col-name">{d.name}</div>
              <div>{d.pros}</div>
              <div>{d.cons}</div>
              <div>{d.uso}</div>
            </div>
          ))}
        </div>
      </div>
      <PageFoot page="14" />
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
      <Eyebrow n="15">METODOLOGÍA</Eyebrow>
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
      <PageFoot page="15" />
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
      <Eyebrow n="16">EN LA PRÁCTICA</Eyebrow>
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
      <PageFoot page="16" />
    </div>
  );
}

function PracticalLab({ onClose }) {
  const steps = [
    { tag: "01", title: "Cargar datos", code: "pd.read_excel('produccion petroleo mensual 2007.xlsx')", result: "233 meses cargados: enero 2007 - mayo 2026." },
    { tag: "02", title: "Calcular retornos", code: "retornos = np.log(prod).diff().dropna()", result: "232 retornos logarítmicos listos para modelar." },
    { tag: "03", title: "Diagnóstico ARCH-LM", code: "het_arch(retornos, nlags=12)", result: `ARCH-LM = ${GARCH_FIT.archLm.toFixed(2)}; p-valor = 0.000000.` },
    { tag: "04", title: "Estimar GARCH(1,1)", code: "arch_model(retornos, vol='GARCH', p=1, q=1).fit()", result: `α₁ = ${GARCH_FIT.alpha.toFixed(4)}, β₁ = ${GARCH_FIT.beta.toFixed(4)}, persistencia = ${GARCH_FIT.persistence.toFixed(4)}.` },
    { tag: "05", title: "Pronosticar 2027", code: "forecast(horizon=12)", result: "La volatilidad baja de 0.2542 a 0.2443 si no hay nuevos choques." },
  ];
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    if (step >= steps.length - 1) {
      setRunning(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setStep((s) => s + 1), 900);
    return () => window.clearTimeout(timer);
  }, [running, step, steps.length]);

  const run = () => {
    setStep(0);
    setRunning(true);
  };

  const visibleForecast = FORECAST_2027.slice(0, step >= 4 ? FORECAST_2027.length : 3);
  const params = [
    ["μ", GARCH_FIT.mu.toFixed(6), "retorno medio"],
    ["ω", GARCH_FIT.omega.toFixed(6), "varianza base"],
    ["α₁", GARCH_FIT.alpha.toFixed(4), "choque corto plazo"],
    ["β₁", GARCH_FIT.beta.toFixed(4), "memoria"],
  ];

  return (
    <section className="lab-overlay" aria-label="Caso practico dinamico">
      <div className="lab-shell">
        <div className="lab-head">
          <div>
            <div className="brand-kicker">CASO PRÁCTICO</div>
            <h2>Producción de petróleo Ecuador: ejecución GARCH</h2>
            <p>Recorre el flujo del notebook: datos, retornos, prueba ARCH, estimación GARCH(1,1) y pronóstico.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar caso práctico"><X size={17} /></button>
        </div>

        <div className="lab-grid">
          <div className="lab-panel lab-runner">
            <div className="source-card">
              <Database size={16} />
              <div><strong>Datos usados</strong><span>produccion petroleo mensual 2007.xlsx</span></div>
            </div>
            <div className="source-card">
              <PlayCircle size={16} />
              <div><strong>Notebook</strong><span>MODELO_GARCH.ipynb</span></div>
            </div>
            <button className="run-btn" onClick={run} disabled={running}>
              <PlayCircle size={16} />
              <span>{running ? "Ejecutando..." : "Ejecutar modelo"}</span>
            </button>
            <div className="lab-steps">
              {steps.map((s, i) => (
                <button key={s.tag} className={"lab-step" + (i <= step ? " done" : "") + (i === step ? " active" : "")} onClick={() => { setRunning(false); setStep(i); }}>
                  <span>{s.tag}</span>
                  <strong>{s.title}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="lab-panel lab-console">
            <div className="console-top">
              <span>{steps[step].title}</span>
              <em>{running ? "running" : "ready"}</em>
            </div>
            <pre>{steps.slice(0, step + 1).map((s) => `# ${s.title}\n${s.code}\n=> ${s.result}`).join("\n\n")}</pre>
          </div>

          <div className="lab-panel lab-chart">
            <div className="chart-label">{step >= 4 ? "Pronóstico 2027" : "Producción promedio diaria anual"}</div>
            <ResponsiveContainer width="100%" height="100%">
              {step >= 4 ? (
                <AreaChart data={visibleForecast} margin={{ top: 18, right: 16, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="labForecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="var(--blue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0.24, 0.258]} />
                  <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 12, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink)" }} formatter={(v) => [Number(v).toFixed(6), "Volatilidad"]} />
                  <Area type="monotone" dataKey="vol" stroke="var(--blue)" strokeWidth={2.2} fill="url(#labForecastGrad)" isAnimationActive={false} dot={{ r: 2.5, fill: "var(--blue)" }} />
                </AreaChart>
              ) : (
                <AreaChart data={OIL_ANNUAL.slice(0, step >= 1 ? OIL_ANNUAL.length : 8)} margin={{ top: 18, right: 16, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="labOilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <ReferenceLine y={502.7} stroke="var(--border-strong)" strokeDasharray="4 4" />
                  <XAxis dataKey="year" interval={2} stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[130, 580]} />
                  <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 12, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink)" }} formatter={(v) => [v + " mil b/d", "Producción"]} />
                  <Area type="monotone" dataKey="prod" stroke="var(--green)" strokeWidth={2.2} fill="url(#labOilGrad)" isAnimationActive={false} dot={false} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="lab-panel lab-output">
            <div className="oil-kpis">
              <div className="metric-tile"><span>233</span><p>meses observados</p></div>
              <div className="metric-tile"><span>{step >= 2 ? GARCH_FIT.archLm.toFixed(2) : "..."}</span><p>ARCH-LM</p></div>
              <div className="metric-tile"><span>{step >= 3 ? GARCH_FIT.persistence.toFixed(4) : "..."}</span><p>persistencia</p></div>
              <div className="metric-tile"><span>{step >= 4 ? "0.2443" : "..."}</span><p>vol. dic. 2027</p></div>
            </div>
            <div className="param-grid">
              {params.map(([symbol, value, label]) => (
                <div className="param-card" key={symbol}>
                  <span>{symbol}</span>
                  <strong>{step >= 3 ? value : "pendiente"}</strong>
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <div className="shock-strip">
              {OIL_SHOCKS.slice(0, 2).map((s) => (
                <div className="shock-pill" key={s.period}>
                  <strong>{s.period}</strong>
                  <span>{s.ret > 0 ? "+" : ""}{s.ret.toFixed(3)}</span>
                  <em>{s.from} → {s.to}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveGarchLab({ onClose }) {
  const [omega, setOmega] = useState(0.00037);
  const [alpha, setAlpha] = useState(0.033);
  const [beta, setBeta] = useState(0.954);
  const [shock, setShock] = useState(-0.95);
  const [prevVar, setPrevVar] = useState(0.0625);

  const shock2 = shock * shock;
  const archTerm = alpha * shock2;
  const garchTerm = beta * prevVar;
  const variance = Math.max(0, omega + archTerm + garchTerm);
  const volatility = Math.sqrt(variance);
  const persistence = alpha + beta;
  const hypothesisAccepted = persistence < 1;
  const longRun = persistence < 1 ? omega / (1 - persistence) : null;
  const labSeries = Array.from({ length: 12 }, (_, i) => {
    let v = variance;
    for (let j = 0; j < i; j += 1) {
      v = omega + persistence * v;
    }
    return { h: "t+" + (i + 1), vol: Math.sqrt(Math.max(0, v)) };
  });

  const controls = [
    ["omega", "ω varianza base", omega, setOmega, 0, 0.004, 0.00001],
    ["alpha", "α reacción al choque", alpha, setAlpha, 0, 0.35, 0.001],
    ["beta", "β memoria", beta, setBeta, 0, 0.99, 0.001],
    ["shock", "ε choque observado", shock, setShock, -2, 2, 0.01],
    ["prevVar", "σ² previa", prevVar, setPrevVar, 0.001, 0.25, 0.001],
  ];

  return (
    <section className="lab-overlay" aria-label="Simulador GARCH en vivo">
      <div className="lab-shell live-shell">
        <div className="lab-head">
          <div>
            <div className="brand-kicker">SIMULADOR EN VIVO</div>
            <h2>Calculadora GARCH(1,1) paso a paso</h2>
            <p>Cambia los parametros y observa en vivo como un choque y la memoria pasada forman la nueva volatilidad condicional.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar simulador en vivo"><X size={17} /></button>
        </div>

        <div className="live-grid">
          <div className="lab-panel live-controls">
            {controls.map(([id, label, value, setter, min, max, step]) => (
              <label className="live-control" key={id}>
                <span>{label}</span>
                <strong>{Number(value).toFixed(id === "shock" ? 2 : 5)}</strong>
                <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setter(Number(e.target.value))} />
              </label>
            ))}
          </div>

          <div className="lab-panel live-formula">
            <div className="console-top">
              <span>H0: α + β &lt; 1</span>
              <em>{hypothesisAccepted ? "hipótesis aceptada" : "hipótesis rechazada"}</em>
            </div>
            <div className="live-equation">σ²_t = ω + α ε²_t-1 + β σ²_t-1</div>
            <div className={"hypothesis-animation" + (hypothesisAccepted ? " goal" : " save")} key={hypothesisAccepted ? "goal" : "save"}>
              <div className="goal-frame">
                <div className="net-lines" />
                <div className="keeper">
                  <i className="keeper-head" />
                  <i className="keeper-body" />
                  <i className="keeper-arm left" />
                  <i className="keeper-arm right" />
                  <i className="keeper-leg left" />
                  <i className="keeper-leg right" />
                </div>
                <div className="ball" />
              </div>
              <strong>{hypothesisAccepted ? "Gol: H0 aceptada" : "Tapada: H0 rechazada"}</strong>
              <span>{hypothesisAccepted ? "La persistencia queda bajo 1; el GARCH es estacionario." : "La persistencia llega a 1 o más; el modelo no vuelve a una varianza estable."}</span>
            </div>
            <div className="live-steps">
              <div><span>01</span><strong>Choque al cuadrado</strong><p>ε² = {shock.toFixed(2)}² = {shock2.toFixed(5)}</p></div>
              <div><span>02</span><strong>Componente ARCH</strong><p>αε² = {alpha.toFixed(4)} × {shock2.toFixed(5)} = {archTerm.toFixed(5)}</p></div>
              <div><span>03</span><strong>Componente GARCH</strong><p>βσ² = {beta.toFixed(4)} × {prevVar.toFixed(5)} = {garchTerm.toFixed(5)}</p></div>
              <div><span>04</span><strong>Varianza actual</strong><p>σ²_t = {variance.toFixed(5)}</p></div>
            </div>
          </div>

          <div className="lab-panel live-result">
            <div className="metric-tile"><span>{volatility.toFixed(4)}</span><p>volatilidad condicional σ_t</p></div>
            <div className="metric-tile"><span>{persistence.toFixed(4)}</span><p>persistencia α + β</p></div>
            <div className="metric-tile"><span>{longRun == null ? "∞" : longRun.toFixed(4)}</span><p>varianza de largo plazo</p></div>
          </div>

          <div className="lab-panel live-chart">
            <div className="chart-label">Proyección mecánica si no aparecen nuevos choques</div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={labSeries} margin={{ top: 18, right: 16, left: -6, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveLabGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--amber)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 12, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink)" }} formatter={(v) => [v.toFixed(4), "Volatilidad"]} />
                <Area type="monotone" dataKey="vol" stroke="var(--amber)" strokeWidth={2} fill="url(#liveLabGrad)" isAnimationActive={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function SlideBalance() {
  const ventajas = [
    "Captura el agrupamiento de volatilidad observado empíricamente.",
    "Parsimonioso: un GARCH(1,1) sustituye a un ARCH(q) de orden alto.",
    "Genera colas pesadas de forma endógena, sin supuestos extra.",
    "Base de una familia amplia de extensiones.",
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
      <Eyebrow n="17">BALANCE</Eyebrow>
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
      <PageFoot page="17" />
    </div>
  );
}

function ExcelGarchLab({ onClose }) {
  const [step, setStep] = useState(1); // 1: Datos, 2: Parámetros, 3: Volatilidad, 4: Simulación, 5: Diagnóstico
  const [calOmega, setCalOmega] = useState(0.000012);
  const [calAlpha, setCalAlpha] = useState(0.10);
  const [calBeta, setCalBeta] = useState(0.85);
  const [showTableInStep1, setShowTableInStep1] = useState(false);

  const resetParams = () => {
    setCalOmega(0.000012);
    setCalAlpha(0.10);
    setCalBeta(0.85);
  };

  const recalculatedVol = useMemo(() => {
    const data = [];
    let lastVar = EXCEL_FULL_DATA.reduce((acc, d) => acc + (d.rt / 100) * (d.rt / 100), 0) / EXCEL_FULL_DATA.length;
    for (let i = 0; i < EXCEL_FULL_DATA.length; i++) {
      const item = EXCEL_FULL_DATA[i];
      const rt_raw = item.rt / 100;
      const currentVar = calOmega + calAlpha * (rt_raw * rt_raw) + calBeta * lastVar;
      const currentSig = Math.sqrt(currentVar) * 100;
      data.push({
        t: item.t,
        fecha: item.fecha,
        precio: item.precio,
        rt: item.rt,
        sigExcel: item.sig,
        sigRecalced: Number(currentSig.toFixed(4)),
        bandUpper: Number((1.96 * currentSig).toFixed(4)),
        bandLower: Number((-1.96 * currentSig).toFixed(4)),
        z: item.z,
        ysim: item.ysim
      });
      lastVar = currentVar;
    }
    return data;
  }, [calOmega, calAlpha, calBeta]);

  const diagnostico = [
    { crit: "Estacionariedad",       result: "Estacionario",            detail: "α₁ + β₁ = 0.95 < 1: la varianza incondicional de largo plazo existe y es finita." },
    { crit: "Persistencia",           result: "Moderada-alta (0.95)",    detail: "La volatilidad presenta memoria temporal pero se disipa en un plazo razonable." },
    { crit: "Componente dominante",   result: "β₁ > α₁ (0.85 > 0.10)",  detail: "La variabilidad condicional se explica mayormente por su propio rezago histórico." },
    { crit: "Rango vs literatura",    result: "Dentro del rango típico", detail: "Coeficientes consistentes con estimaciones empíricas tradicionales de la literatura." },
    { crit: "Volatilidad de LP",      result: "1.55% diaria",            detail: "Equivalente a 24.59% anualizada bajo el supuesto de 252 días." },
  ];

  return (
    <section className="lab-overlay" aria-label="Caso de estudio bursátil">
      <div className="lab-shell" style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px", padding: "16px 20px" }}>
        
        {/* Header */}
        <div className="lab-head" style={{ marginBottom: "8px", paddingBottom: "8px" }}>
          <div>
            <div className="brand-kicker">HOJA DE CÁLCULO GARCH-EXCEL.xlsx</div>
            <h2>Análisis Paso a Paso: Guía Interactiva de Estimación</h2>
            <p>Sigue las pestañas del archivo Excel paso a paso, desde los retornos base hasta el diagnóstico final del modelo.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar caso de estudio"><X size={17} /></button>
        </div>

        {/* Stepper progress indicator */}
        <div className="stepper-bar" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "4px" }}>
          {[
            { n: 1, label: "1. Datos Base" },
            { n: 2, label: "2. Parámetros" },
            { n: 3, label: "3. Volatilidad σₜ" },
            { n: 4, label: "4. Simulación ŷₜ" },
            { n: 5, label: "5. Diagnóstico" }
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={"sub-tab-btn" + (step === s.n ? " active" : "")}
              style={{ flex: 1, textBreak: "nowrap", margin: "0 4px", fontSize: "10px" }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Two-Column Step Layout */}
        <div className="step-content-grid" style={{ display: "grid", gridTemplateColumns: "35% 65%", gap: "16px", flex: 1, overflow: "hidden" }}>
          
          {/* Left Column: Theory & details */}
          <div className="step-explanation-panel" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {step === 1 && (
              <>
                <span className="card-label">PASO 1 · PESTAÑA 'DATOS'</span>
                <h3 style={{ fontSize: "14px", margin: "0", color: "var(--ink)" }}>Retornos y Datos Históricos</h3>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  El primer paso consiste en transformar el índice de precios bursátiles base (Pₜ) en retornos logarítmicos continuos (rₜ), lo que estabiliza la varianza.
                </p>
                <div style={{ background: "var(--surface-3)", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "IBM Plex Mono", fontSize: "10.5px", margin: "4px 0", textAlign: "center" }}>
                  {"rₜ = ln(Pₜ / Pₜ₋₁)"}
                </div>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  Contiene n = 100 observaciones diarias desde febrero a julio del 2026. Los retornos muestran fluctuaciones variables a lo largo del tiempo, con períodos alternos de calma y turbulencia.
                </p>
                <button
                  className="sub-tab-btn"
                  onClick={() => setShowTableInStep1(!showTableInStep1)}
                  style={{ fontSize: "10px", alignSelf: "flex-start", marginTop: "8px" }}
                >
                  {showTableInStep1 ? "Ver Gráfico de Precios" : "Ver Tabla de Datos Base"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <span className="card-label">PASO 2 · PESTAÑA 'GARCH' (CALIBRACIÓN)</span>
                <h3 style={{ fontSize: "14px", margin: "0", color: "var(--ink)" }}>Estimación de Coeficientes</h3>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  En Excel estimamos los coeficientes óptimos mediante Máxima Verosimilitud. Estos determinan la dinámica de volatilidad esperada:
                </p>
                <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px", margin: "6px 0" }}>
                  <div style={{ display: "flex", gap: "8px", borderLeft: "2px solid var(--blue)", paddingLeft: "6px" }}>
                    <span><strong>ω (base):</strong> Mínimo nivel de riesgo de largo plazo (1.20 × 10⁻⁵).</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", borderLeft: "2px solid var(--amber)", paddingLeft: "6px" }}>
                    <span><strong>α₁ (ARCH):</strong> Reacción inmediata a choques recientes (0.10).</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", borderLeft: "2px solid var(--green)", paddingLeft: "6px" }}>
                    <span><strong>β₁ (GARCH):</strong> Memoria o persistencia histórica del riesgo (0.85).</span>
                  </div>
                </div>
                
                <h4 style={{ fontSize: "11.5px", margin: "6px 0 2px", color: "var(--ink)" }}>Calibrador en Vivo GARCH(1,1)</h4>
                
                <label style={{ display: "flex", flexDirection: "column", fontSize: "10px", color: "var(--ink-faint)" }}>
                  <span>ω (×10⁻⁶): {(calOmega * 1000000).toFixed(2)}</span>
                  <input type="range" min="0" max="0.0001" step="0.000001" value={calOmega} onChange={(e) => setCalOmega(Number(e.target.value))} />
                </label>

                <label style={{ display: "flex", flexDirection: "column", fontSize: "10px", color: "var(--ink-faint)" }}>
                  <span>α₁ (ARCH): {calAlpha.toFixed(2)}</span>
                  <input type="range" min="0" max="0.40" step="0.01" value={calAlpha} onChange={(e) => setCalAlpha(Number(e.target.value))} />
                </label>

                <label style={{ display: "flex", flexDirection: "column", fontSize: "10px", color: "var(--ink-faint)" }}>
                  <span>β₁ (GARCH): {calBeta.toFixed(2)}</span>
                  <input type="range" min="0.50" max="0.95" step="0.01" value={calBeta} onChange={(e) => setCalBeta(Number(e.target.value))} />
                </label>

                <button className="run-btn" onClick={resetParams} style={{ fontSize: "10px", padding: "6px", marginTop: "4px" }}>
                  Restaurar Parámetros Excel
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <span className="card-label">PASO 3 · PESTAÑA 'GRAFICAS' (VOLATILIDAD)</span>
                <h3 style={{ fontSize: "14px", margin: "0", color: "var(--ink)" }}>Volatilidad Condicional σₜ</h3>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  Con la ecuación recursiva GARCH calculamos la varianza condicional para cada instante t:
                </p>
                <div style={{ background: "var(--surface-3)", padding: "8px", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "IBM Plex Mono", fontSize: "10px", margin: "4px 0", textAlign: "center" }}>
                  {"σ²ₜ = ω + α₁·ε²ₜ₋₁ + β₁·σ²ₜ₋₁"}
                </div>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  La gráfica a la derecha muestra los retornos reales envueltos por bandas dinámicas de volatilidad a un 95% de confianza (±1.96 σₜ). 
                </p>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  Se aprecia claramente el <strong>Volatility Clustering</strong>: en t = 30 y t = 77, fuertes shocks ensanchan la banda temporalmente, mientras que en otros períodos el riesgo decae lentamente.
                </p>
              </>
            )}

            {step === 4 && (
              <>
                <span className="card-label">PASO 4 · PESTAÑA 'GARCH' (SIMULACIÓN)</span>
                <h3 style={{ fontSize: "14px", margin: "0", color: "var(--ink)" }}>Retornos Simulados ŷₜ</h3>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  Una de las capacidades clave del GARCH es generar trayectorias artificiales del activo mediante la volatilidad condicional y shocks aleatorios independientes zₜ ~ N(0,1):
                </p>
                <div style={{ background: "var(--surface-3)", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "IBM Plex Mono", fontSize: "10.5px", margin: "4px 0", textAlign: "center" }}>
                  {"ŷₜ = σₜ · zₜ"}
                </div>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  <strong>Ajuste dinámico (Cita del Excel):</strong> <em>"La línea azul muestra los retornos reales y la roja los simulados por GARCH. Ambos tienen una magnitud similar... no se busca predecir el movimiento exacto, sino la escala de volatilidad."</em>
                </p>
              </>
            )}

            {step === 5 && (
              <>
                <span className="card-label">PASO 5 · PESTAÑA 'INTERPRETACIÓN'</span>
                <h3 style={{ fontSize: "14px", margin: "0", color: "var(--ink)" }}>Diagnóstico y Conclusión</h3>
                <p style={{ fontSize: "11px", color: "var(--ink-dim)", lineHeight: "1.45" }}>
                  <strong>Cita textual del Excel:</strong> <em>"Existe volatilidad y heterocedasticidad condicional, ya que el riesgo cambia a través del tiempo... los shocks afectan la volatilidad y sus efectos permanecen durante varios periodos (α₁+β₁=0.95)."</em>
                </p>
                <div style={{ background: "var(--surface-3)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "10.5px", color: "var(--ink-dim)", marginTop: "4px" }}>
                  La volatilidad incondicional esperada en el largo plazo es de <strong>1.55% diaria</strong> y <strong>24.59% anual</strong>.
                </div>
              </>
            )}
          </div>

          {/* Right Column: Visualization & charts - sized appropriately */}
          <div className="step-visualization-panel" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", position: "relative" }}>
            
            {step === 1 && !showTableInStep1 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="excel-chart-title" style={{ fontSize: "11px" }}>Serie Histórica: Precios de Cierre del Índice (Pₜ)</span>
                <div style={{ flex: 1, minHeight: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recalculatedVol} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--amber)" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 9 }} tickFormatter={(v) => `t${v}`} ticks={[1, 20, 40, 60, 80, 100]} />
                      <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                      <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 10, color: "var(--ink)" }} />
                      <Area type="monotone" dataKey="precio" stroke="var(--amber)" strokeWidth={1.8} fill="url(#priceGrad)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {step === 1 && showTableInStep1 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span className="excel-chart-title" style={{ fontSize: "11px", marginBottom: "6px" }}>Muestra de Datos Base (Feb - Jun 2026)</span>
                <div style={{ flex: 1, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", textAlign: "left" }}>
                    <thead style={{ background: "var(--surface-3)", position: "sticky", top: 0, borderBottom: "1px solid var(--border)", zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: "6px 8px" }}>t</th>
                        <th style={{ padding: "6px 8px" }}>Fecha</th>
                        <th style={{ padding: "6px 8px" }}>Precio Pt</th>
                        <th style={{ padding: "6px 8px" }}>Retorno rt %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recalculatedVol.slice(0, 12).map((row) => (
                        <tr key={row.t} style={{ borderBottom: "1px solid var(--border)", background: row.t % 2 === 0 ? "transparent" : "var(--surface-3)" }}>
                          <td style={{ padding: "5px 8px", fontFamily: "IBM Plex Mono" }}>{row.t}</td>
                          <td style={{ padding: "5px 8px" }}>{row.fecha}</td>
                          <td style={{ padding: "5px 8px", fontFamily: "IBM Plex Mono" }}>{row.precio.toFixed(2)}</td>
                          <td style={{ padding: "5px 8px", fontFamily: "IBM Plex Mono", color: row.rt >= 0 ? "var(--green)" : "var(--red)" }}>
                            {row.rt >= 0 ? "+" : ""}{row.rt.toFixed(4)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="excel-chart-title" style={{ fontSize: "11px" }}>Calibración en Vivo: Volatilidad original (Azul) vs Calibrada (Ámbar)</span>
                <div style={{ flex: 1, minHeight: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recalculatedVol} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="t" stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 9 }} ticks={[1, 20, 40, 60, 80, 100]} />
                      <YAxis hide domain={[0.7, 1.8]} />
                      <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 10 }} />
                      <Line type="monotone" dataKey="sigExcel" stroke="var(--blue)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="sigRecalced" stroke="var(--amber)" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="excel-chart-title" style={{ fontSize: "11px" }}>Banda de Confianza σₜ al 95% (Azul) vs Retornos Bursátiles (Ámbar)</span>
                <div style={{ flex: 1, minHeight: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recalculatedVol} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bandGradStep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.05} />
                          <stop offset="100%" stopColor="var(--blue)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 9 }} ticks={[1, 20, 40, 60, 80, 100]} />
                      <YAxis hide domain={[-5.5, 5.5]} />
                      <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 10 }} />
                      <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                      <Area type="monotone" dataKey="bandUpper" stroke="transparent" fill="url(#bandGradStep)" dot={false} isAnimationActive={false} />
                      <Area type="monotone" dataKey="bandLower" stroke="transparent" fill="url(#bandGradStep)" dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="bandUpper" stroke="var(--blue)" strokeDasharray="3 3" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="bandLower" stroke="var(--blue)" strokeDasharray="3 3" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="rt" stroke="var(--amber)" strokeWidth={1.5} dot={{ r: 1 }} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="excel-chart-title" style={{ fontSize: "11px" }}>Simulación Generativa: Retornos Reales (Azul) vs Simulados GARCH (Ámbar)</span>
                <div style={{ flex: 1, minHeight: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recalculatedVol} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="t" stroke="var(--border-strong)" tick={{ fill: "var(--ink-dim)", fontSize: 9 }} ticks={[1, 20, 40, 60, 80, 100]} />
                      <YAxis hide domain={[-4.5, 4.5]} />
                      <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 10 }} />
                      <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                      <Line type="monotone" dataKey="rt" stroke="var(--blue)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="ysim" stroke="var(--amber)" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {step === 5 && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span className="excel-chart-title" style={{ fontSize: "11px", marginBottom: "6px" }}>Resumen Diagnóstico (Espec. de Largo Plazo)</span>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {diagnostico.map((d, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 100px 1fr", gap: "8px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 10px", fontSize: "10.5px" }}>
                      <strong style={{ color: "var(--ink)" }}>{d.crit}</strong>
                      <span style={{ color: "var(--amber)", fontFamily: "IBM Plex Mono" }}>{d.result}</span>
                      <span style={{ color: "var(--ink-dim)" }}>{d.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer step controller */}
        <div className="stepper-controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px" }}>
          <button
            className="nav-btn"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            style={{ padding: "6px 12px", height: "30px", fontSize: "11px" }}
          >
            <ArrowLeft size={14} style={{ marginRight: "4px" }} /> Anterior
          </button>
          <span style={{ fontSize: "11px", fontFamily: "IBM Plex Mono", color: "var(--ink-dim)" }}>
            Paso {step} de 5
          </span>
          <button
            className="nav-btn"
            onClick={() => setStep(Math.min(5, step + 1))}
            disabled={step === 5}
            style={{ padding: "6px 12px", height: "30px", fontSize: "11px" }}
          >
            Siguiente <ArrowRight size={14} style={{ marginLeft: "4px" }} />
          </button>
        </div>
      </div>
    </section>
  );
}

const SLIDES = [
  SlideQueEs, SlideHistoria, SlideVolatilidad, SlideNombre,
  SlideMotivacion, SlideRegularidades, SlideARCH, SlideGARCH,
  SlideGARCH11, SlideTeoria, SlideFormulas, SlideHipotesis, SlideInterpretacion, SlideDistribuciones,
  SlideMetodologia, SlideAplicaciones, SlideBalance,
];
const TOTAL = SLIDES.length;

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [current, setCurrent] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState("slides"); // "slides" | "petroleo" | "excel" | "simulador"

  const goTo = useCallback((n) => setCurrent(Math.max(0, Math.min(TOTAL - 1, n))), []);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    function onKey(e) {
      if (view !== "slides") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
      else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(TOTAL - 1);
      else if (e.key.toLowerCase() === "t") setTheme((t) => (t === "dark" ? "light" : "dark"));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, view]);

  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (view !== "slides") return;
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40) next();
    if (dx > 40) prev();
    touchX.current = null;
  };

  const currentMeta = FLAT[current] || FLAT[FLAT.length - 1];
  const CurrentSlide = SLIDES[current] || SLIDES[0];

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
          {view === "slides" ? (
            <>
              <span className="crumb-group">{currentMeta.group}</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-title">{currentMeta.title}</span>
            </>
          ) : (
            <>
              <span className="crumb-group">Pestañas del espacio de trabajo</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-title">
                {view === "petroleo" ? "Caso Petróleo (Ecuador)" : view === "excel" ? "Caso de estudio Excel" : "Simulador dinámico"}
              </span>
            </>
          )}
        </div>

        <div className="topbar-right">
          <button
            className={"practical-btn" + (view === "petroleo" ? " active" : "")}
            onClick={() => setView(view === "petroleo" ? "slides" : "petroleo")}
            aria-label="Ir al caso practico de petroleo"
          >
            <Database size={15} />
            <span>Caso Petróleo</span>
          </button>
          <button
            className={"practical-btn" + (view === "excel" ? " active" : "")}
            onClick={() => setView(view === "excel" ? "slides" : "excel")}
            aria-label="Ir al caso de estudio Excel"
          >
            <Database size={15} />
            <span>Caso Excel</span>
          </button>
          <button
            className={"practical-btn lab-btn" + (view === "simulador" ? " active" : "")}
            onClick={() => setView(view === "simulador" ? "slides" : "simulador")}
            aria-label="Abrir simulador en vivo"
          >
            <Calculator size={15} />
            <span>Simulador</span>
          </button>
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
                    className={"outline-item" + (view === "slides" && it.idx === current ? " active" : "")}
                    onClick={() => { setView("slides"); goTo(it.idx); setSidebarOpen(false); }}
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
        <main className="main" style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
          {view === "slides" ? (
            <>
              <div className="stage-outer">
                <div className="stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                  <CurrentSlide key={current} />
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
            </>
          ) : view === "petroleo" ? (
            <PracticalLab onClose={() => setView("slides")} />
          ) : view === "excel" ? (
            <ExcelGarchLab onClose={() => setView("slides")} />
          ) : (
            <LiveGarchLab onClose={() => setView("slides")} />
          )}
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
  --shadow: 0 18px 46px -30px rgba(0,0,0,0.78);
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
  --shadow: 0 14px 34px -24px rgba(20,35,45,0.22);
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
.practical-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: linear-gradient(90deg, var(--blue-soft), var(--green-soft));
  color: var(--ink);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  letter-spacing: .04em;
  cursor: pointer;
  white-space: nowrap;
}
.practical-btn:hover,
.practical-btn.active {
  border-color: var(--green);
  color: var(--green);
}
.sub-tabs-bar {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.sub-tab-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--ink-dim);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sub-tab-btn:hover {
  border-color: var(--border-strong);
  color: var(--ink);
}
.sub-tab-btn.active {
  background: var(--surface-3);
  border-color: var(--amber);
  color: var(--amber);
  font-weight: 500;
}
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  outline: none;
  margin: 8px 0;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--amber);
  cursor: pointer;
  transition: transform 0.1s ease;
}
input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
.stepper-bar {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
  margin-bottom: 4px;
}
.step-content-grid {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 16px;
  flex: 1;
  overflow: hidden;
  height: calc(100% - 100px);
}
.step-explanation-panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.step-explanation-panel p {
  margin: 0;
  font-size: 11px;
  color: var(--ink-dim);
  line-height: 1.45;
}
.step-visualization-panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.stepper-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 4px;
}
.excel-chart-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--ink-dim);
  font-weight: 500;
  margin-bottom: 6px;
}
.section-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  color: var(--amber);
  text-transform: uppercase;
  margin-bottom: 6px;
}
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
}
.team-strip span:first-child {
  color: var(--amber);
  border-color: var(--border-strong);
  background: var(--amber-soft);
}
.ticker { display: flex; gap: 4px; color: var(--ink-faint); overflow: hidden; width: 64px; height: 16px; opacity: 0.42; }
.ticker-wave { width: 64px; height: 16px; flex-shrink: 0; }
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
  transition: none;
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
.layout-balance,
.layout-oil,
.layout-results,
.layout-forecast {
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

/* ---- formulas slide ---- */
.formulas-stack { display: flex; flex-direction: column; gap: 10px; margin: 8px 0; }
.formula-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 14px;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
}
.formula-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: center;
  border-radius: 8px;
  padding: 6px 8px;
  font-weight: 700;
}
.formula-tag.tone-blue  { background: var(--blue-soft);  color: var(--blue);  border: 1px solid color-mix(in srgb, var(--blue) 30%, transparent); }
.formula-tag.tone-amber { background: var(--amber-soft); color: var(--amber); border: 1px solid color-mix(in srgb, var(--amber) 30%, transparent); }
.formula-tag.tone-green { background: var(--green-soft); color: var(--green); border: 1px solid color-mix(in srgb, var(--green) 30%, transparent); }
.formula-content .eq-main { text-align: left; font-size: clamp(13px, 1.3vw, 15.5px); }
.formula-content p { margin: 4px 0 0; font-size: 11px; color: var(--ink-dim); line-height: 1.45; }
.params-grid { margin-top: 12px; }
.param-doc-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  text-align: center;
}
.param-sym {
  font-family: 'Fraunces', serif;
  font-size: clamp(22px, 2.6vw, 30px);
  line-height: 1;
  color: var(--amber);
  font-weight: 700;
}
.param-doc-card strong { font-family: 'Fraunces', serif; font-size: 12px; color: var(--ink); }
.param-doc-card p { margin: 0; font-size: 10.5px; color: var(--ink-dim); line-height: 1.4; }

/* ---- card tone-red / tone-green ---- */
.card.tone-red .card-title { color: var(--rose); }
.card.tone-green .card-title { color: var(--green); }

/* ---- hypothesis slide ---- */
.layout-hipotesis { gap: 14px; }
.hypothesis-block {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 10px;
  align-items: stretch;
}
.hyp-panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hyp-panel.hyp-null   { border-color: color-mix(in srgb, var(--blue) 40%, transparent); }
.hyp-panel.hyp-alt    { border-color: color-mix(in srgb, var(--amber) 40%, transparent); }
.hyp-panel.hyp-decision { border-color: color-mix(in srgb, var(--green) 40%, transparent); }
.hyp-badge {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--amber);
  line-height: 1;
}
.hyp-panel.hyp-null .hyp-badge    { color: var(--blue); }
.hyp-panel.hyp-alt .hyp-badge     { color: var(--amber); }
.hyp-panel.hyp-decision .hyp-badge { color: var(--green); }
.hyp-panel strong { font-family: 'Fraunces', serif; font-size: 13px; }
.hyp-panel ul { margin: 0; padding-left: 16px; }
.hyp-panel ul li { font-size: 11.5px; color: var(--ink-dim); line-height: 1.5; margin-bottom: 4px; }
.hyp-arrow {
  display: flex;
  align-items: center;
  font-size: 20px;
  color: var(--ink-faint);
  padding: 0 4px;
}
.supuestos-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--amber);
  text-transform: uppercase;
  margin-top: 4px;
}

/* ---- interpretation slide ---- */
.layout-interp { gap: 14px; }
.interp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.interp-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  overflow: hidden;
}
.interp-card.tone-amber { border-color: color-mix(in srgb, var(--amber) 35%, transparent); }
.interp-card.tone-blue  { border-color: color-mix(in srgb, var(--blue)  35%, transparent); }
.interp-card.tone-red   { border-color: color-mix(in srgb, var(--rose)  35%, transparent); }
.interp-card.tone-green { border-color: color-mix(in srgb, var(--green) 35%, transparent); }
.interp-icon { font-size: 22px; line-height: 1; }
.interp-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--amber);
  font-weight: 700;
}
.interp-card.tone-blue  .interp-label { color: var(--blue); }
.interp-card.tone-red   .interp-label { color: var(--rose); }
.interp-card.tone-green .interp-label { color: var(--green); }
.interp-card strong { font-family: 'Fraunces', serif; font-size: 13px; }
.interp-card p { margin: 0; font-size: 11px; color: var(--ink-dim); line-height: 1.45; }
.interp-card em { font-size: 10.5px; color: var(--ink-faint); font-style: italic; margin-top: auto; }
.interp-summary {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.interp-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
}
.interp-param {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--amber);
}

/* ---- distributions slide ---- */
.layout-dists { gap: 14px; }
.dist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin: 4px 0;
}
.dist-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dist-card.tone-blue  { border-color: color-mix(in srgb, var(--blue)  35%, transparent); }
.dist-card.tone-amber { border-color: color-mix(in srgb, var(--amber) 35%, transparent); }
.dist-card.tone-green { border-color: color-mix(in srgb, var(--green) 35%, transparent); }
.dist-sym {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  line-height: 1;
  color: var(--blue);
}
.dist-card.tone-amber .dist-sym { color: var(--amber); }
.dist-card.tone-green .dist-sym { color: var(--green); }
.dist-name {
  font-family: 'Fraunces', serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.dist-row { display: flex; flex-direction: column; gap: 3px; }
.dist-lbl {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.dist-row p { margin: 0; font-size: 11px; color: var(--ink-dim); line-height: 1.45; }

/* ---- Clean & Professional Layout Styles (No Emojis) ---- */

/* -- Acronym Table & Timeline nodes -- */
.layout-historia-clean {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.timeline-horizontal {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  position: relative;
  margin: 10px 0;
}
.timeline-node {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.node-year {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--amber);
}
.node-line-marker {
  display: flex;
  align-items: center;
  position: relative;
  height: 10px;
}
.node-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-strong);
  z-index: 2;
}
.node-connector {
  position: absolute;
  left: 8px;
  right: -12px;
  height: 1px;
  background: var(--border);
  z-index: 1;
}
.node-content strong {
  font-family: 'Fraunces', serif;
  font-size: 12px;
  color: var(--ink);
}
.node-content p {
  margin: 4px 0 0 0;
  font-size: 10.5px;
  color: var(--ink-dim);
  line-height: 1.4;
}

/* -- Volatilidad Clean Layout -- */
.layout-volatilidad-clean {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.vol-definition {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
}
.vol-ex-grid-clean {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.vol-item-clean {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vol-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vol-item-top strong {
  font-size: 12px;
  color: var(--ink);
}
.vol-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--border);
  color: var(--ink-dim);
}
.vol-badge.level-bajo { color: var(--green); background: color-mix(in srgb, var(--green) 12%, transparent); }
.vol-badge.level-medio { color: var(--blue); background: color-mix(in srgb, var(--blue) 12%, transparent); }
.vol-badge.level-alto { color: var(--amber); background: color-mix(in srgb, var(--amber) 12%, transparent); }
.vol-badge.level-muy-alto { color: var(--red); background: color-mix(in srgb, var(--red) 12%, transparent); }
.vol-item-clean p {
  margin: 0;
  font-size: 10.5px;
  color: var(--ink-dim);
  line-height: 1.4;
}

/* -- Acronym Table Clean -- */
.layout-nombre-clean {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.acronym-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-2);
}
.acronym-row {
  display: grid;
  grid-template-columns: 60px 160px 1fr;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.acronym-row:last-child {
  border-bottom: none;
}
.acronym-letter {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--amber);
}
.acronym-term {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}
.acronym-def {
  font-size: 11px;
  color: var(--ink-dim);
  line-height: 1.4;
}
.het-section-clean {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.problems-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.problem-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
}
.problem-card strong {
  font-size: 11.5px;
  color: var(--ink);
  display: block;
  margin-bottom: 4px;
}
.problem-card p {
  margin: 0;
  font-size: 10.5px;
  color: var(--ink-dim);
  line-height: 1.4;
}

/* -- Theory & Properties Clean -- */
.layout-theory-clean {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}
.theory-hero-clean {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.theory-formula {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--amber);
  margin: 6px 0;
}
.theory-mini-eq {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  color: var(--ink-faint);
  background: var(--surface-3);
  padding: 6px;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.theory-table-clean {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.theory-row-clean {
  display: flex;
  gap: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
}
.theory-row-clean .row-num {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--amber);
}
.theory-row-clean strong {
  font-size: 12px;
  color: var(--ink);
}
.theory-row-clean p {
  margin: 2px 0 0 0;
  font-size: 10.5px;
  color: var(--ink-dim);
  line-height: 1.4;
}
.persistence-strip-clean {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  color: var(--ink-faint);
  background: var(--surface-2);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.persistence-bar-clean {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin: 0 16px;
  position: relative;
}
.persistence-bar-clean i {
  position: absolute;
  left: 0;
  width: 95%;
  height: 100%;
  background: var(--blue);
}

/* -- Formulas Clean -- */
.formulas-stack-clean {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.formula-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.formula-type {
  font-family: 'Fraunces', serif;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--surface-3);
  border-right: 1px solid var(--border);
}
.formula-type.media { color: var(--blue); }
.formula-type.error { color: var(--amber); }
.formula-type.varianza { color: var(--green); }
.formula-math {
  padding: 10px 14px;
}
.formula-math p {
  margin: 4px 0 0 0;
  font-size: 10.5px;
  color: var(--ink-dim);
  line-height: 1.4;
}
.params-table-clean {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.param-row-clean {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.param-symbol {
  font-family: 'Fraunces', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--amber);
}
.param-info strong {
  font-size: 11px;
  color: var(--ink);
  display: block;
}
.param-info p {
  margin: 2px 0 0 0;
  font-size: 9.5px;
  color: var(--ink-faint);
  line-height: 1.3;
}

/* -- Hipotesis & supuestos Clean -- */
.layout-hipotesis-clean {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hypothesis-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.hyp-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}
.hyp-card.h0 { border-left: 3px solid var(--blue); }
.hyp-card.h1 { border-left: 3px solid var(--amber); }
.hyp-card.decision { border-left: 3px solid var(--green); }
.card-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 4px;
}
.hyp-card strong {
  font-family: 'Fraunces', serif;
  font-size: 14px;
  color: var(--ink);
  display: block;
  margin-bottom: 6px;
}
.hyp-card p {
  margin: 0;
  font-size: 11px;
  color: var(--ink-dim);
  line-height: 1.4;
}
.supuestos-header {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--amber);
}
.supuestos-grid-clean {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.supuesto-item-clean {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
}
.supuesto-num {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: var(--ink-faint);
  display: block;
  margin-bottom: 2px;
}
.supuesto-main strong {
  font-size: 11px;
  color: var(--ink);
  display: block;
}
.supuesto-main p {
  margin: 2px 0 0 0;
  font-size: 9.5px;
  color: var(--ink-dim);
  line-height: 1.3;
}

/* -- Interpretation Clean -- */
.layout-interp-clean {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.interp-grid-clean {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.interp-card-clean {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
}
.interp-card-clean.color-amber { border-top: 3px solid var(--amber); }
.interp-card-clean.color-blue  { border-top: 3px solid var(--blue); }
.interp-card-clean.color-red   { border-top: 3px solid var(--red); }
.interp-card-clean.color-green { border-top: 3px solid var(--green); }
.interp-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  color: var(--ink-faint);
  display: block;
  margin-bottom: 4px;
}
.interp-card-clean strong {
  font-size: 11.5px;
  color: var(--ink);
  display: block;
}
.interp-card-clean p {
  margin: 4px 0 6px 0;
  font-size: 10px;
  color: var(--ink-dim);
  line-height: 1.35;
}
.interp-example {
  font-size: 9px;
  color: var(--ink-faint);
  display: block;
}
.interp-table-summary {
  display: flex;
  flex-direction: column;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.table-row-clean {
  display: grid;
  grid-template-columns: 180px 1fr;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  font-size: 11px;
}
.table-row-clean:last-child {
  border-bottom: none;
}
.param-comb {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  color: var(--amber);
}

/* -- Distributions Clean -- */
.layout-dists-clean {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dists-table {
  display: flex;
  flex-direction: column;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.dists-table-header {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 1fr;
  padding: 10px 14px;
  background: var(--surface-3);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--ink-dim);
  border-bottom: 1px solid var(--border);
}
.dists-table-row {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 1fr;
  padding: 10px 14px;
  font-size: 10.5px;
  border-bottom: 1px solid var(--border);
  align-items: center;
  line-height: 1.4;
  color: var(--ink-dim);
}
.dists-table-row:last-child {
  border-bottom: none;
}
.dist-col-name {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 11.5px;
  color: var(--ink);
}

/* ---- Excel GARCH Slide/Lab ---- */
.layout-excel-garch { gap: 12px; }

.excel-lab-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}
.excel-kpis {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.excel-kpi-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}
.excel-kpi-card.tone-amber { border-color: color-mix(in srgb, var(--amber) 35%, transparent); }
.excel-kpi-card.tone-blue  { border-color: color-mix(in srgb, var(--blue) 35%, transparent); }
.excel-kpi-card > span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: var(--ink-faint);
  letter-spacing: 0.05em;
}
.excel-kpi-card > strong {
  font-family: 'Fraunces', serif;
  font-size: clamp(13px, 1.4vw, 18px);
  color: var(--ink);
  line-height: 1;
}
.excel-kpi-card.tone-amber > strong { color: var(--amber); }
.excel-kpi-card.tone-blue  > strong { color: var(--blue); }
.excel-kpi-card > p { margin: 0; font-size: 9px; color: var(--ink-faint); line-height: 1.3; }

.excel-chart-wrap {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px 12px 6px;
  height: clamp(140px, 22vh, 195px);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.excel-chart-header { display: flex; justify-content: space-between; align-items: baseline; }
.excel-chart-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--ink-dim);
  letter-spacing: 0.05em;
}
.excel-chart-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  color: var(--ink-faint);
}

.excel-diag { display: flex; flex-direction: column; gap: 6px; }
.excel-diag-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--amber);
  text-transform: uppercase;
}
.excel-diag-grid { display: flex; flex-direction: column; gap: 4px; }
.excel-diag-row {
  display: grid;
  grid-template-columns: 175px 195px 1fr;
  gap: 10px;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 11.5px;
}
.excel-diag-crit {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 12px;
  color: var(--ink);
}
.excel-diag-result {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--blue);
}
.excel-diag-detail { font-size: 11px; color: var(--ink-dim); line-height: 1.4; }
.excel-conclusion { margin-top: 2px; }




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

/* ---- practical lab ---- */
.lab-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0,0,0,.58);
}
.main .lab-overlay {
  position: relative;
  inset: auto;
  z-index: 1;
  display: block;
  padding: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.lab-shell {
  width: min(1180px, 100%);
  max-height: min(900px, calc(100vh - 36px));
  overflow: auto;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--surface-3) 28%, transparent), transparent 46%),
    var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 22px;
  box-shadow: 0 24px 56px -34 rgba(0,0,0,.78);
  padding: clamp(18px, 2.4vw, 28px);
}
.main .lab-shell {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 12px 16px;
  overflow: visible;
}
.lab-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}
.lab-head h2 {
  margin: 3px 0 6px;
  font-family: 'Fraunces', serif;
  font-size: clamp(26px, 3vw, 42px);
  line-height: 1.02;
}
.lab-head p {
  margin: 0;
  color: var(--ink-dim);
  max-width: 760px;
  font-size: 12.5px;
  line-height: 1.5;
}
.lab-grid {
  display: grid;
  grid-template-columns: 250px minmax(330px, .95fr) minmax(380px, 1.2fr);
  gap: 14px;
  align-items: stretch;
}
.lab-panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px;
  min-width: 0;
}
.lab-runner,
.lab-output {
  display: grid;
  gap: 10px;
}
.run-btn {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--green);
  border-radius: 999px;
  background: var(--green-soft);
  color: var(--green);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  cursor: pointer;
}
.run-btn:disabled {
  opacity: .7;
  cursor: progress;
}
.lab-steps {
  display: grid;
  gap: 8px;
}
.lab-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
  text-align: left;
  background: transparent;
  color: var(--ink-dim);
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 9px;
  cursor: pointer;
}
.lab-step span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: var(--ink-faint);
}
.lab-step strong {
  font-size: 11.4px;
}
.lab-step.done {
  background: var(--blue-soft);
  color: var(--ink);
}
.lab-step.active {
  border-color: var(--amber);
  box-shadow: inset 3px 0 0 var(--amber);
}
.lab-console {
  min-height: 360px;
  display: flex;
  flex-direction: column;
}
.console-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--ink-faint);
  margin-bottom: 10px;
}
.console-top em {
  color: var(--green);
  font-style: normal;
}
.lab-console pre {
  margin: 0;
  flex: 1;
  white-space: pre-wrap;
  color: var(--ink);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  line-height: 1.55;
}
.lab-chart {
  min-height: 360px;
}
.lab-output {
  grid-column: 2 / span 2;
}
.lab-output .param-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.lab-output .shock-strip {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.live-shell {
  width: min(1080px, 100%);
}
.live-grid {
  display: grid;
  grid-template-columns: minmax(240px, .7fr) minmax(320px, 1fr) minmax(260px, .75fr);
  gap: 14px;
  align-items: stretch;
}
.live-controls {
  display: grid;
  gap: 12px;
}
.live-control {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}
.live-control span {
  color: var(--ink-dim);
  font-size: 11.4px;
}
.live-control strong {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--amber);
  font-size: 10.8px;
}
.live-control input {
  grid-column: 1 / -1;
  width: 100%;
  accent-color: var(--amber);
}
.live-formula {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.live-equation {
  font-family: 'Fraunces', serif;
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.05;
  color: var(--ink);
  padding: 12px 0;
}
.hypothesis-animation {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface-2);
  padding: 10px 12px;
  overflow: hidden;
}
.hypothesis-animation strong,
.hypothesis-animation span {
  display: block;
}
.hypothesis-animation strong {
  font-family: 'Fraunces', serif;
  font-size: 16px;
  color: var(--ink);
}
.hypothesis-animation span {
  color: var(--ink-dim);
  font-size: 11px;
  line-height: 1.35;
}
.goal-frame {
  height: 86px;
  border: 2px solid var(--border-strong);
  border-bottom: 4px solid var(--green);
  border-radius: 8px 8px 4px 4px;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(0deg, color-mix(in srgb, var(--green) 12%, transparent), transparent 42%),
    var(--surface-3);
}
.net-lines {
  position: absolute;
  inset: 0;
  opacity: .36;
  background:
    linear-gradient(to right, var(--border-strong) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border-strong) 1px, transparent 1px);
  background-size: 18px 100%, 100% 18px;
}
.ball {
  position: absolute;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 35%, #fff 0 25%, #1a2530 26% 34%, #fff 35% 100%);
  border: 1px solid rgba(0,0,0,.35);
  z-index: 3;
}
.keeper {
  position: absolute;
  left: 58px;
  bottom: 12px;
  width: 34px;
  height: 48px;
  z-index: 2;
}
.keeper i {
  position: absolute;
  display: block;
  background: var(--blue);
}
.keeper-head {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  left: 11px;
  top: 0;
  background: var(--amber) !important;
}
.keeper-body {
  width: 14px;
  height: 22px;
  left: 10px;
  top: 12px;
  border-radius: 8px 8px 5px 5px;
}
.keeper-arm,
.keeper-leg {
  width: 6px;
  height: 24px;
  border-radius: 999px;
  transform-origin: top center;
}
.keeper-arm.left { left: 4px; top: 14px; transform: rotate(34deg); }
.keeper-arm.right { right: 4px; top: 14px; transform: rotate(-34deg); }
.keeper-leg.left { left: 10px; top: 31px; transform: rotate(18deg); }
.keeper-leg.right { right: 10px; top: 31px; transform: rotate(-18deg); }
.hypothesis-animation.goal {
  border-color: color-mix(in srgb, var(--green) 55%, var(--border));
}
.hypothesis-animation.goal .ball {
  animation: goal-shot .95s ease-out both;
}
.hypothesis-animation.goal .keeper {
  animation: keeper-miss .95s ease-out both;
}
.hypothesis-animation.save {
  border-color: color-mix(in srgb, var(--rose) 55%, var(--border));
}
.hypothesis-animation.save .ball {
  animation: saved-shot .95s ease-out both;
}
.hypothesis-animation.save .keeper {
  animation: keeper-save .95s ease-out both;
}
@keyframes goal-shot {
  0% { left: -18px; top: 58px; transform: scale(.9); }
  65% { left: 90px; top: 16px; transform: scale(1.05); }
  100% { left: 120px; top: 10px; transform: scale(.72); }
}
@keyframes keeper-miss {
  0% { transform: translateX(0) rotate(0); }
  70% { transform: translateX(-18px) translateY(9px) rotate(-28deg); }
  100% { transform: translateX(-20px) translateY(10px) rotate(-28deg); }
}
@keyframes saved-shot {
  0% { left: -18px; top: 56px; transform: scale(.9); }
  65% { left: 66px; top: 28px; transform: scale(1.05); }
  100% { left: 42px; top: 58px; transform: scale(.8); }
}
@keyframes keeper-save {
  0% { transform: translateX(0) rotate(0); }
  62% { transform: translateX(24px) translateY(-4px) rotate(22deg); }
  100% { transform: translateX(18px) translateY(4px) rotate(18deg); }
}
.live-steps {
  display: grid;
  gap: 9px;
}
.live-steps div {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--surface-3) 45%, transparent);
}
.live-steps span {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.8px;
  color: var(--amber);
  margin-bottom: 4px;
}
.live-steps strong {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 13.4px;
  margin-bottom: 3px;
}
.live-steps p {
  margin: 0;
  color: var(--ink-dim);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.8px;
  line-height: 1.45;
}
.live-result {
  display: grid;
  gap: 10px;
}
.live-chart {
  grid-column: 1 / -1;
  min-height: 260px;
}

/* ---- real oil case ---- */
.layout-oil {
  display: grid;
  grid-template-columns: minmax(420px, 1.35fr) minmax(250px, .65fr);
  grid-template-rows: 1fr auto;
  align-items: stretch;
}
.oil-chart-panel,
.forecast-chart {
  min-height: 255px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--green-soft) 58%, transparent), transparent 65%),
    var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px 10px 6px 4px;
  position: relative;
  overflow: hidden;
}
.oil-chart-panel { grid-row: 1 / span 2; }
.oil-chart-panel::before,
.forecast-chart::before {
  content: "";
  position: absolute;
  inset: 42px 16px 34px;
  background:
    linear-gradient(to right, color-mix(in srgb, var(--ink) 6%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--ink) 5%, transparent) 1px, transparent 1px);
  background-size: 68px 100%, 100% 42px;
  pointer-events: none;
  opacity: .55;
}
.oil-kpis,
.forecast-readout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.metric-tile {
  min-height: 92px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 13px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.metric-tile::before {
  content: "";
  position: absolute;
  inset: auto 12px 10px 12px;
  height: 3px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--green), var(--blue));
  opacity: .72;
}
.metric-tile.alert::before { background: linear-gradient(90deg, var(--rose), var(--amber)); }
.metric-tile span {
  font-family: 'Fraunces', serif;
  font-size: clamp(24px, 2.5vw, 34px);
  line-height: 1;
  color: var(--ink);
}
.metric-tile p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 11px;
  line-height: 1.3;
}
.shock-strip {
  display: grid;
  gap: 8px;
}
.shock-pill {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3px 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
}
.shock-pill strong {
  font-family: 'Fraunces', serif;
  font-size: 13px;
}
.shock-pill span {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--amber);
  font-size: 11px;
}
.shock-pill em {
  grid-column: 1 / -1;
  color: var(--ink-dim);
  font-style: normal;
  font-size: 10.5px;
}
.source-panel {
  display: grid;
  gap: 10px;
}
.source-card {
  min-height: 78px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
}
.source-card svg {
  color: var(--green);
}
.source-card strong,
.source-card span {
  display: block;
}
.source-card strong {
  font-family: 'Fraunces', serif;
  font-size: 14px;
}
.source-card span {
  margin-top: 3px;
  color: var(--ink-dim);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  line-height: 1.35;
  word-break: break-word;
}

/* ---- applied model results ---- */
.layout-results {
  display: grid;
  grid-template-columns: minmax(260px, .82fr) minmax(420px, 1.18fr);
  grid-template-rows: 1fr auto;
}
.result-hero {
  grid-row: 1 / span 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  background:
    linear-gradient(145deg, var(--rose-soft), transparent 54%),
    var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  position: relative;
  overflow: hidden;
}
.result-hero::after {
  content: "";
  position: absolute;
  right: -34px;
  bottom: -22px;
  width: 170px;
  height: 120px;
  border: 1px solid color-mix(in srgb, var(--rose) 32%, transparent);
  transform: rotate(28deg);
}
.param-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.param-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  min-height: 118px;
}
.param-card span {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 22px;
  color: var(--amber);
  margin-bottom: 8px;
}
.param-card strong {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--ink);
  margin-bottom: 8px;
}
.param-card p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 11px;
  line-height: 1.35;
}
.validation-band {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 14px;
  align-items: center;
  background: linear-gradient(90deg, var(--blue-soft), var(--green-soft));
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  padding: 14px 16px;
}
.validation-band div {
  display: grid;
  gap: 3px;
}
.validation-band span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.8px;
  color: var(--ink-faint);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.validation-band strong {
  font-family: 'Fraunces', serif;
  font-size: 18px;
}
.validation-band p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 11.4px;
  line-height: 1.42;
}
.execution-flow {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.execution-flow div {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 11px;
}
.execution-flow span {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: var(--amber);
  margin-bottom: 5px;
}
.execution-flow strong {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 13px;
  margin-bottom: 4px;
}
.execution-flow p {
  margin: 0;
  color: var(--ink-dim);
  font-size: 10.6px;
  line-height: 1.35;
}

/* ---- forecast ---- */
.layout-forecast {
  display: grid;
  grid-template-columns: minmax(440px, 1.35fr) minmax(240px, .65fr);
  grid-template-rows: 1fr auto;
  align-items: stretch;
}
.forecast-chart {
  grid-row: 1 / span 2;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--blue-soft) 70%, transparent), transparent 66%),
    var(--surface-2);
}
.forecast-readout {
  grid-template-columns: 1fr;
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
.controls { display: flex; align-items: center; gap: 16px; width: fit-content; max-width: min(100%, 1120px); justify-content: center; position: relative; z-index: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface); box-shadow: 0 10px 24px -20px rgba(0,0,0,.55); }
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
  .practical-btn { order: -1; }
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
  .oil-kpis,
  .forecast-readout,
  .param-grid,
  .execution-flow,
  .balance-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .layout-oil,
  .layout-results,
  .layout-forecast { grid-template-columns: 1fr; grid-template-rows: auto; }
  .oil-chart-panel,
  .forecast-chart,
  .result-hero { grid-row: auto; }
  .execution-flow { grid-column: auto; }
  .validation-band { grid-template-columns: 1fr; align-items: start; }
  .lab-grid { grid-template-columns: 1fr; }
  .live-grid { grid-template-columns: 1fr; }
  .lab-output { grid-column: auto; }
  .live-chart { grid-column: auto; }
  .lab-output .param-grid,
  .lab-output .shock-strip { grid-template-columns: 1fr 1fr; }
  .lab-chart,
  .lab-console { min-height: 280px; }
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
  .oil-kpis,
  .forecast-readout,
  .param-grid,
  .execution-flow,
  .balance-grid { grid-template-columns: 1fr; }
  .lab-overlay { padding: 8px; }
  .lab-shell { max-height: calc(100vh - 16px); border-radius: 16px; }
  .lab-head { align-items: flex-start; }
  .hypothesis-animation { grid-template-columns: 1fr; }
  .goal-frame { width: 160px; max-width: 100%; }
  .lab-output .param-grid,
  .lab-output .shock-strip,
  .oil-kpis { grid-template-columns: 1fr; }
  .balance-summary { flex-direction: column; align-items: flex-start; }
  .team-strip span { font-size: 9.6px; padding: 5px 6px; }
}
`;
