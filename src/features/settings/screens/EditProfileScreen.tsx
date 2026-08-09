import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Screen, Header, Spacer } from '@/components/layouts';
import { TextInput } from '@/components/inputs';
import { PrimaryButton } from '@/components/buttons';
import { Icon } from '@/components/icons';
import { digitsOnly } from '@/utils/validation';
import { useUserStore } from '@/store/user.store';
import { userService, careProfileService, getErrorMessage, type CareProfile } from '@/api';

const CountryCodePrefix = () => (
  <View style={styles.countryCodeContainer}>
    <Text style={styles.countryCodeText}>(+91)</Text>
    <Svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={styles.chevron}>
      <Path
        d="M1 1L5 5L9 1"
        stroke={theme.colors.neutral[700]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    <View style={styles.countryCodeDivider} />
  </View>
);

// "Edit Profile" (Figma "Account Profile", node 1432:39176) — reads the signed-in user
// (name/phone from the auth store, email display-only since there's no change-email
// endpoint) plus the care profile's avatar. Saving calls the real PATCH /users/me.
// The photo picker is real (permission-gated camera/gallery) but only previews locally —
// there's no avatar-upload endpoint yet to get a hosted URL from.
export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const [careProfile, setCareProfile] = useState<CareProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    careProfileService.getCareProfile().then(setCareProfile).catch(() => {});
  }, []);

  useEffect(() => {
    const [first, ...rest] = (profile?.name ?? '').trim().split(' ');
    setFirstName(first ?? '');
    setLastName(rest.join(' '));
    setMobile((profile?.phone ?? '').replace(/^\+91/, ''));
  }, [profile?.name, profile?.phone]);

  const isValid = firstName.trim().length > 0 && mobile.length === 10;

  const applyPickedImage = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      applyPickedImage(result);
    } catch {
      Alert.alert('Something went wrong', 'Could not open your photo gallery. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera access needed',
        'Allow ServeSaathi to use your camera in Settings to update your photo.'
      );
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      applyPickedImage(result);
    } catch {
      Alert.alert('Something went wrong', 'Could not open the camera. Please try again.');
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Profile photo', 'How would you like to update your photo?', [
      { text: 'Take a photo', onPress: takePhoto },
      { text: 'Choose from gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      const user = await userService.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `+91${mobile}`,
      });
      updateProfile({
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: user.phone ?? `+91${mobile}`,
      });
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const avatarSource = photoUri
    ? { uri: photoUri }
    : careProfile?.avatarUrl
    ? { uri: careProfile.avatarUrl }
    : theme.images.onboarding1;

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Edit Profile" leftIcon="back" transparent />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarGroup}>
          <Pressable onPress={handlePickPhoto} style={styles.avatarWrap}>
            <Image source={avatarSource} style={styles.avatar} />
            <View style={styles.editBadge}>
              <Icon name="edit" variant="outline" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Pressable onPress={handlePickPhoto} hitSlop={8}>
            <Text style={styles.editPhotoText}>Edit your photo</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <TextInput
            label="First Name"
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            label="Last Name"
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            label="Email address"
            value={profile?.email ?? ''}
            editable={false}
          />
          <TextInput
            label="Mobile Phone Number"
            placeholder="000-000-0000"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(v) => setMobile(digitsOnly(v).slice(0, 10))}
            prefixIcon={<CountryCodePrefix />}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <PrimaryButton label="Confirm" onPress={handleSave} disabled={!isValid} loading={saving} />
        <Spacer size="giant" />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120, // clear the floating bottom tab bar
  },
  avatarGroup: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatarWrap: {
    width: 167,
    height: 167,
  },
  avatar: {
    width: 167,
    height: 167,
    borderRadius: 84,
  },
  editBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  editPhotoText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(14),
    color: theme.colors.primary,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing.xxxl,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: theme.spacing.md,
  },
  countryCodeText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[900],
  },
  chevron: {
    marginLeft: 6,
  },
  countryCodeDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: theme.colors.forestGreen[100],
    position: 'absolute',
    right: 0,
  },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});

export default EditProfileScreen;
