import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';

interface ActionCardProps {
  title: string;
  description?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  onPress,
  style,
  titleStyle,
  icon,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed, style]}
    >
      <View style={styles.actionRow}>
        {icon && <View style={styles.actionIconContainer}>{icon}</View>}
        <View style={styles.actionBody}>
          <Text style={[styles.actionTitle, titleStyle]}>{title}</Text>
          {description && <Text style={styles.actionDesc}>{description}</Text>}
        </View>
        <View style={styles.chevronContainer}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18l6-6-6-6"
              stroke={theme.colors.neutral[500]}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionIconContainer: {
    marginRight: theme.spacing.md,
    width: scale(36),
    height: scale(36),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.forestGreen[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBody: { flex: 1 },
  actionTitle: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
    fontWeight: 'bold',
  },
  actionDesc: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
  chevronContainer: { marginLeft: theme.spacing.sm },
  pressed: { opacity: 0.7 },
});
