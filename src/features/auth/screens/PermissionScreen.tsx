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
    // Figma flow: Permission → Profile Creation wizard
    navigation.replace('ProfileSetup');
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Create Account" leftIcon="back" transparent />

      <View style={styles.content}>
        <View style={styles.topGroup}>
          <Image
            source={theme.images.permissionBlob}
            style={styles.illustration}
            resizeMode="contain"
          />

          <View style={styles.textGroup}>
            <Text style={styles.privacyText}>
              To protect your privacy, your activity on ServeSaathi app is not linked to your identity,
              and your personal information is never shared with advertisers.
            </Text>

            <Pressable style={styles.checkRow} onPress={() => setAgreed((v) => !v)}>
              <Checkbox checked={agreed} onPress={() => setAgreed((v) => !v)} color="orange" />
              <Text style={styles.agreeText}>
                I agree to ServeSaathi's <Text style={styles.agreeLink}>Terms & Conditions</Text>
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Pinned to the bottom like the Figma frame (button at y=720/800) */}
        <View style={styles.footer}>
          <PrimaryButton label="Proceed" onPress={handleProceed} />
        </View>
        <Spacer size="sm" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxxl, // Figma: 32 below the header
  },
  topGroup: {
    alignItems: 'center',
    gap: theme.spacing.hud, // Figma: 48 between illustration and paragraph
  },
  illustration: {
    width: scale(244),
    height: scale(244),
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  privacyText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: theme.typography.bodyLarge.lineHeight,
    color: theme.colors.neutral[700],
    textAlign: 'center',
    maxWidth: 312,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    width: '100%', // Figma: checkbox row spans the full 312px content width
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xxl,
  },
  agreeText: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: theme.typography.bodyLarge.lineHeight,
    color: theme.colors.neutral[900],
    maxWidth: 284, 
  },
  agreeLink: {
    color: theme.colors.primary,
    maxWidth: 312,
  },
});
