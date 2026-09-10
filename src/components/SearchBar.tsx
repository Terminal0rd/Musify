import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';
import { COLORS } from '../utils/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search songs, artists, albums...',
  onFocus,
  onBlur
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusBorder = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusBorder.value = withTiming(1, { duration: 200 });
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusBorder.value = withTiming(0, { duration: 200 });
    onBlur?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: focusBorder.value === 1 ? COLORS.accentPrimary : 'transparent',
    borderWidth: 1,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? COLORS.accentPrimary : COLORS.textMuted} 
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginLeft: 12,
  },
  clearBtn: {
    padding: 4,
  },
});

export default SearchBar;
