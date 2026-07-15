import React from 'react';
import { StyleSheet, Text, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';

interface SegmentedTabsProps {
  options: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  variant?: 'filled' | 'plain';
  badge?: { index: number; label: string };
  style?: StyleProp<ViewStyle>;
}

// "Switch Label" from Figma Tabs (node 2019:10526) — a segmented tab switcher, 2 styles:
// `filled` ("Style=Tabs": orange track, white active pill, works for 2 or 3 segments) and
// `plain` ("Style=Without Tab": underlined text switcher with dividers, used e.g. above a
// list for "Filter by / Sort by"). Figma only showed a single "Default" state for `plain`
// with no distinct active treatment, so the active color/weight below is a reasonable
// inferred addition, not a literal Figma spec.
export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  options,
  activeIndex,
  onChange,
  variant = 'filled',
  badge,
  style,
}) => {
  if (variant === 'plain') {
    return (
      <View style={[styles.plainContainer, style]}>
        {options.map((label, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={label}
              onPress={() => onChange(index)}
              style={[styles.plainSegment, index > 0 && styles.plainDivider]}
            >
              <Text style={[styles.plainLabel, isActive && styles.plainLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.filledContainer, style]}>
      {options.map((label, index) => {
        const isActive = index === activeIndex;
        return (
          <View key={label} style={styles.filledSegmentWrapper}>
            <Pressable
              onPress={() => onChange(index)}
              style={[styles.filledSegment, isActive && styles.filledSegmentActive]}
            >
              <Text style={[styles.filledLabel, isActive && styles.filledLabelActive]}>{label}</Text>
            </Pressable>
            {badge?.index === index && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  filledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.tertiary,
  },
  filledSegmentWrapper: {
    flex: 1,
  },
  filledSegment: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  filledLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  filledLabelActive: {
    color: theme.colors.tertiary,
  },
  badge: {
    position: 'absolute',
    top: -18,
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    color: '#FFFFFF',
  },
  plainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(88,151,91,0.3)',
    padding: theme.spacing.sm,
  },
  plainSegment: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plainDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(88,151,91,0.3)',
  },
  plainLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[900],
    textTransform: 'uppercase',
  },
  plainLabelActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semiBold,
  },
});
