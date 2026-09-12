import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Icon } from '@/components/icons';
import { useThemeColors } from '@/hooks/useThemeColors';

export interface CompareItem {
  id: string;
  name: string;
  /** Remote URL, or a `require()`'d local asset for orgs with no photo of their own. */
  photoUri: string | number;
}

interface CompareBarProps {
  items: CompareItem[];
  maxItems?: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onRemoveItem: (id: string) => void;
  onAddPress: () => void;
  onComparePress: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Compare Pop up Expand / Mobile" from Figma Pop up (node 206:5905) — a bottom drawer
// for building a comparison set (used with ComparePopUpCard, e.g. comparing organizations
// or caregivers), holding up to `maxItems` slots plus empty "add" placeholders.
export const CompareBar: React.FC<CompareBarProps> = ({
  items,
  maxItems = 3,
  expanded,
  onToggleExpand,
  onRemoveItem,
  onAddPress,
  onComparePress,
  style,
}) => {
  const colors = useThemeColors();
  const emptySlots = Math.max(0, maxItems - items.length);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }, style]}>
      <Pressable onPress={onToggleExpand} style={[styles.toggle, { backgroundColor: colors.background.orange }]}>
        <Icon name={expanded ? 'caretUp' : 'caretDown'} variant="outline" size={16} color={colors.accentOrange} />
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: colors.text.secondary }]}>Add more items</Text>
        <Pressable onPress={onComparePress} style={[styles.compareButton, { backgroundColor: colors.secondarySurface }]}>
          <Text style={[styles.compareButtonText, { color: colors.textInverse }]}>Compare</Text>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.slotsRow}>
          {items.map((item) => (
            <View key={item.id} style={styles.filledSlot}>
              <Image
                source={typeof item.photoUri === 'string' ? { uri: item.photoUri } : item.photoUri}
                style={styles.photo}
              />
              <Text style={[styles.name, { color: colors.text.secondary }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Pressable
                onPress={() => onRemoveItem(item.id)}
                style={[styles.closeBadge, { backgroundColor: colors.accentPrimary }]}
              >
                <Icon name="close" variant="outline" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <Pressable
              key={`empty-${i}`}
              onPress={onAddPress}
              style={[styles.emptySlot, { borderColor: colors.border.card }]}
            >
              <Icon name="add" variant="outline" size={24} color={colors.text.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.base,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.xxl,
  },
  toggle: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    width: 56,
    height: 24,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.vividOrange[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xxxl,
  },
  headerText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  compareButton: {
    // minHeight, not height: the label scales with the accessibility
    // font-size setting and must be able to grow the button, not overflow it.
    minHeight: 32,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.forestGreen[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButtonText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(14),
    color: '#FFFFFF',
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  filledSlot: {
    width: 100,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.sm,
  },
  name: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  closeBadge: {
    position: 'absolute',
    top: -10,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlot: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.neutral[200],
    backgroundColor: 'rgba(210,209,209,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
