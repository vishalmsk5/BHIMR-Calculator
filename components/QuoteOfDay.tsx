import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useThemeStore } from '../store/useThemeStore';

let Sharing: any;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  Sharing = null;
}

const STORAGE_KEY = '@bhim_calculation_notes';

interface NoteItem {
  id: string;
  text: string;
  timestamp: number;
}

export const CalculationNotes: React.FC = () => {
  const { theme } = useThemeStore();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: NoteItem[] = JSON.parse(stored);
        setNotes(parsed);
        setNotesCount(parsed.length);
      }
    } catch {}
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;
    const item: NoteItem = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: Date.now(),
    };
    const updated = [item, ...notes];
    setNotes(updated);
    setNotesCount(updated.length);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewNote('');
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    setNotesCount(updated.length);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = async () => {
    Alert.alert('Clear All Notes', 'Delete all calculation notes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive',
        onPress: async () => {
          setNotes([]); setNotesCount(0);
          await AsyncStorage.removeItem(STORAGE_KEY);
        },
      },
    ]);
  };

  const downloadNotes = async () => {
    if (notes.length === 0) {
      Alert.alert('No Notes', 'Add some calculation notes first!');
      return;
    }
    try {
      const header = `BHIM UNIVERSAL CALCULATOR\nCalculation Notes\nExported: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
      const body = notes.map((n, i) =>
        `[${i + 1}] ${new Date(n.timestamp).toLocaleString()}\n${n.text}\n${'-'.repeat(40)}`
      ).join('\n\n');
      const content = header + body;
      // ...existing code...
// Some versions of expo-file-system export documentDirectory instead of cacheDirectory
// Use whichever is available to construct the file URI (fallback to documentDirectory).
const fileUri = `${(FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || ''}Bhim_Calculation_Notes.txt`;
// ...existing code...
      await FileSystem.writeAsStringAsync(fileUri, content);
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export notes.');
    }
  };

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const previewNote = notes[0]?.text?.slice(0, 60) || 'Tap to add calculation notes...';

  return (
    <>
      {/* ── COMPACT CARD (always visible on home) ── */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#BBDEFB' }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.cardLeft}>
          <Ionicons name="document-text" size={22} color="#0D47A1" />
        </View>
        <View style={styles.cardMiddle}>
          <Text style={styles.cardTitle}>📝 My Calculation Notes</Text>
          <Text style={styles.cardPreview} numberOfLines={1}>
            {previewNote}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{notesCount}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#0D47A1" />
        </View>
      </TouchableOpacity>

      {/* ── FULL NOTES MODAL ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>

          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.primary }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>📝 Calculation Notes</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={downloadNotes}>
                <Ionicons name="download-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              {notes.length > 0 && (
                <TouchableOpacity onPress={clearAll}>
                  <Ionicons name="trash-outline" size={22} color="#FFB3B3" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Input area */}
          <View style={[styles.inputBlock, { backgroundColor: theme.surface }]}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              ← Calculation Engine Matrix
            </Text>
            <View style={[styles.inputRow, { borderColor: theme.border }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="e.g. Base: 50,000 | Wastage: 4,000 | Final: 54,000"
                placeholderTextColor={theme.textSecondary}
                value={newNote}
                onChangeText={setNewNote}
                multiline
                numberOfLines={3}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={saveNote}
              disabled={!newNote.trim()}
            >
              <Ionicons name="save-outline" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>📥 SAVE TO NOTES</Text>
            </TouchableOpacity>
          </View>

          {/* Export button */}
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={downloadNotes}
          >
            <Ionicons name="cloud-download-outline" size={18} color={theme.primary} />
            <Text style={[styles.exportBtnText, { color: theme.primary }]}>
              💾 EXPORT NOTEBOOK (.TXT)
            </Text>
          </TouchableOpacity>

          {/* Notes list */}
          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={56} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notes Yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Save your calculation results here for quick reference
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.notesList}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.listHeader, { color: theme.textSecondary }]}>
                {notes.length} saved note{notes.length !== 1 ? 's' : ''}
              </Text>
              {notes.map((note, index) => (
                <View
                  key={note.id}
                  style={[styles.noteItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  {/* Note header */}
                  <View style={styles.noteItemHeader}>
                    <View style={[styles.noteIndexBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.noteIndexText}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>
                    <Text style={[styles.noteTime, { color: theme.textSecondary }]}>
                      {fmtTime(note.timestamp)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteNote(note.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {/* Note content */}
                  <Text style={[styles.noteText, { color: theme.text }]}>
                    {note.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Compact card
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14, marginVertical: 10,
    borderWidth: 1.5,
    shadowColor: '#0D47A1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  cardLeft: { width: 36, alignItems: 'center' },
  cardMiddle: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#0D47A1', marginBottom: 2 },
  cardPreview: { fontSize: 12, color: '#555', lineHeight: 16 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countBadge: {
    backgroundColor: '#0D47A1', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  countText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 54 : 14,
  },
  modalHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', flex: 1, textAlign: 'center' },

  // Input block
  inputBlock: { margin: 12, padding: 14, borderRadius: 14 },
  inputLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  inputRow: { borderWidth: 1, borderRadius: 10, marginBottom: 10, overflow: 'hidden' },
  textInput: { padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 12, borderRadius: 10,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Export
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 12, padding: 11, borderRadius: 10,
    borderWidth: 1, marginBottom: 10,
  },
  exportBtnText: { fontWeight: '700', fontSize: 13 },

  // List
  notesList: { flex: 1, paddingHorizontal: 12 },
  listHeader: { fontSize: 12, fontWeight: '600', marginBottom: 10, marginTop: 4 },
  noteItem: {
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, elevation: 1,
  },
  noteItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noteIndexBadge: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
  },
  noteIndexText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  noteTime: { flex: 1, fontSize: 11 },
  deleteBtn: { padding: 2 },
  noteText: { fontSize: 14, lineHeight: 21 },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});

export { CalculationNotes as QuoteOfDay };
