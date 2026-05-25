import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { evaluate, factorial, log, log10, sqrt, sin, cos, tan, asin, acos, atan, pi, e } from 'mathjs';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useScientificHistoryStore } from '../store/useCalculatorStore';

const { width } = Dimensions.get('window');
const BTN_W = (width - 32) / 5;
const BTN_H = 48;

interface Props {
  onResult?: (result: string) => void;
}

export const ScientificCalculator: React.FC<Props> = ({ onResult }) => {
  const { theme } = useThemeStore();
  const { hapticEnabled } = useSettingsStore();
  const { history, addHistory, loadHistory, clearHistory } = useScientificHistoryStore();

  const [expr, setExpr] = useState('');
  const [displayExpr, setDisplayExpr] = useState('');
  const [result, setResult] = useState('0');
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [shiftOn, setShiftOn] = useState(false);
  const [resultShown, setResultShown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [openBrackets, setOpenBrackets] = useState(0);

  useEffect(() => { loadHistory(); }, []);

  const fmt = (val: number): string => {
    if (!isFinite(val)) return 'Math Error';
    if (Number.isNaN(val)) return 'Math Error';
    if (Math.abs(val) > 1e10 || (Math.abs(val) < 1e-7 && val !== 0)) {
      return val.toExponential(6);
    }
    return parseFloat(val.toPrecision(10)).toString();
  };

  const tap = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const press = (btn: string) => {
    tap();

    if (btn === 'SHIFT') { setShiftOn(s => !s); return; }

    if (btn === 'MODE') {
      setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG');
      setShiftOn(false);
      return;
    }

    if (btn === 'AC') {
      setExpr(''); setDisplayExpr(''); setResult('0');
      setResultShown(false); setOpenBrackets(0); setShiftOn(false);
      return;
    }

    if (btn === 'DEL') {
      if (resultShown) {
        setExpr(''); setDisplayExpr(''); setResult('0');
        setResultShown(false); setOpenBrackets(0);
      } else {
        const newExpr = expr.slice(0, -1);
        const newDisp = displayExpr.slice(0, -1);
        setExpr(newExpr); setDisplayExpr(newDisp);
        const opens = (newExpr.match(/\(/g) || []).length;
        const closes = (newExpr.match(/\)/g) || []).length;
        setOpenBrackets(Math.max(0, opens - closes));
      }
      setShiftOn(false);
      return;
    }

    if (btn === 'RCL') {
      const memStr = fmt(memory);
      appendToExpr(memStr, memStr);
      setShiftOn(false);
      return;
    }
    if (btn === 'M+') {
      try { const cur = parseFloat(result) || 0; setMemory(m => m + cur); } catch {}
      setShiftOn(false); return;
    }
    if (btn === 'M-') {
      try { const cur = parseFloat(result) || 0; setMemory(m => m - cur); } catch {}
      setShiftOn(false); return;
    }

    if (btn === '=') {
      if (!expr && !displayExpr) return;
      try {
        let evalExpr = expr + ')'.repeat(openBrackets);
        const val = evaluate(evalExpr);
        const res = fmt(typeof val === 'number' ? val : Number(val));
        const savedExpr = displayExpr + ')'.repeat(openBrackets);
        setResult(res);
        setDisplayExpr(savedExpr);
        setExpr(res);
        setResultShown(true);
        setOpenBrackets(0);
        setShiftOn(false);
        addHistory(savedExpr, res);
        if (onResult) onResult(res);
      } catch {
        setResult('Math Error');
        setExpr(''); setDisplayExpr(''); setOpenBrackets(0);
        setResultShown(false);
      }
      return;
    }

    if (resultShown) {
      const isOp = ['+', '-', '×', '÷', '^'].includes(btn);
      if (!isOp) {
        setExpr(''); setDisplayExpr(''); setResult('0');
        setResultShown(false); setOpenBrackets(0);
      }
    }

    const funcMap: Record<string, { math: string; disp: string }> = {
      'sin':   { math: angleMode === 'DEG' ? 'sin(pi/180*' : 'sin(',   disp: 'sin(' },
      'cos':   { math: angleMode === 'DEG' ? 'cos(pi/180*' : 'cos(',   disp: 'cos(' },
      'tan':   { math: angleMode === 'DEG' ? 'tan(pi/180*' : 'tan(',   disp: 'tan(' },
      'sin⁻¹': { math: angleMode === 'DEG' ? '(180/pi)*asin(' : 'asin(', disp: 'sin⁻¹(' },
      'cos⁻¹': { math: angleMode === 'DEG' ? '(180/pi)*acos(' : 'acos(', disp: 'cos⁻¹(' },
      'tan⁻¹': { math: angleMode === 'DEG' ? '(180/pi)*atan(' : 'atan(', disp: 'tan⁻¹(' },
      'log':   { math: 'log10(',  disp: 'log(' },
      'ln':    { math: 'log(',    disp: 'ln(' },
      '√':     { math: 'sqrt(',   disp: '√(' },
    };

    if (btn in funcMap) {
      const { math: mathFn, disp: dispFn } = funcMap[btn];
      appendToExpr(mathFn, dispFn, true);
      setShiftOn(false);
      return;
    }

    if (btn === 'x²') { appendToExpr('^2', '²'); setShiftOn(false); return; }
    if (btn === 'x³') { appendToExpr('^3', '³'); setShiftOn(false); return; }
    if (btn === 'xʸ') { appendToExpr('^', '^'); setShiftOn(false); return; }
    if (btn === '10ˣ') { appendToExpr('10^(', '10^(', true); setShiftOn(false); return; }
    if (btn === 'eˣ') { appendToExpr('e^(', 'e^(', true); setShiftOn(false); return; }

    if (btn === 'x⁻¹') {
      if (expr) appendToExpr('^(-1)', '⁻¹');
      setShiftOn(false); return;
    }

    if (btn === 'n!') {
      try {
        let cur = 0;
        if (resultShown) {
          cur = parseFloat(result) || 0;
        } else {
          const match = expr.match(/(-?\d+\.?\d*)$/);
          cur = match ? parseFloat(match[0]) : parseFloat(result) || 0;
        }
        if (!isNaN(cur) && cur >= 0) {
          const res = fmt(factorial(Math.floor(cur)) as number);
          const match = expr.match(/(-?\d+\.?\d*)$/);
          const newExpr = match ? expr.slice(0, expr.lastIndexOf(match[0])) + res : res;
          const newDisp = match ? displayExpr.slice(0, displayExpr.lastIndexOf(match[0])) + res : res;
          setExpr(newExpr); setDisplayExpr(newDisp);
          setResult(res); setResultShown(true);
          addHistory(cur + '!', res);
          if (onResult) onResult(res);
        }
      } catch { setResult('Math Error'); }
      setShiftOn(false); return;
    }

    if (btn === 'nCr') { appendToExpr(' nCr ', ' C '); setShiftOn(false); return; }
    if (btn === 'nPr') { appendToExpr(' nPr ', ' P '); setShiftOn(false); return; }
    if (btn === 'π') { appendToExpr(pi.toString(), 'π'); setShiftOn(false); return; }
    if (btn === 'e') { appendToExpr(e.toString(), 'e'); setShiftOn(false); return; }

    if (btn === '(') { appendToExpr('(', '(', true); setShiftOn(false); return; }
    if (btn === ')') {
      if (openBrackets > 0) { appendToExpr(')', ')'); setOpenBrackets(o => o - 1); }
      setShiftOn(false); return;
    }

    if (btn === '%') { appendToExpr('/100', '%'); setShiftOn(false); return; }

    if (btn === '+/-') {
      if (expr === '' || expr === '0') {
        appendToExpr('(-', '(-', true);
      } else {
        const lastNum = expr.match(/(-?\d+\.?\d*)$/);
        if (lastNum) {
          const num = parseFloat(lastNum[0]);
          const toggled = (num * -1).toString();
          const newExpr = expr.slice(0, expr.lastIndexOf(lastNum[0])) + toggled;
          const newDisp = displayExpr.slice(0, displayExpr.lastIndexOf(lastNum[0])) + toggled;
          setExpr(newExpr); setDisplayExpr(newDisp);
        }
      }
      setShiftOn(false); return;
    }

    const opMap: Record<string, string> = { '×': '*', '÷': '/' };
    if (['+', '-', '×', '÷', '^'].includes(btn)) {
      const mathOp = opMap[btn] || btn;
      const lastChar = expr.slice(-1);
      if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        setExpr(expr.slice(0, -1) + mathOp);
        setDisplayExpr(displayExpr.slice(0, -1) + btn);
      } else {
        appendToExpr(mathOp, btn);
      }
      setResultShown(false); setShiftOn(false); return;
    }

    if (btn === '.') {
      const parts = expr.split(/[+\-*/^(]/);
      const last = parts[parts.length - 1];
      if (!last.includes('.')) appendToExpr('.', '.');
      setShiftOn(false); return;
    }

    if (/^\d$/.test(btn)) { appendToExpr(btn, btn); setShiftOn(false); return; }
    if (btn === 'EXP') { appendToExpr('e', '×10^'); setShiftOn(false); return; }
    if (btn === 'Ans') { appendToExpr(result, 'Ans'); setShiftOn(false); return; }
  };

  const appendToExpr = (mathStr: string, dispStr: string, addsBracket = false) => {
    setExpr(e => e + mathStr);
    setDisplayExpr(d => d + dispStr);
    if (addsBracket) setOpenBrackets(o => o + 1);
    setResultShown(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  type BtnDef = { label: string; sub?: string };

  const getRows = (): BtnDef[][] => [
    [
      { label: 'SHIFT' },
      { label: 'MODE', sub: angleMode },
      { label: shiftOn ? 'sin⁻¹' : 'sin',  sub: shiftOn ? 'sin' : 'sin⁻¹' },
      { label: shiftOn ? 'cos⁻¹' : 'cos',  sub: shiftOn ? 'cos' : 'cos⁻¹' },
      { label: shiftOn ? 'tan⁻¹' : 'tan',  sub: shiftOn ? 'tan' : 'tan⁻¹' },
    ],
    [
      { label: shiftOn ? '10ˣ' : 'log', sub: shiftOn ? 'log' : '10ˣ' },
      { label: shiftOn ? 'eˣ'  : 'ln',  sub: shiftOn ? 'ln'  : 'eˣ'  },
      { label: shiftOn ? 'x⁻¹' : 'x²',  sub: shiftOn ? 'x²'  : 'x⁻¹' },
      { label: shiftOn ? 'x³'  : '√',   sub: shiftOn ? '√'   : 'x³'  },
      { label: 'xʸ' },
    ],
    [
      { label: shiftOn ? 'nPr' : 'nCr', sub: shiftOn ? 'nCr' : 'nPr' },
      { label: shiftOn ? 'e'   : 'π',   sub: shiftOn ? 'π'   : 'e'   },
      { label: '(' },
      { label: ')' },
      { label: '%' },
    ],
    [
      { label: shiftOn ? 'M-'  : 'M+',  sub: shiftOn ? 'M+' : 'M-'  },
      { label: 'RCL' },
      { label: '+/-' },
      { label: shiftOn ? 'n!'  : 'EXP', sub: shiftOn ? 'EXP': 'n!'  },
      { label: 'Ans' },
    ],
    [
      { label: '7' }, { label: '8' }, { label: '9' },
      { label: 'DEL' }, { label: 'AC' },
    ],
    [
      { label: '4' }, { label: '5' }, { label: '6' },
      { label: '×' }, { label: '÷' },
    ],
    [
      { label: '1' }, { label: '2' }, { label: '3' },
      { label: '+' }, { label: '-' },
    ],
    [
      { label: '0' }, { label: '.' },
      { label: 'x³' },
      { label: 'M-' },
      { label: '=' },
    ],
  ];

  const rows = getRows();

  // ── FIXED COLORS - All use theme colors, no hardcoded yellow/red/blue ──
  const getBtnColor = (label: string): { bg: string; fg: string } => {
    // SHIFT button - uses accent color (matches theme)
    if (label === 'SHIFT') return {
      bg: shiftOn ? theme.primary : theme.accent,
      fg: '#FFFFFF'
    };

    // Equals button - primary color
    if (label === '=') return { bg: theme.primary, fg: '#FFFFFF' };

    // Clear/Delete buttons - use a muted error-like tone from theme
    if (label === 'AC' || label === 'DEL') return {
      bg: theme.border,      // uses theme border (subtle, not jarring red)
      fg: theme.text
    };

    // Arithmetic operators - accent color
    if (['+', '-', '×', '÷', '^', 'xʸ'].includes(label)) return {
      bg: theme.accent,
      fg: '#FFFFFF'
    };

    // Percent - accent
    if (label === '%') return { bg: theme.accent, fg: '#FFFFFF' };

    // Scientific functions - primary color (matches theme)
    if ([
      'sin', 'cos', 'tan', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹',
      'log', 'ln', '10ˣ', 'eˣ', 'x²', 'x³', 'x⁻¹', '√',
      'π', 'e', 'n!', 'nCr', 'nPr', 'EXP', 'Ans', 'RCL', 'M+', 'M-',
      '(', ')', 'MODE'
    ].includes(label)) {
      return { bg: theme.primary, fg: '#FFFFFF' };
    }

    // Number buttons and others - surface
    return { bg: theme.surface, fg: theme.text };
  };

  const displayText = resultShown ? result : (displayExpr || '0');
  const showSmallExpr = resultShown && displayExpr;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Display */}
      <View style={[styles.display, { backgroundColor: theme.surface }]}>
        <View style={styles.displayTopRow}>
          <Text style={[styles.modeText, { color: theme.textSecondary }]}>
            {angleMode}  {memory !== 0 ? `M:${fmt(memory)}` : ''}
          </Text>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.histBtn}>
            <Ionicons name="time-outline" size={16} color={theme.primary} />
            <Text style={[styles.histBtnText, { color: theme.primary }]}>({history.length})</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.smallExpr, { color: theme.textSecondary }]} numberOfLines={1}>
          {showSmallExpr ? displayExpr : (!resultShown ? displayExpr : '')}
        </Text>

        <Text style={[styles.mainDisplay, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {displayText}
        </Text>

        {openBrackets > 0 && (
          <Text style={[styles.bracketHint, { color: theme.accent }]}>
            {openBrackets} bracket{openBrackets > 1 ? 's' : ''} open
          </Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.btnContainer}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn, bi) => {
              const colors = getBtnColor(btn.label);
              const isShiftBtn = btn.label === 'SHIFT';
              return (
                <TouchableOpacity
                  key={bi}
                  style={[
                    styles.btn,
                    {
                      backgroundColor: colors.bg,
                      borderColor: theme.border,
                      // SHIFT active state - slightly different shade
                      ...(isShiftBtn && shiftOn ? { opacity: 0.85 } : {}),
                    },
                  ]}
                  onPress={() => press(btn.label)}
                  activeOpacity={0.7}
                >
                  {btn.sub ? (
                    <Text style={[styles.btnSub, { color: theme.textSecondary }]}>{btn.sub}</Text>
                  ) : null}
                  <Text
                    style={[
                      styles.btnLabel,
                      { color: colors.fg, fontSize: btn.label.length > 3 ? 11 : 15 },
                    ]}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} transparent animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Scientific History</Text>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={{ color: theme.accent, fontWeight: '600' }}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            {history.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calculator-outline" size={40} color={theme.textSecondary} />
                <Text style={{ color: theme.textSecondary, marginTop: 8 }}>No history yet</Text>
              </View>
            ) : (
              <ScrollView>
                {history.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.histItem, { backgroundColor: theme.background }]}
                    onPress={() => {
                      setExpr(item.result); setDisplayExpr(item.result);
                      setResult(item.result); setResultShown(true);
                      setShowHistory(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: theme.textSecondary }}>{item.expression}</Text>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>= {item.result}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: theme.textSecondary }}>{formatTime(item.timestamp)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  display: { borderRadius: 12, padding: 12, marginBottom: 8, minHeight: 110, justifyContent: 'flex-end' },
  displayTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  modeText: { fontSize: 11 },
  histBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  histBtnText: { fontSize: 11, fontWeight: '600' },
  smallExpr: { fontSize: 12, textAlign: 'right', marginBottom: 2 },
  mainDisplay: { fontSize: 36, fontWeight: 'bold', textAlign: 'right' },
  bracketHint: { fontSize: 10, textAlign: 'right', marginTop: 2 },
  btnContainer: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  btn: {
    width: BTN_W - 2, height: BTN_H, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', borderWidth: 0.5,
  },
  btnSub: { fontSize: 8, position: 'absolute', top: 3, left: 0, right: 0, textAlign: 'center' },
  btnLabel: { fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '65%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  histItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 6 },
  empty: { alignItems: 'center', paddingVertical: 32 },
});
