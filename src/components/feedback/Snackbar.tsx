import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable, Animated } from 'react-native';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  duration = 3000,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      const timer = setTimeout(() => handleDismiss(), duration);
      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  let bg = theme.colors.neutral[900];
  if (type === 'success') bg = theme.colors.status.success;
  if (type === 'error') bg = theme.colors.status.error;

  return (
    <Animated.View style={[styles.snackbar, { backgroundColor: bg, opacity: fadeAnim }]}>
      <Text style={styles.snackbarText}>{message}</Text>
      <Pressable onPress={handleDismiss} style={styles.dismissBtn}>
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: scale(30),
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  snackbarText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: '#FFFFFF',
    flex: 1,
  },
  dismissBtn: { paddingLeft: theme.spacing.md },
  dismissText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: responsiveFontSize(16) },
});
