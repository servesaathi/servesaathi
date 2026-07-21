import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, Checkbox } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidPinCode } from '@/utils/validation';

// "Profile Creation 2a/2b" (Figma 1248:44227 / 1248:44255) — step 2 of 6.
export const AddressScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileAddress'>>();
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [detectLocation, setDetectLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const isPinValid = isValidPinCode(pinCode);
  const pinError =
    pinCode.length === 6 && !isPinValid ? 'Enter a valid 6-digit PIN code' : undefined;
  // Landmark is optional; everything else is required
  const isFormValid =
    houseNo.trim().length > 0 &&
    street.trim().length > 0 &&
    area.trim().length > 0 &&
    city.trim().length > 0 &&
    state.trim().length > 0 &&
    isPinValid;

  const handleContinue = () => {
    if (!isFormValid) return;
    navigation.navigate('ProfileHealth');
  };

  const handleDetectLocationPress = () => {
    if (detectLocation) {
      setDetectLocation(false);
      return;
    }
    setShowLocationPrompt(true);
  };

  const handleLocationChoice = (allow: boolean) => {
    setDetectLocation(allow);
    setShowLocationPrompt(false);
  };

  const Chevron = () => (
    <Svg width="14" height="8" viewBox="0 0 14 8" fill="none">
      <Path
        d="M1 1L7 7L13 1"
        stroke={theme.colors.neutral[700]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent stepper={{ current: 2, total: 6 }} />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title}>Enter your residential address</Text>
        <Spacer size="xl" />

        <TextInput
          label="House / Flat No"
          placeholder="Apartment, building, or house no."
          value={houseNo}
          onChangeText={setHouseNo}
        />
        <TextInput
          label="Street / Road"
          placeholder="Street name or road name"
          value={street}
          onChangeText={setStreet}
        />
        <TextInput
          label="Area / Locality"
          placeholder="Neighborhood, colony or locality"
          value={area}
          onChangeText={setArea}
        />
        <TextInput
          label="City"
          placeholder="City or Town"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          label="State"
          placeholder="Select your state"
          value={state}
          onChangeText={setState}
          suffixIcon={<Chevron />}
        />
        <TextInput
          label="PIN Code"
          placeholder="6–digit postal code"
          keyboardType="number-pad"
          maxLength={6}
          value={pinCode}
          onChangeText={(v) => setPinCode(digitsOnly(v).slice(0, 6))}
          error={pinError}
        />
        <TextInput
          label="Landmark"
          placeholder="Near school, mall, etc"
          value={landmark}
          onChangeText={setLandmark}
        />

        <Pressable style={styles.checkRow} onPress={handleDetectLocationPress}>
          <Checkbox
            checked={detectLocation}
            onPress={handleDetectLocationPress}
            color="orange"
          />
          <Text style={styles.checkText}>Enable access to detect where you are.</Text>
        </Pressable>

        <Spacer size="xl" />
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!isFormValid} />
        <Spacer size="xl" />
      </View>

      <Modal
        visible={showLocationPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationPrompt(false)}
      >
        <View style={styles.promptOverlay}>
          <View style={styles.promptCard}>
            <Icon name="location" variant="filled" size={28} color={theme.colors.tertiary} />
            <Spacer size="xl" />
            <Text style={styles.promptTitle}>
              <Text style={styles.promptTitleRegular}>Allow </Text>
              <Text style={styles.promptTitleBold}>ServeSaathi</Text>
              <Text style={styles.promptTitleRegular}>
                {' '}
                to access this device’s precise location?
              </Text>
            </Text>
            <Spacer size="xl" />
            <View style={styles.promptButtons}>
              <Pressable
                style={[styles.promptButton, styles.promptButtonTop]}
                onPress={() => handleLocationChoice(true)}
              >
                <Text style={styles.promptButtonText}>While using the app</Text>
              </Pressable>
              <Pressable
                style={styles.promptButton}
                onPress={() => handleLocationChoice(true)}
              >
                <Text style={styles.promptButtonText}>Only this time</Text>
              </Pressable>
              <Pressable
                style={[styles.promptButton, styles.promptButtonBottom]}
                onPress={() => handleLocationChoice(false)}
              >
                <Text style={styles.promptButtonText}>Don’t allow</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  checkText: {
    flex: 1,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[900],
  },
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  promptCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 26,
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.background.base,
  },
  promptTitle: {
    textAlign: 'center',
    fontSize: responsiveFontSize(18),
    lineHeight: responsiveFontSize(18) * 1.3,
  },
  promptTitleRegular: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.neutral[900],
  },
  promptTitleBold: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.neutral[900],
  },
  promptButtons: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  promptButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.forestGreen[100],
    borderTopLeftRadius: theme.radius.xs,
    borderTopRightRadius: theme.radius.xs,
    borderBottomLeftRadius: theme.radius.xs,
    borderBottomRightRadius: theme.radius.xs,
  },
  promptButtonTop: {
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
  },
  promptButtonBottom: {
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
  },
  promptButtonText: {
    fontFamily: theme.fonts.regular,
    fontSize: responsiveFontSize(13),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
});

export default AddressScreen;
