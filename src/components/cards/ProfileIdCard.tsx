import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { StatusChip } from './StatusChip';
import { Icon } from '@/components/icons';

export type ProfileIdCardStatus =
  | 'available'
  | 'unavailable'
  | 'review'
  | 'statusOn'
  | 'statusOff'
  | 'profileContact';

interface ProfileIdCardProps {
  name: string;
  status: ProfileIdCardStatus;
  photoUri?: string;
  time?: string; // "Before 10:30 AM" — used by available/unavailable/statusOn/statusOff
  dateRange?: string; // used by review, e.g. "Mar 10 - Apr 2, 2026"
  reviewChipLabel?: string; // e.g. "Good"
  subText?: string; // profileContact: e.g. "Son"
  subText2?: string; // profileContact: e.g. "+91 9876543210"
  showVerifiedChip?: boolean; // profileContact
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Profile ID Card" from Figma Card Views (node 103:288) — caretaker/patient list row,
// 6 status variants matching the design's `Show=` variant set.
export const ProfileIdCard: React.FC<ProfileIdCardProps> = ({
  name,
  status,
  photoUri,
  time,
  dateRange,
  reviewChipLabel = 'Good',
  subText,
  subText2,
  showVerifiedChip = true,
  onPress,
  style,
}) => {
  const Container = onPress ? Pressable : View;

  if (status === 'profileContact') {
    return (
      <Container
        onPress={onPress}
        style={[styles.card, { borderLeftColor: theme.colors.primary }, style]}
      >
        <View style={styles.textCol}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.subRow}>
            <Text style={styles.subText}>{subText}</Text>
            <Text style={[styles.subText, { color: theme.colors.forestGreen[600] }]}> · </Text>
            <Text style={styles.subText}>{subText2}</Text>
          </View>
        </View>
        {showVerifiedChip && (
          <StatusChip
            label="Verified"
            bgColor={theme.colors.background.layout}
            textColor={theme.colors.primary}
          />
        )}
      </Container>
    );
  }

  if (status === 'review') {
    return (
      <Container
        onPress={onPress}
        style={[styles.card, { borderLeftColor: theme.colors.tertiary }, style]}
      >
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
        <View style={styles.textCol}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subText}>{dateRange}</Text>
        </View>
        <StatusChip
          label={reviewChipLabel}
          bgColor={theme.colors.vividOrange[100]}
          textColor={theme.colors.vividOrange[800]}
        />
      </Container>
    );
  }

  if (status === 'statusOff') {
    return (
      <Container
        onPress={onPress}
        style={[styles.card, styles.fullBorder, { borderColor: theme.colors.forestGreen[100] }, style]}
      >
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
        <View style={[styles.textCol, { flex: 1 }]}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subText}>{time}</Text>
        </View>
      </Container>
    );
  }

  if (status === 'statusOn') {
    return (
      <Container
        onPress={onPress}
        style={[
          styles.card,
          styles.fullBorder,
          { borderColor: theme.colors.tertiary, backgroundColor: theme.colors.background.orange },
          style,
        ]}
      >
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
        <View style={[styles.textCol, { flex: 1 }]}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subText}>{time}</Text>
        </View>
        <View style={styles.checkbox}>
          <Icon name="check" size={14} color="#FFFFFF" />
        </View>
      </Container>
    );
  }

  // available / unavailable
  const isAvailable = status === 'available';
  return (
    <Container
      onPress={onPress}
      style={[
        styles.card,
        { borderLeftColor: isAvailable ? theme.colors.primary : theme.colors.tertiary },
        style,
      ]}
    >
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
      <View style={styles.textCol}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.subRow}>
          <Text style={styles.subText}>{isAvailable ? 'Available' : 'Unavailable'}</Text>
          <Text style={[styles.subText, { color: theme.colors.forestGreen[600] }]}> · </Text>
          <Text style={styles.subText}>{time}</Text>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.base,
    borderLeftWidth: 4,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  fullBorder: {
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  photo: {
    width: 46,
    height: 46,
    borderRadius: 200,
  },
  textCol: {
    gap: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
  },
  subText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
