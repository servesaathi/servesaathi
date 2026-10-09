import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Checkbox } from '@/components/inputs';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { EwsSheet } from './EwsSheet';
import { ewsText } from './text';

// DPDP Act 2023 consent as a layered notice (website ConsentNotice): one
// compact tick line; the full notice (itemised data, purpose, rights,
// grievance route) opens in a pop-up. Ticking *opens the notice first* —
// consent is only set by "I agree" in it, so nobody consents without the
// notice in front of them. Un-ticking is immediate (withdrawal must be as easy
// as giving consent). Never pre-ticked; forms block submit until it is.

export const GRIEVANCE_EMAIL = 'support@servesaathi.com';

type ConsentTickProps = {
  /** Itemised personal data this form collects. */
  dataItems: string[];
  /** Completes "We use it to …". */
  purpose: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export const ConsentTick: React.FC<ConsentTickProps> = ({ dataItems, purpose, checked, onChange, error }) => {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const toggle = () => (checked ? onChange(false) : setOpen(true));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Checkbox checked={checked} color="orange" onPress={toggle} style={styles.box} />
        <View style={styles.texts}>
          <Text
            onPress={toggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityHint={checked ? 'Untick to withdraw consent.' : 'Opens the privacy notice so you can read it and confirm.'}
            style={[ewsText.bodyMd, { color: colors.text.primary }]}
          >
            I agree to ServeSaathi’s Terms and Privacy Notice, and consent to my details being used for this purpose.
          </Text>
          <Pressable onPress={() => setOpen(true)} accessibilityRole="link" hitSlop={8}>
            <Text style={[ewsText.bodyMd, styles.link, { color: colors.accentPrimary }]}>Read how we use your details</Text>
          </Pressable>
        </View>
      </View>
      {error && <Text style={[ewsText.small, styles.error, { color: colors.error }]}>{error}</Text>}

      <EwsSheet visible={open} title="How we use your details" onClose={() => setOpen(false)}>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>Please read this before you agree.</Text>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>
          <Text style={{ color: colors.text.primary, fontFamily: theme.fonts.semiBold }}>We collect: </Text>
          {dataItems.join(', ')}.
        </Text>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>
          <Text style={{ color: colors.text.primary, fontFamily: theme.fonts.semiBold }}>We use it to </Text>
          {purpose}
        </Text>
        <Text style={[ewsText.body, { color: colors.text.secondary }]}>
          We keep it only as long as this purpose needs, or as the law requires. You can access, correct or erase your
          data, or withdraw this consent at any time (it’s as easy as giving it), by writing to{' '}
          <Text
            style={{ color: colors.accentPrimary, fontFamily: theme.fonts.semiBold }}
            onPress={() => Linking.openURL(`mailto:${GRIEVANCE_EMAIL}`)}
          >
            {GRIEVANCE_EMAIL}
          </Text>
          . If we don’t resolve a complaint, you can approach the Data Protection Board of India.
        </Text>
        {checked ? (
          <PrimaryButton label="Close" onPress={() => setOpen(false)} />
        ) : (
          <View style={styles.actions}>
            <SecondaryButton label="Not now" onPress={() => setOpen(false)} style={styles.half} />
            <PrimaryButton
              label="I agree"
              onPress={() => {
                onChange(true);
                setOpen(false);
              }}
              style={styles.half}
            />
          </View>
        )}
      </EwsSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  box: {
    marginTop: 1,
  },
  texts: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-start',
  },
  link: {
    fontFamily: theme.fonts.semiBold,
    textDecorationLine: 'underline',
  },
  error: {
    paddingLeft: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  half: {
    flex: 1,
    width: 'auto',
  },
});

export default ConsentTick;
