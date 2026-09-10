import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

const PLAYLIST_COLORS = [
  COLORS.accentPrimary,
  COLORS.accentSecondary,
  COLORS.accentPink,
  COLORS.accentBlue,
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#6366F1'
];

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ visible, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYLIST_COLORS[0]);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), selectedColor);
      setName('');
      setSelectedColor(PLAYLIST_COLORS[0]);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedColor(PLAYLIST_COLORS[0]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Playlist</Text>

          <TextInput
            style={styles.input}
            placeholder="Playlist name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {PLAYLIST_COLORS.map(color => (
              <Pressable
                key={color}
                style={[styles.colorSwatch, { backgroundColor: color }]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]} 
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={[styles.createText, !name.trim() && styles.createTextDisabled]}>
                Create
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createBtnDisabled: {
    backgroundColor: COLORS.surfaceGlass,
  },
  createText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default CreatePlaylistModal;
