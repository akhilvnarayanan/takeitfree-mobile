import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface CategoryPillProps {
  name: string;
  isSelected?: boolean;
  onPress: () => void;
  size?: 'small' | 'large';
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Books: 'book-outline',
  Clothes: 'shirt-outline',
  Electronics: 'laptop-outline',
  Furniture: 'bed-outline',
  Toys: 'game-controller-outline',
  Kitchen: 'restaurant-outline',
  Sports: 'bicycle-outline',
  Other: 'cube-outline',
  All: 'grid-outline',
};

function getCategoryColor(category: string): string {
  const key = category.toLowerCase() as keyof typeof Colors.categories;
  return Colors.categories[key] || Colors.categories.other;
}

export default function CategoryPill({ name, isSelected, onPress, size = 'small' }: CategoryPillProps) {
  const color = getCategoryColor(name);
  const icon = categoryIcons[name] || 'cube-outline';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  if (size === 'large') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.largePill,
          { backgroundColor: isSelected ? color : color + '12', opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[styles.largeIconContainer, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : color + '20' }]}>
          <Ionicons name={icon} size={22} color={isSelected ? '#fff' : color} />
        </View>
        <Text style={[styles.largeName, { color: isSelected ? '#fff' : Colors.text }]}>{name}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: isSelected ? color : color + '10',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={isSelected ? '#fff' : color} />
      <Text style={[styles.pillText, { color: isSelected ? '#fff' : color }]}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  largePill: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 90,
  },
  largeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  largeName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
});
