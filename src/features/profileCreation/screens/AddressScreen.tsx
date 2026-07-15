import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, Checkbox } from '@/components/inputs';
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

        <Pressable style={styles.checkRow} onPress={() => setDetectLocation((v) => !v)}>
          <Checkbox
            checked={detectLocation}
            onPress={() => setDetectLocation((v) => !v)}
            color="orange"
          />
          <Text style={styles.checkText}>Enable access to detect where you are.</Text>
        </Pressable>

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
});

export default AddressScreen;
