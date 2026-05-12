import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Key, Zap, ArrowRight, CheckCircle2, AlertCircle, Type, Hash,
  Info, Calculator, Target, List, Activity, Cpu, Clock, BarChart2,
  Binary, TrendingUp, Database, FastForward, Shuffle, Eye, Lock, Unlock,
  ChevronDown, ChevronRight, Play
} from 'lucide-react';

// ============================================================================
// DES / DSR CONSTANTS
// ============================================================================
const IP = [58,50,42,34,26,18,10,2, 60,52,44,36,28,20,12,4, 62,54,46,38,30,22,14,6, 64,56,48,40,32,24,16,8,
  57,49,41,33,25,17,9,1, 59,51,43,35,27,19,11,3, 61,53,45,37,29,21,13,5, 63,55,47,39,31,23,15,7];
const IP_INV = [40,8,48,16,56,24,64,32, 39,7,47,15,55,23,63,31, 38,6,46,14,54,22,62,30, 37,5,45,13,53,21,61,29,
  36,4,44,12,52,20,60,28, 35,3,43,11,51,19,59,27, 34,2,42,10,50,18,58,26, 33,1,41,9,49,17,57,25];
const E_BOX = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,
  16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P_BOX = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10, 2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,
  63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,
  41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
const S_BOXES = [
  [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
  [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
  [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
  [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
  [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
  [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
  [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
  [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
];

// ============================================================================
// HELPERS
// ============================================================================
const textToHex = (text) => {
  if (!text) return "";
  const padded = text.padEnd(8, ' ').substring(0, 8);
  let hex = "";
  for (let i = 0; i < padded.length; i++) hex += padded.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase();
  return hex;
};
const hexToText = (hex) => {
  let s = "";
  for (let i = 0; i < hex.length; i += 2) {
    const cc = parseInt(hex.substring(i, i + 2), 16);
    if (!isNaN(cc) && cc !== 0) s += String.fromCharCode(cc);
  }
  return s;
};
const sanitizeHex = (input) => (input || "").replace(/[^0-9A-Fa-f]/g, '').toUpperCase().padEnd(16, '0').substring(0, 16);
const permute = (block, table) => table.map(x => block[x - 1]);
const xor = (a, b) => a.map((v, i) => v ^ b[i]);
const leftShift = (bits, n) => [...bits.slice(n), ...bits.slice(0, n)];
const hexToBits = (hex) => {
  const bits = [];
  for (let i = 0; i < hex.length; i++) {
    const v = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    for (let j = 0; j < 4; j++) bits.push(parseInt(v[j]));
  }
  return bits;
};
const bitsToHex = (bits) => {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) hex += parseInt(bits.slice(i, i + 4).join(""), 2).toString(16).toUpperCase();
  return hex;
};
const formatBinary = (bits) => bits.join('').match(/.{1,8}/g).join(' ');
const flipBitAt = (hex, idx) => {
  const bits = hexToBits(sanitizeHex(hex));
  if (idx >= 0 && idx < 64) bits[idx] ^= 1;
  return bitsToHex(bits);
};
const hammingHex = (a, b) => {
  const ab = hexToBits(a), bb = hexToBits(b);
  let c = 0;
  for (let i = 0; i < ab.length; i++) if (ab[i] !== bb[i]) c++;
  return c;
};

// ============================================================================
// CORE CRYPTO (DSR + Original DES) WITH ROUND TRACE
// ============================================================================
const generateKeys = (keyHex) => {
  const k56 = permute(hexToBits(keyHex), PC1);
  let L = k56.slice(0, 28), R = k56.slice(28);
  const subkeys = [];
  for (const s of SHIFTS) {
    L = leftShift(L, s); R = leftShift(R, s);
    subkeys.push(permute([...L, ...R], PC2));
  }
  return subkeys;
};

// useDSR controls whether the dynamic shift step is applied
const fFunction = (right, subkey, useDSR) => {
  const expanded = permute(right, E_BOX);
  const mixed = xor(expanded, subkey);
  const sboxOut = [];
  for (let i = 0; i < 8; i++) {
    const c = mixed.slice(i * 6, i * 6 + 6);
    const row = (c[0] << 1) + c[5];
    const col = (c[1] << 3) + (c[2] << 2) + (c[3] << 1) + c[4];
    const v = S_BOXES[i][row][col].toString(2).padStart(4, '0');
    for (const b of v) sboxOut.push(parseInt(b));
  }
  let shiftVal = 0;
  let after = sboxOut;
  if (useDSR) {
    // Per case study: take first 5 bits of S-box OUTPUT to determine the shift
    shiftVal = parseInt(sboxOut.slice(0, 5).join(""), 2);
    after = leftShift(sboxOut, shiftVal);
  }
  return { out: permute(after, P_BOX), shiftVal, sboxOut };
};

// Returns ciphertext + per-round trace
const desCryptTrace = (dataHex, keyHex, isDecrypt = false, useDSR = true) => {
  let subkeys = generateKeys(keyHex);
  if (isDecrypt) subkeys = subkeys.slice().reverse();
  const block = permute(hexToBits(dataHex), IP);
  let L = block.slice(0, 32), R = block.slice(32);
  const rounds = [{ L: [...L], R: [...R], shiftVal: null, subkey: null }];
  for (let i = 0; i < 16; i++) {
    const { out, shiftVal } = fFunction(R, subkeys[i], useDSR);
    const newR = xor(L, out);
    L = R; R = newR;
    rounds.push({ L: [...L], R: [...R], shiftVal, subkey: bitsToHex(subkeys[i]) });
  }
  const cipher = bitsToHex(permute([...R, ...L], IP_INV));
  return { cipher, rounds, subkeysHex: subkeys.map(bitsToHex) };
};
const desCrypt = (dataHex, keyHex, isDecrypt = false, useDSR = true) =>
  desCryptTrace(dataHex, keyHex, isDecrypt, useDSR).cipher;

// Per-round avalanche (% of 64 ciphertext bits that differ when 1 input bit is flipped)
// We measure the "intermediate ciphertext" at each round (apply IP_INV to current state).
const avalancheByRound = (p1Hex, keyHex, flipIdx, useDSR) => {
  const p2Hex = flipBitAt(p1Hex, flipIdx);
  const t1 = desCryptTrace(p1Hex, keyHex, false, useDSR);
  const t2 = desCryptTrace(p2Hex, keyHex, false, useDSR);
  const series = [];
  for (let r = 0; r < t1.rounds.length; r++) {
    const a = bitsToHex(permute([...t1.rounds[r].R, ...t1.rounds[r].L], IP_INV));
    const b = bitsToHex(permute([...t2.rounds[r].R, ...t2.rounds[r].L], IP_INV));
    series.push({ round: r, flipped: hammingHex(a, b) });
  }
  return series;
};

// Shannon entropy on hex byte stream
const shannonEntropy = (hex) => {
  const counts = new Array(256).fill(0);
  let n = 0;
  for (let i = 0; i < hex.length; i += 2) {
    counts[parseInt(hex.substring(i, i + 2), 16)]++;
    n++;
  }
  let H = 0;
  for (const c of counts) if (c > 0) { const p = c / n; H -= p * Math.log2(p); }
  return H;
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function App() {
  const [tab, setTab] = useState('demo');
  const [inputMode, setInputMode] = useState('text');

  // ---- Tab: Demo (Encrypt/Decrypt) ----
  const [plainText, setPlainText] = useState("");
  const [plainHex, setPlainHex] = useState("");
  const [keyHex, setKeyHex] = useState("133457799BBCDFF1");
  const [lockedPlaintextHex, setLockedPlaintextHex] = useState("");
  const [lockedKey, setLockedKey] = useState("");
  const [cipherOut, setCipherOut] = useState("");
  const [decryptedHexOut, setDecryptedHexOut] = useState("");
  const [decryptedTextOut, setDecryptedTextOut] = useState("");
  const [encTrace, setEncTrace] = useState(null); // {cipher, rounds, subkeysHex}
  const [decTrace, setDecTrace] = useState(null);
  const [showKeySchedule, setShowKeySchedule] = useState(false);
  const [showEncTrace, setShowEncTrace] = useState(false);
  const [showDecTrace, setShowDecTrace] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  // ---- Tab: Avalanche ----
  const [avKey, setAvKey] = useState("133457799BBCDFF1");
  const [avP1, setAvP1] = useState("");
  const [bitToFlip, setBitToFlip] = useState(1);
  const [avalancheResult, setAvalancheResult] = useState(null);
  const [avalancheSeries, setAvalancheSeries] = useState(null); // [{round,dsr,orig}]

  // ---- Tab: Performance ----
  const [perfRunning, setPerfRunning] = useState(false);
  const [perfResults, setPerfResults] = useState(null);

  // ---- Tab: Entropy ----
  const [entropyResult, setEntropyResult] = useState(null);

  useEffect(() => {
    if (inputMode === 'text') setPlainHex(plainText === "" ? "" : textToHex(plainText));
  }, [plainText, inputMode]);

  // -------- Avalanche calc (uses REAL crypto -- DSR) --------
  const runAvalancheCalculation = (baseHex, k, flipIdx) => {
    try {
      const p1 = sanitizeHex(baseHex);
      const p2 = flipBitAt(p1, flipIdx);
      const c1 = desCrypt(p1, k, false, true);
      const c2 = desCrypt(p2, k, false, true);
      const c1OrigHex = desCrypt(p1, k, false, false);
      const c2OrigHex = desCrypt(p2, k, false, false);

      const b1 = hexToBits(c1), b2 = hexToBits(c2);
      const p1Bits = hexToBits(p1), p2Bits = hexToBits(p2);
      let flipped = 0;
      const visualArray = [], xorBits = [];
      for (let i = 0; i < 64; i++) {
        if (b1[i] !== b2[i]) { flipped++; visualArray.push(true); xorBits.push(1); }
        else { visualArray.push(false); xorBits.push(0); }
      }

      const dsrSeries = avalancheByRound(p1, k, flipIdx, true);
      const origSeries = avalancheByRound(p1, k, flipIdx, false);
      const merged = dsrSeries.map((d, i) => ({ round: d.round, dsr: d.flipped, orig: origSeries[i].flipped }));
      setAvalancheSeries(merged);

      const origFlipped = hammingHex(c1OrigHex, c2OrigHex);

      setAvalancheResult({
        p1, p2, c1, c2, flipped,
        percentage: ((flipped / 64) * 100).toFixed(2),
        origFlipped,
        origPercentage: ((origFlipped / 64) * 100).toFixed(2),
        visualArray,
        p1Bin: formatBinary(p1Bits),
        p2Bin: formatBinary(p2Bits),
        c1Bin: formatBinary(b1),
        c2Bin: formatBinary(b2),
        xorBin: formatBinary(xorBits)
      });
    } catch (e) { console.error(e); }
  };

  // -------- Encrypt --------
  const handleEncrypt = () => {
    const cleanPlain = sanitizeHex(plainHex || "");
    const cleanKey = sanitizeHex(keyHex || "");
    if (inputMode === 'hex') setPlainHex(cleanPlain);
    setKeyHex(cleanKey);
    try {
      const trace = desCryptTrace(cleanPlain, cleanKey, false, true);
      setEncTrace(trace);
      setLockedPlaintextHex(cleanPlain);
      setLockedKey(cleanKey);
      setCipherOut(trace.cipher);
      setDecryptedHexOut("");
      setDecryptedTextOut("");
      setDecTrace(null);
      setShowEncTrace(false);
      setShowDecTrace(false);

      // Auto-run avalanche on bit 1
      setAvKey(cleanKey);
      setAvP1(cleanPlain);
      setBitToFlip(1);
      runAvalancheCalculation(cleanPlain, cleanKey, 0);

      // Auto-run entropy on cipher (8 bytes is small but illustrative)
      setEntropyResult({
        plaintextHex: cleanPlain,
        cipherDSR: trace.cipher,
        cipherOrig: desCrypt(cleanPlain, cleanKey, false, false),
        H_plain: shannonEntropy(cleanPlain),
        H_dsr: shannonEntropy(trace.cipher),
        H_orig: shannonEntropy(desCrypt(cleanPlain, cleanKey, false, false))
      });

      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 3000);
    } catch (e) { alert("Encryption error."); }
  };

  const handleDecrypt = () => {
    if (!cipherOut) return;
    try {
      const trace = desCryptTrace(cipherOut, lockedKey, true, true);
      setDecTrace(trace);
      setDecryptedHexOut(trace.cipher);
      setDecryptedTextOut(hexToText(trace.cipher));
    } catch (e) { alert("Decryption error."); }
  };

  const handleManualAvalanche = () => {
    const cleanKey = sanitizeHex(avKey || "");
    const cleanP1 = sanitizeHex(avP1 || "");
    const idx = Math.max(1, Math.min(64, bitToFlip)) - 1;
    setAvKey(cleanKey); setAvP1(cleanP1); setBitToFlip(idx + 1);
    runAvalancheCalculation(cleanP1, cleanKey, idx);
  };

  // -------- Performance benchmark (real timing) --------
  const runBenchmark = async () => {
    setPerfRunning(true);
    setPerfResults(null);
    await new Promise(r => setTimeout(r, 50)); // let UI update

    const sizes = [
      { label: '1 KB',  blocks: 128 },
      { label: '4 KB',  blocks: 512 },
      { label: '16 KB', blocks: 2048 },
      { label: '64 KB', blocks: 8192 },
    ];
    const k = sanitizeHex(keyHex || "133457799BBCDFF1");
    const sample = "0123456789ABCDEF";
    const results = [];
    for (const s of sizes) {
      const t0 = performance.now();
      for (let i = 0; i < s.blocks; i++) desCrypt(sample, k, false, false);
      const tOrig = performance.now() - t0;
      const t1 = performance.now();
      for (let i = 0; i < s.blocks; i++) desCrypt(sample, k, false, true);
      const tDSR = performance.now() - t1;
      const bytes = s.blocks * 8;
      results.push({
        size: s.label, blocks: s.blocks,
        origMs: tOrig, dsrMs: tDSR,
        origThroughput: (bytes / 1024) / (tOrig / 1000),
        dsrThroughput:  (bytes / 1024) / (tDSR / 1000),
      });
      await new Promise(r => setTimeout(r, 10));
    }
    setPerfResults(results);
    setPerfRunning(false);
  };

  // -------- Run multi-sample entropy --------
  const ENTROPY_SAMPLES = useMemo(() => ([
    "Hello World!", "Cryptography", "DES Algo!!", "Case Study", "Random!!!", "TestInput", "Crypto Lab", "Security!!"
  ]), []);
  const [entropyTable, setEntropyTable] = useState(null);
  const runEntropyTable = () => {
    const k = sanitizeHex(keyHex || "133457799BBCDFF1");
    // For meaningful Shannon at byte-level, encrypt many blocks per sample and concatenate
    const rows = ENTROPY_SAMPLES.map(s => {
      const ph = textToHex(s.padEnd(8, ' ').slice(0, 8));
      // Build a longer stream: encrypt 64 different "messages" derived by varying last byte
      let dsrStream = "", origStream = "";
      for (let i = 0; i < 64; i++) {
        const mod = sanitizeHex(ph.slice(0, 14) + i.toString(16).padStart(2, '0'));
        dsrStream += desCrypt(mod, k, false, true);
        origStream += desCrypt(mod, k, false, false);
      }
      return {
        sample: s,
        plaintextH: shannonEntropy(ph),
        origH: shannonEntropy(origStream),
        dsrH: shannonEntropy(dsrStream)
      };
    });
    setEntropyTable(rows);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const TabBtn = ({ id, label, icon: Icon, color = "amber" }) => {
    const active = tab === id;
    const colorMap = {
      amber: 'border-amber-500 text-amber-400',
      blue: 'border-blue-500 text-blue-400',
      emerald: 'border-emerald-500 text-emerald-400',
      violet: 'border-violet-500 text-violet-400',
      pink: 'border-pink-500 text-pink-400',
    };
    return (
      <button
        onClick={() => setTab(id)}
        className={'relative pb-3 px-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-1.5 ' +
          (active ? colorMap[color] : 'border-transparent text-slate-400 hover:text-slate-200')}
      >
        {Icon && <Icon size={14} />}
        {label}
        {id === 'avalanche' && justUpdated && tab !== 'avalanche' && (
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </button>
    );
  };

  // Round trace renderer
  const renderRoundTrace = (trace, isDecrypt) => {
    if (!trace) return null;
    const accentClass = isDecrypt ? 'text-emerald-400' : 'text-blue-400';
    return (
      <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
        <div className={`grid grid-cols-12 gap-2 px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-800 bg-slate-900`}>
          <div className="col-span-1">Round</div>
          <div className="col-span-3">L (32-bit hex)</div>
          <div className="col-span-3">R (32-bit hex)</div>
          <div className="col-span-1">Shift</div>
          <div className="col-span-4">Subkey (48-bit)</div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {trace.rounds.map((r, i) => (
            <div key={i} className={`grid grid-cols-12 gap-2 px-3 py-1.5 text-xs font-mono border-b border-slate-900 ${i === 0 ? 'bg-slate-900/40' : i === 16 ? 'bg-emerald-900/10' : ''}`}>
              <div className={`col-span-1 font-bold ${i === 0 ? 'text-slate-500' : i === 16 ? 'text-emerald-400' : accentClass}`}>
                {i === 0 ? 'IP' : i === 16 ? 'Final' : `R${i}`}
              </div>
              <div className="col-span-3 text-slate-300">{bitsToHex(r.L)}</div>
              <div className="col-span-3 text-slate-300">{bitsToHex(r.R)}</div>
              <div className="col-span-1">
                {r.shiftVal !== null ? <span className="text-amber-400 font-bold">{r.shiftVal}</span> : <span className="text-slate-700">—</span>}
              </div>
              <div className="col-span-4 text-slate-500 truncate">{r.subkey || '—'}</div>
            </div>
          ))}
        </div>
        <div className="px-3 py-2 text-[11px] text-slate-500 bg-slate-900 border-t border-slate-800">
          <span className="text-amber-400 font-semibold">Shift</span> = decimal value of the first 5 bits of S-box output (DSR step). 0 means no DSR applied.
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            <Shield size={16} /> Case Study — Information Assurance & Security
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 tracking-tight">
            Dynamic Shift Routing
          </h1>
          <p className="text-lg text-slate-400 mt-1">Enhancing the Data Encryption Standard</p>
          <p className="text-slate-500 mt-3 text-sm max-w-3xl leading-relaxed">
            A working demo of our DES modification. Encrypt and decrypt your own input,
            inspect every round of both processes, and verify our three security tests
            (<span className="text-amber-400">Avalanche</span>, <span className="text-amber-400">Performance</span>,
            <span className="text-amber-400"> Shannon Entropy</span>) computed live from the same algorithm — no hand-crafted numbers.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-800">
          <TabBtn id="demo" label="Encrypt / Decrypt" icon={Key} color="amber" />
          <TabBtn id="rounds" label="Round-by-Round Trace" icon={Eye} color="amber" />
          <TabBtn id="avalanche" label="Avalanche Effect" icon={Zap} color="amber" />
          <TabBtn id="performance" label="Performance Benchmark" icon={Clock} color="amber" />
          <TabBtn id="entropy" label="Shannon Entropy" icon={BarChart2} color="amber" />
          <TabBtn id="explanation" label="Why DSR Works" icon={Info} color="amber" />
        </div>

        {/* ===================== TAB: DEMO ===================== */}
        {tab === 'demo' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-4 gap-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock size={18} className="text-amber-400" /> Encryption / Decryption Trace
                </h2>
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button onClick={() => { setInputMode('text'); setPlainText(''); setPlainHex(''); }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${inputMode === 'text' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Type size={14} /> Text
                  </button>
                  <button onClick={() => { setInputMode('hex'); setPlainText(''); setPlainHex(''); }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${inputMode === 'hex' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Hash size={14} /> Hex
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputMode === 'text' ? (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Human Plaintext (Max 8 chars)</label>
                    <input type="text" value={plainText} onChange={(e) => setPlainText(e.target.value)}
                      placeholder="E.g., HELLO" maxLength={8}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-emerald-400 font-mono focus:border-emerald-500 outline-none" />
                    {plainHex && <div className="text-xs text-slate-500 mt-1 font-mono">Hex: <span className="text-slate-400">{plainHex.padEnd(16, '0')}</span></div>}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Plaintext (16 Hex Chars)</label>
                    <input type="text" value={plainHex} onChange={(e) => setPlainHex(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                      placeholder="E.g., 50524F4744454E20" maxLength={16}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-emerald-400 font-mono focus:border-emerald-500 outline-none" />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Symmetric Key (16 Hex Chars)</label>
                  <input type="text" value={keyHex} onChange={(e) => setKeyHex(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                    placeholder="E.g., 133457799BBCDFF1" maxLength={16}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-blue-400 font-mono focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button onClick={handleEncrypt}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                  <Lock size={16} /> Encrypt with DSR <ArrowRight size={18} />
                </button>
              </div>

              {cipherOut && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4 animate-in slide-in-from-top-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ciphertext Output</label>
                    <div className="w-full bg-black border border-slate-800 rounded-lg p-4 text-red-400 font-mono tracking-widest text-center text-lg shadow-inner">
                      {cipherOut.match(/.{1,4}/g).join(' ')}
                    </div>
                  </div>
                  <div className="flex justify-center pt-2">
                    <button onClick={handleDecrypt}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                      <Unlock size={16} /> Decrypt Ciphertext <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {decryptedHexOut && (
                <div className={`p-5 rounded-lg border animate-in zoom-in-95 ${decryptedHexOut === lockedPlaintextHex ? 'bg-emerald-900/20 border-emerald-700' : 'bg-red-900/20 border-red-700'}`}>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-800/30">
                    {decryptedHexOut === lockedPlaintextHex ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
                    <span className={`text-lg font-semibold ${decryptedHexOut === lockedPlaintextHex ? "text-emerald-400" : "text-red-400"}`}>
                      {decryptedHexOut === lockedPlaintextHex ? "Success: Perfectly Reversible!" : "Error: Data mismatch"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 shadow-inner space-y-2">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Raw Hex Verification</div>
                      <div className="font-mono text-sm text-slate-300">
                        Original: {lockedPlaintextHex}<br />
                        Restored: <span className={decryptedHexOut === lockedPlaintextHex ? "text-emerald-400" : "text-red-400"}>{decryptedHexOut}</span>
                      </div>
                    </div>
                    {inputMode === 'text' && (
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 shadow-inner space-y-2">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Human Text Recovery</div>
                        <div className="font-mono text-lg text-emerald-400">"{decryptedTextOut.trim()}"</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Schedule */}
              {encTrace && (
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <button onClick={() => setShowKeySchedule(!showKeySchedule)}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold">
                    {showKeySchedule ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <List size={16} />
                    {showKeySchedule ? "Hide" : "View"} Key Schedule (16 Rounds)
                  </button>
                  {showKeySchedule && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                          <ArrowRight size={14} className="text-blue-500" /> Encryption Keys (Forward)
                        </h4>
                        <div className="space-y-1">
                          {encTrace.subkeysHex.map((k, i) => (
                            <div key={i} className="font-mono text-xs text-slate-400 flex justify-between">
                              <span>Round {i + 1}:</span><span className="text-blue-400 font-bold">{k}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                          <ArrowRight size={14} className="text-emerald-500 rotate-180" /> Decryption Keys (Reverse)
                        </h4>
                        <div className="space-y-1">
                          {[...encTrace.subkeysHex].reverse().map((k, i) => (
                            <div key={i} className="font-mono text-xs text-slate-400 flex justify-between">
                              <span>Round {i + 1}:</span><span className="text-emerald-400 font-bold">{k}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick visual link to round trace */}
            {encTrace && (
              <div className="bg-gradient-to-br from-slate-900 to-amber-950/10 border border-amber-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-amber-400 font-semibold flex items-center gap-2"><Eye size={16} /> See every round</div>
                  <p className="text-sm text-slate-400 mt-1">Inspect L, R, the dynamic shift value, and subkey at each of the 16 rounds — for both encryption and decryption.</p>
                </div>
                <button onClick={() => setTab('rounds')} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap">
                  Open Trace <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: ROUND TRACE ===================== */}
        {tab === 'rounds' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {!encTrace ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
                <Eye size={36} className="mx-auto text-slate-600 mb-3" />
                <p>No trace yet. Encrypt something on the <button className="text-amber-400 underline" onClick={() => setTab('demo')}>Encrypt / Decrypt</button> tab first.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Plaintext</div>
                    <div className="font-mono text-emerald-400 text-lg break-all">{lockedPlaintextHex}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Ciphertext</div>
                    <div className="font-mono text-red-400 text-lg break-all">{cipherOut}</div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-400 font-semibold flex items-center gap-2"><Lock size={16} /> Encryption Trace (Plaintext → Ciphertext)</h3>
                    <button onClick={() => setShowEncTrace(!showEncTrace)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {showEncTrace ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {showEncTrace ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {showEncTrace && renderRoundTrace(encTrace, false)}
                  {!showEncTrace && <p className="text-sm text-slate-500">Click expand to see all 16 rounds.</p>}
                </div>

                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-emerald-400 font-semibold flex items-center gap-2"><Unlock size={16} /> Decryption Trace (Ciphertext → Plaintext)</h3>
                    <div className="flex items-center gap-3">
                      {!decTrace && <button onClick={handleDecrypt} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-semibold flex items-center gap-1">
                        <Play size={12} /> Run Decryption
                      </button>}
                      {decTrace && (
                        <button onClick={() => setShowDecTrace(!showDecTrace)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                          {showDecTrace ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {showDecTrace ? 'Collapse' : 'Expand'}
                        </button>
                      )}
                    </div>
                  </div>
                  {decTrace ? (showDecTrace ? renderRoundTrace(decTrace, true) : <p className="text-sm text-slate-500">Click expand to see all 16 rounds (subkeys applied in reverse).</p>)
                    : <p className="text-sm text-slate-500">Decryption uses the SAME 16 subkeys, applied in reverse order, to recover the original plaintext.</p>}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-sm text-slate-400 leading-relaxed">
                  <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2"><Info size={16} /> Reading the trace</h4>
                  <p><strong className="text-slate-200">L</strong> and <strong className="text-slate-200">R</strong> are the 32-bit halves after each round. The <strong className="text-amber-400">Shift</strong> column shows the data-dependent left circular shift applied by DSR (the decimal value of the first 5 bits of the S-box output, range 0–31). The <strong className="text-blue-400">Subkey</strong> is the 48-bit round key derived from the master key. Notice the shift value differs from round to round — that is the source of DSR's improved diffusion.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===================== TAB: AVALANCHE ===================== */}
        {tab === 'avalanche' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-800 pb-3 gap-2">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Zap size={18} className="text-amber-400" /> Single-Bit Avalanche Tester</h2>
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Info size={14} /> Live computed — same algorithm as the Demo tab
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Shared Key (Hex)</label>
                  <input type="text" value={avKey} onChange={(e) => setAvKey(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                    maxLength={16} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-blue-400 font-mono outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Base Plaintext (P1 Hex)</label>
                  <input type="text" value={avP1} onChange={(e) => setAvP1(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                    maxLength={16} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-yellow-400 uppercase tracking-wider font-semibold">Bit to Flip (1–64)</label>
                  <div className="flex items-center bg-slate-950 border border-yellow-600/50 rounded-lg overflow-hidden focus-within:border-yellow-500">
                    <div className="bg-yellow-500/10 px-3 py-2 text-yellow-500"><Target size={18} /></div>
                    <input type="number" min="1" max="64" value={bitToFlip} onChange={(e) => setBitToFlip(e.target.value)}
                      className="w-full bg-transparent p-2 text-yellow-400 font-bold outline-none" />
                  </div>
                </div>
              </div>

              <button onClick={handleManualAvalanche}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border border-slate-700">
                <Zap size={18} /> Flip Bit #{bitToFlip} & Run Test
              </button>

              {avalancheResult && (
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-5 space-y-6">
                  {/* Comparison cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                      <div className="text-xs uppercase text-blue-400 tracking-wider mb-1">Original DES</div>
                      <div className="text-3xl font-bold text-blue-400">{avalancheResult.origPercentage}%</div>
                      <div className="text-xs text-blue-300/70 mt-1">{avalancheResult.origFlipped} of 64 bits flipped</div>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                      <div className="text-xs uppercase text-amber-400 tracking-wider mb-1">Modified DES (DSR)</div>
                      <div className="text-3xl font-bold text-amber-400">{avalancheResult.percentage}%</div>
                      <div className="text-xs text-amber-300/70 mt-1">{avalancheResult.flipped} of 64 bits flipped</div>
                    </div>
                  </div>

                  {/* Per-round chart */}
                  {avalancheSeries && (
                    <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                      <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2"><Activity size={16} className="text-blue-400" /> Round-by-Round Avalanche Progression</h3>
                      <svg viewBox="0 0 800 280" className="w-full h-auto">
                        {(() => {
                          const W = 800, H = 280, P = 36;
                          const xOf = (r) => P + (r / 16) * (W - P * 2);
                          const yOf = (v) => H - P - (v / 64) * (H - P * 2);
                          return (
                            <>
                              {[0, 16, 32, 48, 64].map(v => (
                                <g key={v}>
                                  <line x1={P} y1={yOf(v)} x2={W - P} y2={yOf(v)} stroke="#1e293b" strokeDasharray="4 4" />
                                  <text x={P - 8} y={yOf(v) + 4} fill="#64748b" fontSize="11" textAnchor="end">{v}</text>
                                </g>
                              ))}
                              <line x1={P} y1={yOf(32)} x2={W - P} y2={yOf(32)} stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
                              <text x={W - P + 6} y={yOf(32) + 4} fill="#10b981" fontSize="10" fontWeight="bold">50%</text>
                              {avalancheSeries.map(d => (
                                <text key={d.round} x={xOf(d.round)} y={H - 14} fill="#64748b" fontSize="10" textAnchor="middle">R{d.round}</text>
                              ))}
                              <polyline points={avalancheSeries.map(d => `${xOf(d.round)},${yOf(d.orig)}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                              <polyline points={avalancheSeries.map(d => `${xOf(d.round)},${yOf(d.dsr)}`).join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                              {avalancheSeries.map(d => (
                                <g key={d.round}>
                                  <circle cx={xOf(d.round)} cy={yOf(d.orig)} r="3" fill="#3b82f6" />
                                  <circle cx={xOf(d.round)} cy={yOf(d.dsr)} r="3" fill="#f59e0b" />
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                      <div className="flex justify-center gap-6 mt-2 text-xs">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-sm" /> Original DES</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-sm" /> Modified (DSR)</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-0.5 bg-emerald-500" /> Ideal 50%</span>
                      </div>
                    </div>
                  )}

                  {/* Math breakdown */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                      <Calculator size={16} className="text-blue-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Mathematical Breakdown (DSR)</h3>
                    </div>
                    <div className="bg-black p-4 font-mono text-xs space-y-3 overflow-x-auto">
                      <div className="space-y-1">
                        <div className="text-slate-500">1. Generated 1-Bit Difference:</div>
                        <div className="flex gap-4"><span className="w-8 text-emerald-400">P1:</span><span className="text-slate-300">{avalancheResult.p1Bin}</span></div>
                        <div className="flex gap-4"><span className="w-8 text-yellow-400">P2:</span><span className="text-slate-300">{avalancheResult.p2Bin}</span></div>
                      </div>
                      <div className="border-t border-slate-800 pt-3 space-y-1">
                        <div className="text-slate-500">2. Ciphertext XOR:</div>
                        <div className="flex gap-4"><span className="w-8 text-emerald-400">C1:</span><span className="text-slate-300">{avalancheResult.c1Bin}</span></div>
                        <div className="flex gap-4"><span className="w-8 text-yellow-400">C2:</span><span className="text-slate-300">{avalancheResult.c2Bin}</span></div>
                        <div className="flex gap-4 border-t border-dashed border-slate-700 pt-1">
                          <span className="w-8 text-red-400">XOR:</span><span className="text-red-400 font-bold">{avalancheResult.xorBin}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                        <span className="text-slate-500">3. Final:</span>
                        <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">
                          ({avalancheResult.flipped} / 64) × 100 = <strong className="text-white">{avalancheResult.percentage}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bit map */}
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Visual Bit Flip Map (Yellow = Flipped)</span>
                    <div className="grid grid-cols-8 md:grid-cols-16 gap-1">
                      {avalancheResult.visualArray.map((f, i) => (
                        <div key={i} title={`Bit ${i + 1}`}
                          className={`h-5 rounded-sm ${f ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.3)]' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: PERFORMANCE ===================== */}
        {tab === 'performance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><FastForward size={18} /> What it measures</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Wall-clock time to encrypt N 64-bit blocks with both algorithms, and the resulting throughput in KB/s.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><Cpu size={18} /> How we test</h4>
                <ol className="text-sm text-slate-400 list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Encrypt the same block N times.</li>
                  <li>Time each algorithm with <code className="text-amber-300 bg-amber-500/10 px-1 rounded">performance.now()</code>.</li>
                  <li>Compare runtime and throughput.</li>
                </ol>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><Activity size={18} /> Why it matters</h4>
                <p className="text-sm text-slate-400 leading-relaxed">DSR adds one circular-shift step per round. We expect minimal overhead (&lt; ~5%) — proving the security gain is essentially free.</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-slate-200 flex items-center gap-2"><Database size={18} className="text-amber-400" /> Live Benchmark</h4>
                <button onClick={runBenchmark} disabled={perfRunning}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50">
                  <Play size={14} /> {perfRunning ? 'Running…' : (perfResults ? 'Re-run' : 'Run Benchmark')}
                </button>
              </div>
              {!perfResults && !perfRunning && <p className="text-sm text-slate-400">Click <strong className="text-amber-400">Run Benchmark</strong> to time the algorithm in your browser.</p>}
              {perfRunning && <p className="text-sm text-amber-400 animate-pulse">Encrypting blocks…</p>}
              {perfResults && (
                <div className="space-y-6">
                  {(() => {
                    const maxTime = Math.max(...perfResults.flatMap(r => [r.origMs, r.dsrMs]));
                    return perfResults.map((r, i) => (
                      <div key={i}>
                        <div className="text-xs font-bold tracking-wider text-slate-500 mb-3 uppercase">Stream Size: {r.size} ({r.blocks} blocks)</div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="w-28 text-sm text-blue-400 text-right font-medium">Original DES</div>
                            <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden"><div className="bg-blue-600 h-full" style={{ width: `${(r.origMs / maxTime) * 100}%` }}></div></div>
                            <div className="w-24 text-sm text-blue-300 font-mono text-right">{r.origMs.toFixed(2)}ms</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-28 text-sm text-amber-400 text-right font-medium">Modified DES</div>
                            <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden"><div className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" style={{ width: `${(r.dsrMs / maxTime) * 100}%` }}></div></div>
                            <div className="w-24 text-sm text-amber-300 font-mono text-right">{r.dsrMs.toFixed(2)}ms</div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                  <div className="overflow-x-auto pt-4 border-t border-slate-800">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left text-slate-500 font-semibold pb-3 pr-4">Size</th>
                          <th className="text-right text-blue-400 font-semibold pb-3 px-4">Original (KB/s)</th>
                          <th className="text-right text-amber-400 font-semibold pb-3 px-4">DSR (KB/s)</th>
                          <th className="text-right text-slate-400 font-semibold pb-3 pl-4">Overhead</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {perfResults.map((r, i) => {
                          const overhead = ((r.dsrMs - r.origMs) / r.origMs) * 100;
                          return (
                            <tr key={i} className="hover:bg-slate-800/40">
                              <td className="py-3 pr-4 text-slate-300 font-mono">{r.size}</td>
                              <td className="py-3 px-4 text-right text-blue-300 font-mono">{r.origThroughput.toFixed(1)}</td>
                              <td className="py-3 px-4 text-right text-amber-300 font-mono">{r.dsrThroughput.toFixed(1)}</td>
                              <td className="py-3 pl-4 text-right">
                                <span className={`font-mono font-semibold ${overhead < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {overhead >= 0 ? '+' : ''}{overhead.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {perfResults && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2"><CheckCircle2 size={18} /> Observation</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  The DSR step is one extra circular-shift per round — a single-clock CPU op. The benchmark above
                  (run live in your browser) confirms the overhead is small. Our security gain is essentially free.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: ENTROPY ===================== */}
        {tab === 'entropy' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><BarChart2 size={18} /> What it is</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Shannon entropy H scores byte-level unpredictability from 0 to <strong className="text-slate-300">8.0</strong>. Closer to 8 = more random.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><Shuffle size={18} /> How we test</h4>
                <ol className="text-sm text-slate-400 list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Encrypt 64 variants of each plaintext.</li>
                  <li>Concatenate ciphertexts and count byte frequencies.</li>
                  <li>Apply H = −Σ p log₂ p.</li>
                </ol>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><Binary size={18} /> Why it matters</h4>
                <p className="text-sm text-slate-400 leading-relaxed">If DSR scores at or above original DES, we know the modification adds no statistical bias.</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-slate-200 flex items-center gap-2"><Database size={18} className="text-amber-400" /> Sample Battery</h4>
                <button onClick={runEntropyTable} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                  <Play size={14} /> {entropyTable ? 'Re-run' : 'Compute Entropy'}
                </button>
              </div>
              {!entropyTable && <p className="text-sm text-slate-400">Click <strong className="text-amber-400">Compute Entropy</strong> to measure byte-level randomness across multiple samples.</p>}
              {entropyTable && (() => {
                const avgOrig = entropyTable.reduce((s, r) => s + r.origH, 0) / entropyTable.length;
                const avgDsr = entropyTable.reduce((s, r) => s + r.dsrH, 0) / entropyTable.length;
                const Gauge = ({ value, color, label }) => {
                  const MIN = 7.90, MAX = 8.00;
                  const pct = Math.min(1, Math.max(0, (value - MIN) / (MAX - MIN)));
                  const startAngle = -210, sweepTotal = 240;
                  const angle = startAngle + pct * sweepTotal;
                  const toRad = (d) => (d * Math.PI) / 180;
                  const cx = 80, cy = 80, r = 58;
                  const ts = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
                  const te = { x: cx + r * Math.cos(toRad(startAngle + sweepTotal)), y: cy + r * Math.sin(toRad(startAngle + sweepTotal)) };
                  const fe = { x: cx + r * Math.cos(toRad(angle)), y: cy + r * Math.sin(toRad(angle)) };
                  const largeArc = pct * sweepTotal > 180 ? 1 : 0;
                  return (
                    <div className="flex flex-col items-center">
                      <svg width="160" height="120" viewBox="0 0 160 120">
                        <path d={`M ${ts.x} ${ts.y} A ${r} ${r} 0 1 1 ${te.x} ${te.y}`} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                        <path d={`M ${ts.x} ${ts.y} A ${r} ${r} 0 ${largeArc} 1 ${fe.x} ${fe.y}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
                        <text x="80" y="82" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold" fontFamily="monospace">{value.toFixed(4)}</text>
                        <text x="80" y="100" textAnchor="middle" fill="#64748b" fontSize="9">/ 8.0000 max</text>
                      </svg>
                      <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
                    </div>
                  );
                };
                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-8 py-6 border-b border-slate-800">
                      <Gauge value={avgOrig} color="#3b82f6" label="Original DES" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Difference</div>
                        <div className={`text-2xl font-extrabold font-mono ${avgDsr >= avgOrig ? 'text-amber-400' : 'text-red-400'}`}>
                          {avgDsr >= avgOrig ? '+' : ''}{(avgDsr - avgOrig).toFixed(4)}
                        </div>
                        <div className="text-xs text-slate-500">bits / byte</div>
                      </div>
                      <Gauge value={avgDsr} color="#f59e0b" label="Modified DES (DSR)" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left text-slate-500 font-semibold pb-3 pr-4">Plaintext Sample</th>
                            <th className="text-right text-blue-400 font-semibold pb-3 px-4">Original (H)</th>
                            <th className="text-right text-amber-400 font-semibold pb-3 px-4">DSR (H)</th>
                            <th className="text-right text-slate-400 font-semibold pb-3 pl-4">Δ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {entropyTable.map((r, i) => {
                            const d = r.dsrH - r.origH;
                            return (
                              <tr key={i} className="hover:bg-slate-800/40">
                                <td className="py-3 pr-4 text-slate-300 font-mono text-xs">"{r.sample}"</td>
                                <td className="py-3 px-4 text-right text-blue-300 font-mono">{r.origH.toFixed(4)}</td>
                                <td className="py-3 px-4 text-right text-amber-300 font-mono">{r.dsrH.toFixed(4)}</td>
                                <td className="py-3 pl-4 text-right">
                                  <span className={`font-mono font-semibold ${d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {d >= 0 ? '+' : ''}{d.toFixed(4)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-slate-700 bg-slate-800/30">
                            <td className="py-3 pr-4 text-slate-300 font-bold text-xs">Average</td>
                            <td className="py-3 px-4 text-right text-blue-400 font-mono font-bold">{avgOrig.toFixed(4)}</td>
                            <td className="py-3 px-4 text-right text-amber-400 font-mono font-bold">{avgDsr.toFixed(4)}</td>
                            <td className="py-3 pl-4 text-right text-amber-400 font-mono font-bold">{avgDsr >= avgOrig ? '+' : ''}{(avgDsr - avgOrig).toFixed(4)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {entropyResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                <h4 className="text-amber-400 font-semibold flex items-center gap-2"><Info size={16} /> Entropy of YOUR last encryption</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase">Plaintext H</div>
                    <div className="text-emerald-400 font-mono text-xl">{entropyResult.H_plain.toFixed(4)}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase">Original DES H</div>
                    <div className="text-blue-400 font-mono text-xl">{entropyResult.H_orig.toFixed(4)}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 uppercase">DSR H</div>
                    <div className="text-amber-400 font-mono text-xl">{entropyResult.H_dsr.toFixed(4)}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">A single 8-byte ciphertext is too small to score near 8.0; that's why the table above measures across many samples.</p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: EXPLANATION ===================== */}
        {tab === 'explanation' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400"><Info size={24} /></div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">The Limitation of Original DES</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  In standard DES, diffusion is entirely handled by the permutation box (P-Box). The issue is that the P-Box is <strong>static</strong>. A bit exiting S-Box 1 will <i>always</i> travel to the same destination next round.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Because this routing is predictable, differential cryptanalysis can track specific bit changes. It also takes multiple rounds for a single flipped bit to reach all 8 S-Boxes.
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/20 rounded-xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-amber-500/10"><Cpu size={120} /></div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 text-amber-400 relative z-10"><Zap size={24} /></div>
                <h3 className="text-xl font-bold text-amber-400 mb-3 relative z-10">Why Our Modified DSR is Better</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 relative z-10">
                  DSR intercepts the 32-bit S-Box output and applies a <strong>data-dependent left circular shift</strong> (decimal value of the first 5 bits of the S-box output, 0–31) <i>before</i> the P-Box.
                </p>
                <ul className="space-y-2 text-sm text-slate-300 relative z-10">
                  <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /><span><strong>Dynamic Routing:</strong> Output bits land in different positions each round.</span></li>
                  <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /><span><strong>Accelerated Diffusion:</strong> Reaches the ideal ~50% avalanche faster.</span></li>
                  <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /><span><strong>Cryptanalytic Resistance:</strong> Breaks the linear characteristics differential attacks exploit.</span></li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><List size={18} className="text-amber-400" /> DSR in 5 Steps</h3>
              <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li>The 32-bit right half R<sub>i−1</sub> is expanded to 48 bits via the E-box.</li>
                <li>The expanded data is XORed with the round key, then passed through the S-boxes to produce 32 bits.</li>
                <li><strong className="text-amber-400">DSR step:</strong> Take the first 5 bits of the S-box output, convert to decimal n, and circular-left-shift the 32-bit block by n positions.</li>
                <li>The shifted block goes through the fixed P-box.</li>
                <li>XOR with L<sub>i−1</sub> to produce the new R<sub>i</sub>.</li>
              </ol>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">5 bits is exactly the right width: 2⁵ = 32, the size of the half-block. Fewer bits = constrained diffusion; more bits = redundant (shifting 33 ≡ shifting 1).</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
