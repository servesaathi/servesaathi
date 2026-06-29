import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { scale, responsiveFontSize } from '@/utils/responsive';

interface ToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ visible, message, onDismiss }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onDismiss(), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: scale(60),
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  toast: {
    backgroundColor: 'rgba(31, 25, 24, 0.9)',
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  toastText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
