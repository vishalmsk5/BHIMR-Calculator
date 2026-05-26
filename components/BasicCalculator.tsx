import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { evaluate } from 'mathjs';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useBasicHistoryStore } from '../store/useCalculatorStore';
import { t, toLocalNumber, fromLocalNumber, usesLocalNumbers } from '../constants/translations';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 48) / 4;
const BUTTON_H = 56;

interface CalculatorProps {
  onResult?: (result: string) => void;
}

export const BasicCalculator: React.FC<CalculatorProps> = ({ onResult }) => {
  const { theme } = useThemeStore();
  const { hapticEnabled } = useSettingsStore();
  const { language } = useLanguageStore();
  const { history, addHistory, loadHistory, clearHistory } = useBasicHistoryStore();

  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>(''); // always Arabic internally
  const [resultShown, setResultShown] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<string>('');

  const OPERATORS = ['+', '-', '×', '÷', '%'];
  const MATH_OPS = ['+', '-', '*', '/'];
  const useLocal = usesLocalNumbers(language);

  useEffect(() => { loadHistory(); }, []);

  // Convert button label digit to local if needed
  const localDigit = (d: string): string => {
    if (!useLocal) return d;
    if (/^\d$/.test(d)) return toLocalNumber(d, language);
    return d;
  };

  // Display value in local script
  const localDisplay = (val: string): string => {
    if (!useLocal) return val;
    return toLocalNumber(val, language);
  };

  const toMathOp = (op: string): string => {
    if (op === '×') return '*';
    if (op === '÷') return '/';
    return op;
  };

  const formatResult = (val: number): string => {
    if (!isFinite(val)) return t('error', language);
    return parseFloat(val.toPrecision(12)).toString();
  };

  const safeEvaluate = (expr: string): string => {
    // Convert back from local numbers if needed
    const arabicExpr = fromLocalNumber(expr, language);
    const mathExpr = arabicExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '');
    const result = evaluate(mathExpr);
    if (typeof result === 'number') return formatResult(result);
    return result.toString();
  };

  const handlePress = (value: string) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value === 'C') {
      setDisplay('0'); setExpression(''); setResultShown(false); setLastResult('');
      return;
    }

    if (value === '⌫') {
      if (expression.length <= 1) { setDisplay('0'); setExpression(''); }
      else { const n = expression.slice(0, -1); setExpression(n); setDisplay(n); }
      setResultShown(false); return;
    }

    if (OPERATORS.includes(value)) {
      const mathOp = toMathOp(value);
      const lastChar = expression.slice(-1);
      const isLastOp = MATH_OPS.includes(lastChar) || ['×', '÷', '%'].includes(lastChar);
      if (isLastOp) {
        const n = expression.slice(0, -1) + mathOp;
        setExpression(n); setDisplay(n);
      } else {
        const base = resultShown ? (lastResult || expression) : (expression || display || '0');
        const n = base + mathOp;
        setExpression(n); setDisplay(n);
      }
      setResultShown(false); return;
    }

    if (value === '=') {
      if (!expression) return;
      try {
        const saved = expression;
        const resultStr = safeEvaluate(expression);
        setDisplay(resultStr); setExpression(resultStr);
        setLastResult(resultStr); setResultShown(true);
        addHistory(saved, resultStr);
        if (onResult) onResult(resultStr);
      } catch {
        setDisplay(t('error', language)); setExpression(''); setResultShown(false);
      }
      return;
    }

    if (value === '+/-') {
      try {
        const cur = parseFloat(fromLocalNumber(display, language)) || 0;
        const toggled = (cur * -1).toString();
        setDisplay(toggled); setExpression(toggled);
      } catch { setDisplay('0'); }
      return;
    }

    if (value === '.') {
      const parts = expression.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) return;
      const n = (expression || '0') + '.';
      setExpression(n); setDisplay(n); return;
    }

    if (resultShown) {
      setExpression(value); setDisplay(value); setResultShown(false); return;
    }

    const n = expression === '0' || expression === '' ? value : expression + value;
    setExpression(n); setDisplay(n);
  };

  const getDisplayText = (): string => {
    if (!expression) return localDigit('0');
    if (resultShown) return localDisplay(display);
    const parts = expression.split(/(?<=[+\-*/])/);
    const last = parts[parts.length - 1];
    const raw = (last && !isNaN(parseFloat(last))) ? last : display || '0';
    return localDisplay(raw);
  };

  const formatTime = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Button rows - digits shown in local script
  const getButtons = (): string[][] => [
    ['C', '⌫', '%', '÷'],
    [localDigit('7'), localDigit('8'), localDigit('9'), '×'],
    [localDigit('4'), localDigit('5'), localDigit('6'), '-'],
    [localDigit('1'), localDigit('2'), localDigit('3'), '+'],
    ['+/-', localDigit('0'), '.', '='],
  ];

  // But we need to map local digit back to Arabic for handlePress
  const handleButtonPress = (btn: string) => {
    // If it's a local digit, convert back to Arabic for internal logic
    if (useLocal) {
      const arabicBtn = fromLocalNumber(btn, language);
      if (/^\d$/.test(arabicBtn) && arabicBtn !== btn) {
        handlePress(arabicBtn);
        return;
      }
    }
    handlePress(btn);
  };

  const getButtonColors = (btn: string): { bg: string; text: string } => {
    if (btn === '=') return { bg: theme.primary, text: '#FFFFFF' };
    if (['+', '-', '×', '÷'].includes(btn)) return { bg: theme.surface, text: theme.primary };
    if (btn === '%') return { bg: theme.surface, text: theme.primary };
    return { bg: theme.surface, text: theme.text };
  };

  const buttons = getButtons();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={[styles.displayContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.historyBtn} onPress={() => setShowHistory(true)}>
          <Ionicons name="time-outline" size={20} color={theme.primary} />
          <Text style={[styles.historyBtnText, { color: theme.primary }]}>
            {t('history', language)} ({history.length})
          </Text>
        </TouchableOpacity>
        <Text style={[styles.expression, { color: theme.textSecondary }]} numberOfLines={1}>
          {localDisplay(expression)}
        </Text>
       <Text selectable={true} style={[styles.display, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {getDisplayText()}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn, btnIndex) => {
              const colors = getButtonColors(btn);
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${btnIndex}`}
                  style={[styles.button, { backgroundColor: colors.bg, borderColor: theme.border }]}
                  onPress={() => handleButtonPress(btn)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>{btn}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} transparent animationType="slide"
        onRequestClose={() => setShowHistory(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('history', language)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={{ color: theme.accent, fontWeight: '600' }}>
                      {t('clearAll', language)}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={26} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calculator-outline" size={44} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {t('noHistory', language)}{'\n'}{t('startCalculating', language)}
                </Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {history.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.historyItem, { backgroundColor: theme.background }]}
                    onPress={() => {
                      setDisplay(item.result); setExpression(item.result);
                      setLastResult(item.result); setResultShown(true);
                      setShowHistory(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historyExpression, { color: theme.textSecondary }]}>
                        {localDisplay(item.expression)}
                      </Text>
                      <Text style={[styles.historyResult, { color: theme.text }]}>
                        = {localDisplay(item.result)}
                      </Text>
                    </View>
                    <Text style={[styles.historyTime, { color: theme.textSecondary }]}>
                      {formatTime(item.timestamp)}
                    </Text>
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
  displayContainer: {
    padding: 14, borderRadius: 14, marginBottom: 10, minHeight: 110, justifyContent: 'flex-end',
  },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginBottom: 6 },
  historyBtnText: { fontSize: 13, fontWeight: '600' },
  expression: { fontSize: 14, marginBottom: 4, textAlign: 'right' },
  display: { fontSize: 44, fontWeight: 'bold', textAlign: 'right' },
  buttonsContainer: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  button: {
    width: BUTTON_SIZE - 2, height: BUTTON_H, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 0.5,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  buttonText: { fontSize: 22, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '70%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 12, marginBottom: 8,
  },
  historyExpression: { fontSize: 13, marginBottom: 2 },
  historyResult: { fontSize: 20, fontWeight: 'bold' },
  historyTime: { fontSize: 12, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});