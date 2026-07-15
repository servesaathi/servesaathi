import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, SelectableChip } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidName, isValidDateOfBirth } from '@/utils/validation';

// "Profile Creation 1a/1b" (Figma 1248:44068 / 1248:44150) — step 1 of 6.
const GENDERS = ['Female', 'Male', 'Non-binary'];
const LIVING_SITUATIONS = ['Alone', 'Partner', 'Family', 'Caregiver'];
const DEPENDENCY_LEVELS = ['Independent', 'Fully', 'Semi-Dependent'];

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

  const isNameValid = isValidName(preferredName);
  const isDobComplete = dobDay.length > 0 && dobMonth.length > 0 && dobYear.length === 4;
  const isDobValid = isValidDateOfBirth(dobDay, dobMonth, dobYear);
  const isFormValid = isNameValid && isDobValid;

  const nameError =
    nameTouched && preferredName.length > 0 && !isNameValid ? 'Enter a valid name' : undefined;
  const dobError =
    isDobComplete && !isDobValid ? 'Enter a valid date of birth (DD/MM/YYYY)' : undefined;

  const handleContinue = () => {
    if (!isFormValid) return;
    navigation.navigate('ProfileAddress');
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
          <View style={styles.photoCircle}>
            <ImagePlaceholderIcon size={40} color={theme.colors.primary} />
            <Pressable style={styles.editBadge} accessibilityLabel="Edit your photo">
              <Icon name="edit" variant="outline" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
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
          <TextInput
            placeholder="DD"
            keyboardType="number-pad"
            maxLength={2}
            value={dobDay}
            onChangeText={(v) => setDobDay(digitsOnly(v).slice(0, 2))}
            containerStyle={styles.dobField}
          />
          <TextInput
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
            value={dobMonth}
            onChangeText={(v) => setDobMonth(digitsOnly(v).slice(0, 2))}
            containerStyle={styles.dobField}
          />
          <TextInput
            placeholder="YYYY"
            keyboardType="number-pad"
            maxLength={4}
            value={dobYear}
            onChangeText={(v) => setDobYear(digitsOnly(v).slice(0, 4))}
            containerStyle={styles.dobField}
          />
        </View>
        {dobError && <Text style={styles.errorText}>{dobError}</Text>}

        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.chipGrid}>
          {GENDERS.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={gender === item}
              onPress={() => setGender(item)}
              style={item === 'Non-binary' ? styles.chipFull : styles.chipHalf}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Living Situation</Text>
        <View style={styles.chipGrid}>
          {LIVING_SITUATIONS.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={living === item}
              onPress={() => setLiving(item)}
              style={styles.chipHalf}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Dependency Levels</Text>
        <View style={styles.chipGrid}>
          {DEPENDENCY_LEVELS.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={dependency === item}
              onPress={() => setDependency(item)}
              style={styles.chipFull}
            />
          ))}
        </View>

        <Spacer size="xl" />
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!isFormValid} />
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xl,
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
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    marginTop: -theme.spacing.xs,
  },
  dobField: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm, // Figma: 8 between chips
    marginBottom: theme.spacing.md,
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
