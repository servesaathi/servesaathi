import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Icon } from '@/components/icons';

interface ProfileImageCardProps {
  photoUri?: string;
  size?: number;
  editLabel?: string;
  onEditPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Profile Image Card" from Figma Card Views (node 103:288) — circular profile photo
// with an edit badge, used on profile/onboarding screens.
export const ProfileImageCard: React.FC<ProfileImageCardProps> = ({
  photoUri,
  size = 167,
  editLabel = 'Edit your photo',
  onEditPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onEditPress}
      disabled={!onEditPress}
      style={[styles.container, { width: size }, style]}
      accessibilityRole={onEditPress ? 'button' : undefined}
      accessibilityLabel={onEditPress ? 'Upload profile photo' : undefined}
    >
      <View style={{ width: size, height: size }}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={[styles.image, { borderRadius: size / 2 }]} />
        ) : (
          <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
            <Icon name="camera" variant="outline" size={40} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.editBadge}> 
          <Icon name="edit" variant="outline" size={16} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.editLabel}>{editLabel}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.forestGreen[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editLabel: {
    fontFamily: theme.typography.smallCaption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    color: theme.colors.primary,
  },
});
