import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

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

  // Edit note - start editing
  const startEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  // Save edited note
  const saveEdit = async () => {
    if (!editingText.trim()) return;
    const updated = notes.map(n =>
      n.id === editingId
        ? { ...n, text: editingText.trim(), timestamp: Date.now() }
        : n
    );
    setNotes(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
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

  // Copy note text to clipboard
  const copyNote = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('✅ Copied!', 'Text copied. You can paste it anywhere.');
  };

  // Paste from clipboard into new note input
  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setNewNote(prev => prev + text);
      } else {
        Alert.alert('Nothing to paste', 'Clipboard is empty.');
      }
    } catch {
      Alert.alert('Error', 'Could not access clipboard.');
    }
  };

  // Download notes as .txt file
  const downloadNotes = async () => {
    if (notes.length === 0) {
      Alert.alert('No Notes', 'Add some calculation notes first!');
      return;
    }
    try {
      const header = `BHIMR UNIVERSAL CALCULATOR\nCalculation Notes\nDownloaded: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
      const body = notes.map((n, i) =>
        `[${i + 1}] ${new Date(n.timestamp).toLocaleString()}\n${n.text}\n${'-'.repeat(40)}`
      ).join('\n\n');
      const content = header + body;

      const fileUri = `${(FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || ''}BHIMR_Calculation_Notes.txt`;
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (Sharing) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Download Calculation Notes',
          UTI: 'public.plain-text',
        });
      } else {
        Alert.alert('Downloaded', `File saved: BHIMR_Calculation_Notes.txt`);
      }
    } catch (e) {
      Alert.alert('Download Failed', 'Could not download notes.');
    }
  };

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const previewNote = notes[0]?.text?.slice(0, 60) || 'Tap to add calculation notes...';

  return (
    <>
      {/* COMPACT CARD (always visible on home) */}
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
          <Text style={styles.cardPreview} numberOfLines={1}>{previewNote}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{notesCount}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#0D47A1" />
        </View>
      </TouchableOpacity>

      {/* NOTES MODAL */}
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
                <Ionicons name="download-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              {notes.length > 0 && (
                <TouchableOpacity onPress={clearAll}>
                  <Ionicons name="trash-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ padding: 16 }}>

            {/* Input area */}
            <View style={[styles.inputCard, { backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Base: 50,000 | Wastage: 4,000 | Final: 54,000"
                placeholderTextColor={theme.textSecondary}
                value={newNote}
                onChangeText={setNewNote}
                multiline
                numberOfLines={3}
              />

              {/* Paste button */}
              <TouchableOpacity
                style={[styles.pasteBtn, { borderColor: theme.primary }]}
                onPress={pasteFromClipboard}
              >
                <Ionicons name="clipboard-outline" size={16} color={theme.primary} />
                <Text style={[styles.pasteBtnText, { color: theme.primary }]}>Paste from clipboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={saveNote}
              >
                <Ionicons name="save-outline" size={18} color="#FFF" />
                <Text style={styles.saveBtnText}>SAVE TO NOTES</Text>
              </TouchableOpacity>
            </View>

            {/* Download button */}
            <TouchableOpacity
              style={[styles.downloadBtn, { borderColor: theme.primary }]}
              onPress={downloadNotes}
            >
              <Ionicons name="download-outline" size={18} color={theme.primary} />
              <Text style={[styles.downloadBtnText, { color: theme.primary }]}>DOWNLOAD NOTEBOOK (.TXT)</Text>
            </TouchableOpacity>

            {/* Notes count */}
            <Text style={[styles.notesCount, { color: theme.textSecondary }]}>
              {notes.length} saved notes
            </Text>

            {/* Notes list */}
            {notes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No notes yet. Add your first calculation note!
                </Text>
              </View>
            ) : (
              notes.map((note, index) => (
                <View
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: theme.surface }]}
                >
                  {editingId === note.id ? (
                    // EDIT MODE
                    <View>
                      <TextInput
                        style={[styles.editInput, { color: theme.text, borderColor: theme.primary }]}
                        value={editingText}
                        onChangeText={setEditingText}
                        multiline
                        autoFocus
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={[styles.editSaveBtn, { backgroundColor: theme.primary }]}
                          onPress={saveEdit}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFF" />
                          <Text style={styles.editSaveBtnText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editCancelBtn, { borderColor: theme.border }]}
                          onPress={cancelEdit}
                        >
                          <Ionicons name="close" size={16} color={theme.text} />
                          <Text style={[styles.editCancelBtnText, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // VIEW MODE
                    <>
                      <View style={styles.noteHeader}>
                        <View style={[styles.noteNumber, { backgroundColor: theme.primary }]}>
                          <Text style={styles.noteNumberText}>
                            {String(index + 1).padStart(2, '0')}
                          </Text>
                        </View>
                        <Text style={[styles.noteTime, { color: theme.textSecondary }]}>
                          {fmtTime(note.timestamp)}
                        </Text>
                        <TouchableOpacity onPress={() => deleteNote(note.id)} style={styles.deleteBtn}>
                          <Ionicons name="close-circle" size={22} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.noteText, { color: theme.text }]}>{note.text}</Text>

                      {/* Action buttons */}
                      <View style={styles.noteActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: theme.border }]}
                          onPress={() => startEdit(note)}
                        >
                          <Ionicons name="pencil-outline" size={14} color={theme.primary} />
                          <Text style={[styles.actionBtnText, { color: theme.primary }]}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: theme.border }]}
                          onPress={() => copyNote(note.text)}
                        >
                          <Ionicons name="copy-outline" size={14} color={theme.primary} />
                          <Text style={[styles.actionBtnText, { color: theme.primary }]}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Compact card
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  cardLeft: { marginRight: 12 },
  cardMiddle: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0D47A1' },
  cardPreview: { fontSize: 12, color: '#757575', marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countBadge: {
    backgroundColor: '#0D47A1', borderRadius: 12,
    minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  countText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 48,
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', flex: 1, marginLeft: 12 },
  modalBody: { flex: 1 },

  // Input
  inputCard: { borderRadius: 14, padding: 14, marginBottom: 12 },
  textInput: {
    borderWidth: 1, borderRadius: 10, padding: 12,
    fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 10,
  },
  pasteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 10,
    alignSelf: 'flex-start',
  },
  pasteBtnText: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 12,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  // Download button
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 16,
  },
  downloadBtnText: { fontWeight: '700', fontSize: 14 },

  // Notes list
  notesCount: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center' },

  // Note card
  noteCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  noteNumber: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  noteNumberText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  noteTime: { flex: 1, fontSize: 12 },
  deleteBtn: { padding: 2 },
  noteText: { fontSize: 14, lineHeight: 20, marginBottom: 10 },

  // Note actions
  noteActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  // Edit mode
  editInput: {
    borderWidth: 1.5, borderRadius: 10, padding: 12,
    fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 10,
  },
  editButtons: { flexDirection: 'row', gap: 8 },
  editSaveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    padding: 10, borderRadius: 8, flex: 1, justifyContent: 'center',
  },
  editSaveBtnText: { color: '#FFF', fontWeight: '700' },
  editCancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    padding: 10, borderRadius: 8, borderWidth: 1, flex: 1, justifyContent: 'center',
  },
  editCancelBtnText: { fontWeight: '600' },
});