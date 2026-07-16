import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, Checkbox } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidName } from '@/utils/validation';

// "Payment method" / "Payment 1a" (Figma 1248:44424 / 1248:44451).
const PAYMENT_METHODS = [
  { id: 'card', title: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, Amex' },
  { id: 'paytm', title: 'Paytm', subtitle: 'Pay with your Paytm account' },
  { id: 'wallet', title: 'Apple Pay / Google Pay', subtitle: 'Fast & secure digital wallet' },
];

const formatCardNumber = (value: string): string =>
  digitsOnly(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const isValidExpiry = (value: string): boolean => {
  const m = value.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(m[2]);
  const now = new Date();
  // Card is valid through the end of its expiry month
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
};

export const PaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'PaymentMethod'>>();
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const isCardNumberComplete = digitsOnly(cardNumber).length === 16;
  const cardNumberError =
    isCardNumberComplete || cardNumber.length === 0 ? undefined
      : digitsOnly(cardNumber).length < 16 && cardNumber.length >= 19
      ? 'Enter a valid 16-digit card number'
      : undefined;
  const expiryError =
    expiry.length === 5 && !isValidExpiry(expiry) ? 'Enter a valid expiry (MM/YY)' : undefined;

  const isCardFormValid =
    isCardNumberComplete &&
    isValidName(cardholderName) &&
    isValidExpiry(expiry) &&
    cvv.length === 3;
  // Card details are only required for the card method
  const canConfirm = method === 'card' ? isCardFormValid : true;

  const handleConfirm = () => {
    if (!canConfirm) return;
    navigation.navigate('SettingUp');
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Payment method" leftIcon="back" transparent />

      <View style={styles.content}>
        <Spacer size="md" />
        <Text style={styles.sectionLabel}>Select Payment</Text>
        <View style={styles.methods}>
          {PAYMENT_METHODS.map((item) => {
            const selected = method === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setMethod(item.id)}
                style={[styles.methodCard, selected ? styles.methodSelected : styles.methodUnselected]}
              >
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>{item.title}</Text>
                  <Text style={styles.methodSubtitle}>{item.subtitle}</Text>
                </View>
                <Checkbox checked={selected} color="orange" onPress={() => setMethod(item.id)} />
              </Pressable>
            );
          })}
        </View>

        {method === 'card' && (
          <>
            <Spacer size="xl" />
            <TextInput
              label="Card number"
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              maxLength={19}
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              error={cardNumberError}
            />
            <TextInput
              label="Cardholder name"
              placeholder="First name & Last name"
              autoCapitalize="words"
              value={cardholderName}
              onChangeText={setCardholderName}
            />
            <View style={styles.row}>
              <TextInput
                label="Expiry Date"
                placeholder="MM/YY"
                keyboardType="number-pad"
                maxLength={5}
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                error={expiryError}
                containerStyle={styles.rowField}
              />
              <TextInput
                label="CVV"
                placeholder="***"
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
                value={cvv}
                onChangeText={(v) => setCvv(digitsOnly(v).slice(0, 3))}
                containerStyle={styles.rowField}
              />
            </View>

            <Pressable style={styles.checkRow} onPress={() => setSaveCard((v) => !v)}>
              <Checkbox checked={saveCard} onPress={() => setSaveCard((v) => !v)} color="orange" />
              <Text style={styles.checkText}>This card will be saved to your account.</Text>
            </Pressable>
          </>
        )}

        <View style={styles.footer}>
          <PrimaryButton label="Confirm" onPress={handleConfirm} disabled={!canConfirm} />
        </View>
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  methods: {
    gap: theme.spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
  },
  methodSelected: {
    backgroundColor: theme.colors.background.orange,
    borderColor: theme.colors.tertiary,
  },
  methodUnselected: {
    backgroundColor: theme.colors.background.base,
    borderColor: theme.colors.border.green,
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
  },
  methodSubtitle: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[500],
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  rowField: {
    flex: 1, // Figma: Expiry Date and CVV are equal widths
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  checkText: {
    flex: 1,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[900],
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.xxl,
  },
});

export default PaymentMethodScreen;
