import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, Modal, ScrollView, Alert } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, SelectableChip } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidName, isValidDateOfBirth } from '@/utils/validation';
import { masterdataService, careProfileService, getErrorMessage, type MasterDataOption } from '@/api';

// "Profile Creation 1a/1b" (Figma 1248:44068 / 1248:44150) — step 1 of 6.

// Image-placeholder glyph from the Figma photo circle (rounded frame, sun dot, mountains)
const ImagePlaceholderIcon = ({ size = 40, color = '' }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Rect x="5" y="5" width="30" height="30" rx="6" stroke={color} strokeWidth="2.5" />
    <Circle cx="15" cy="15" r="2.6" fill={color} />
    <Path
      d="M9 30l7.5-8.5a2 2 0 013 0L23 26l3.5-3.8a2 2 0 012.9 0L34 27"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileSetup'>>();
  const [preferredName, setPreferredName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [living, setLiving] = useState<string | null>(null);
  const [dependency, setDependency] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [genders, setGenders] = useState<MasterDataOption[]>([]);
  const [livingSituations, setLivingSituations] = useState<MasterDataOption[]>([]);
  const [dependencyLevels, setDependencyLevels] = useState<MasterDataOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [activeDobField, setActiveDobField] = useState<'day' | 'month' | 'year' | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isNameValid = isValidName(preferredName);
  const isDobComplete = dobDay.length > 0 && dobMonth.length > 0 && dobYear.length === 4;
  const isDobValid = isValidDateOfBirth(dobDay, dobMonth, dobYear);
  const isFormValid = isNameValid && isDobValid;

  const nameError =
    nameTouched && preferredName.length > 0 && !isNameValid ? 'Enter a valid name' : undefined;
  const dobError =
    isDobComplete && !isDobValid ? 'Enter a valid date of birth (DD/MM/YYYY)' : undefined;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setOptionsError(null);
        const [genderOptions, livingOptions, dependencyOptions] = await Promise.all([
          masterdataService.getGenders(),
          masterdataService.getLivingSituations(),
          masterdataService.getDependencyLevels(),
        ]);
        setGenders(genderOptions);
        setLivingSituations(livingOptions);
        setDependencyLevels(dependencyOptions);
      } catch (err) {
        setOptionsError('Unable to load profile options right now.');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleContinue = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Step 1 of the care profile: PATCH /care-profiles/me with the
      // numeric master-data ids (gender/living/dependency chips store option ids).
      await careProfileService.updateCareProfile({
        preferredName,
        dateOfBirth: `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`,
        ...(gender ? { genderId: Number(gender) } : {}),
        ...(living ? { livingSituationId: Number(living) } : {}),
        ...(dependency ? { dependencyLevelId: Number(dependency) } : {}),
      });
      navigation.navigate('ProfileAddress');
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const applyPickedImage = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    try {
      // The system photo picker needs no permission on iOS (PHPicker) or
      // Android 13+ — gating it behind requestMediaLibraryPermissionsAsync
      // was what kept the gallery from ever opening.
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
        'Allow ServeSaathi to use your camera in Settings to take a profile picture.'
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
    Alert.alert('Profile photo', 'How would you like to add your photo?', [
      { text: 'Take a photo', onPress: takePhoto },
      { text: 'Choose from gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const today = new Date().getFullYear();
  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1).padStart(2, '0'), label: String(index + 1).padStart(2, '0') })),
    []
  );
  const monthOptions = useMemo(
    () => [
      { value: '01', label: 'Jan' },
      { value: '02', label: 'Feb' },
      { value: '03', label: 'Mar' },
      { value: '04', label: 'Apr' },
      { value: '05', label: 'May' },
      { value: '06', label: 'Jun' },
      { value: '07', label: 'Jul' },
      { value: '08', label: 'Aug' },
      { value: '09', label: 'Sep' },
      { value: '10', label: 'Oct' },
      { value: '11', label: 'Nov' },
      { value: '12', label: 'Dec' },
    ],
    []
  );
  const yearOptions = useMemo(
    () => Array.from({ length: today - 1899 }, (_, index) => {
      const year = today - index;
      return { value: String(year), label: String(year) };
    }),
    [today]
  );

  const displayValue = (field: 'day' | 'month' | 'year') => {
    if (field === 'day') return dobDay || 'DD';
    if (field === 'month') return dobMonth ? monthOptions.find((item) => item.value === dobMonth)?.label ?? dobMonth : 'MM';
    return dobYear || 'YYYY';
  };

  const currentOptions =
    activeDobField === 'day'
      ? dayOptions
      : activeDobField === 'month'
      ? monthOptions
      : activeDobField === 'year'
      ? yearOptions
      : [];

  const handleSelectDobValue = (value: string) => {
    if (activeDobField === 'day') setDobDay(value);
    if (activeDobField === 'month') setDobMonth(value);
    if (activeDobField === 'year') setDobYear(value);
    setActiveDobField(null);
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent stepper={{ current: 1, total: 6 }} />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title}>Hello! Let’s set up your profile</Text>
        <Spacer size="xxxl" />

        {/* Profile photo picker */}
        <View style={styles.photoSection}>
          <Pressable
            style={styles.photoCircle}
            onPress={handlePickPhoto}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
            ) : (
              <ImagePlaceholderIcon size={40} color={theme.colors.primary} />
            )}
            <View style={styles.editBadge}>
              <Icon name="edit" variant="outline" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <Spacer size="sm" />
          <Text style={styles.editPhotoText}>Edit your photo</Text>
        </View>

        <Spacer size="lg" />

        <TextInput
          label="Preferred Name"
          placeholder="Enter your call name"
          value={preferredName}
          onChangeText={setPreferredName}
          onBlur={() => setNameTouched(true)}
          error={nameError}
        />

        <Text style={styles.sectionLabel}>Date of Birth</Text>
        <View style={styles.dobRow}>
          <View style={styles.dobField}>
            <TextInput
              placeholder="DD"
              value={dobDay}
              onChangeText={(v) => setDobDay(digitsOnly(v).slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              inputContainerStyle={styles.dobInputContainer}
              inputStyle={styles.dobInputText}
              suffixIcon={
                <Pressable onPress={() => setActiveDobField('day')} style={{ padding: 6 }}>
                  <Icon name="caretDown" variant="outline" size={14} color={theme.colors.neutral[700]} />
                </Pressable>
              }
            />
          </View>
          <View style={styles.dobField}>
            <TextInput
              placeholder="MM"
              value={dobMonth}
              onChangeText={(v) => setDobMonth(digitsOnly(v).slice(0, 2))}
              keyboardType="number-pad"
              maxLength={2}
              inputContainerStyle={styles.dobInputContainer}
              inputStyle={styles.dobInputText}
              suffixIcon={
                <Pressable onPress={() => setActiveDobField('month')} style={{ padding: 6 }}>
                  <Icon name="caretDown" variant="outline" size={14} color={theme.colors.neutral[700]} />
                </Pressable>
              }
            />
          </View>
          <View style={styles.dobField}>
            <TextInput
              placeholder="YYYY"
              value={dobYear}
              onChangeText={(v) => setDobYear(digitsOnly(v).slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              inputContainerStyle={styles.dobInputContainer}
              inputStyle={styles.dobInputText}
              suffixIcon={
                <Pressable onPress={() => setActiveDobField('year')} style={{ padding: 6 }}>
                  <Icon name="caretDown" variant="outline" size={14} color={theme.colors.neutral[700]} />
                </Pressable>
              }
            />
          </View>
        </View>
        {dobError && <Text style={styles.errorText}>{dobError}</Text>}

        <Modal visible={!!activeDobField} transparent animationType="slide" onRequestClose={() => setActiveDobField(null)}>
          <View style={styles.modalRoot}>
            <View style={[styles.modalSheet, { paddingTop: theme.spacing.xl }]}> 
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {activeDobField === 'day' ? 'Day' : activeDobField === 'month' ? 'Month' : 'Year'}
                </Text>
                <Pressable onPress={() => setActiveDobField(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </Pressable>
              </View>
              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {currentOptions.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelectDobValue(item.value)}
                    style={styles.modalItem}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Text style={styles.sectionLabel}>Gender</Text>
        {isLoadingOptions ? (
          <Text style={styles.helperText}>Loading options…</Text>
        ) : optionsError ? (
          <Text style={styles.helperText}>{optionsError}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {genders.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={gender === item.id}
                onPress={() => setGender(item.id)}
                style={item.label === 'Non-binary' ? styles.chipFull : styles.chipHalf}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Living Situation</Text>
        {isLoadingOptions ? (
          <Text style={styles.helperText}>Loading options…</Text>
        ) : optionsError ? (
          <Text style={styles.helperText}>{optionsError}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {livingSituations.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={living === item.id}
                onPress={() => setLiving(item.id)}
                style={styles.chipHalf}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Dependency Levels</Text>
        {isLoadingOptions ? (
          <Text style={styles.helperText}>Loading options…</Text>
        ) : optionsError ? (
          <Text style={styles.helperText}>{optionsError}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {dependencyLevels.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={dependency === item.id}
                onPress={() => setDependency(item.id)}
                style={styles.chipFull}
              />
            ))}
          </View>
        )}

        <Spacer size="xl" />
        {submitError && <Text style={styles.errorText}>{submitError}</Text>}
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!isFormValid}
          loading={submitting}
        />
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
  },
  photoCircle: {
    width: 167, // Figma: 167×167 Profile Image Card
    height: 167,
    borderRadius: 84,
    backgroundColor: theme.colors.forestGreen[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 84,
  },
  editBadge: {
    // Figma: 24px badge sitting on the circle's lower-right edge
    position: 'absolute',
    bottom: 12,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.primary,
  },
  // Figma rhythm: 16px between blocks (TextInput carries 12 built-in), 8px label→content
  sectionLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  dobRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm, // Figma: 8 between the three equal fields
  },
  dobField: {
    flex: 1,
  },
  dobInputContainer: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.input,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  dobInputText: {
    textAlign: 'center',
  },
  dobTransparent: {
    borderColor: 'transparent',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    marginTop: -theme.spacing.xs,
  },
  helperText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm, // Figma: 8 between chips
    marginBottom: theme.spacing.md,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.background.base,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '65%',
    paddingHorizontal: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  modalCloseButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  modalCloseText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.primary,
  },
  modalList: {
    marginBottom: theme.spacing.lg,
  },
  modalItem: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  modalItemText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
  },
  chipHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  chipFull: {
    width: '100%',
  },
});

export default ProfileSetupScreen;
