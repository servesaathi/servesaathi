import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { Checkbox } from '@/components/inputs';
import { responsiveFontSize, scale } from '@/utils/responsive';

export const PermissionScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Permission'>>();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    navigation.replace('Home');
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Create Account" leftIcon="back" transparent />

      <View style={styles.content}>
        <View style={styles.topGroup}>
          <Image
            source={theme.images.cloudBlob}
            style={styles.illustration}
            resizeMode="contain"
          />

          <View style={styles.textGroup}>
            <Text style={styles.privacyText}>
              To protect your privacy, your activity on ServeSaathi app is not linked to your
              identity, and your personal information is never shared with advertisers.
            </Text>

            <Pressable style={styles.checkRow} onPress={() => setAgreed((v) => !v)}>
              <Checkbox checked={agreed} onPress={() => setAgreed((v) => !v)} color="orange" />
              <Text style={styles.agreeText}>
                I agree to ServeSaathi's <Text style={styles.agreeLink}>Terms & Conditions</Text>
              </Text>
            </Pressable>
          </View>
        </View>

        <PrimaryButton label="Proceed" onPress={handleProceed} />
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xl,
  },
  topGroup: {
    alignItems: 'center',
    gap: theme.spacing.xxxl,
  },
  illustration: {
    width: scale(244),
    height: scale(244),
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.xxl,
  },
  privacyText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: theme.typography.bodyLarge.lineHeight,
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  agreeText: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: theme.typography.bodyLarge.lineHeight,
    color: theme.colors.neutral[900],
  },
  agreeLink: {
    color: theme.colors.primary,
  },
});
