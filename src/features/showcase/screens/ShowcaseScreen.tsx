import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/theme';
import { Screen, Container, Spacer, Divider } from '@/components/layouts';
import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  DestructiveButton,
  TextButton,
  IconButton,
} from '@/components/buttons';
import { TextInput, PasswordInput, SearchInput, OTPInput } from '@/components/inputs';
import { InfoCard, FeatureCard, ActionCard } from '@/components/cards';
import { Toast, Snackbar } from '@/components/feedback';
import Logo from '@/components/Logo';
import { scale, responsiveFontSize } from '@/utils/responsive';
import { RootNavigationProp } from '@/navigation/types';

export const ShowcaseScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Showcase'>>();
  const [otpValue, setOtpValue] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  return (
    <Screen scrollable safeAreaBottom={false} statusBarBg={theme.colors.secondary} statusBarStyle="light-content">
      {/* Header Style C - Mocked dynamically */}
      <View style={styles.header}>
        <IconButton
          type="back"
          accessibilityLabel="Go back to splash"
          onPress={() => navigation.navigate('Splash')}
          size={36}
        />
        <Logo colorVariant="brand" size="small" />
        <IconButton
          type="menu"
          accessibilityLabel="Open Menu"
          onPress={() => setToastVisible(true)}
          size={36}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionHeader}>Design System Showcase</Text>
        <Text style={styles.sectionSub}>ServeSaathi UI Component Library</Text>

        <Spacer size="md" />
        
        {/* Navigation CTAs */}
        <View style={styles.navRow}>
          <PrimaryButton
            label="Try Step Flow"
            onPress={() => navigation.navigate('Login')}
            style={styles.navBtn}
          />
          <SecondaryButton
            label="Home Dashboard"
            onPress={() => navigation.navigate('Home')}
            style={styles.navBtn}
          />
        </View>

        <Spacer size="xl" />
        <Divider />

        {/* 1. TYPOGRAPHY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Typography Scale (Atkinson Hyperlegible)</Text>
          <Spacer size="sm" />
          
          <View style={styles.typoRow}>
            <Text style={[theme.typography.h1, { color: theme.colors.neutral[900] }]}>Heading 1 (26px)</Text>
            <Text style={styles.typoMeta}>Screen titles / SemiBold</Text>
          </View>
          
          <View style={styles.typoRow}>
            <Text style={[theme.typography.h2, { color: theme.colors.neutral[900] }]}>Heading 2 (22px)</Text>
            <Text style={styles.typoMeta}>Section headers / SemiBold</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.h3, { color: theme.colors.neutral[900] }]}>Heading 3 (20px)</Text>
            <Text style={styles.typoMeta}>Sub section headers / SemiBold</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.h4, { color: theme.colors.neutral[900] }]}>Heading 4 (18px)</Text>
            <Text style={styles.typoMeta}>Card titles / SemiBold</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.h5, { color: theme.colors.neutral[900] }]}>Heading 5 (16px)</Text>
            <Text style={styles.typoMeta}>Small section headers / SemiBold</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.h6, { color: theme.colors.neutral[900] }]}>Heading 6 (14px)</Text>
            <Text style={styles.typoMeta}>Metadata headers / SemiBold</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.bodyLarge, { color: theme.colors.neutral[700] }]}>Body Large (16px)</Text>
            <Text style={styles.typoMeta}>Primary reading / Regular</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.neutral[700] }]}>Body Medium (15px)</Text>
            <Text style={styles.typoMeta}>Secondary text / Regular</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.neutral[700] }]}>Body Small (14px)</Text>
            <Text style={styles.typoMeta}>Helper text / Regular</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.caption, { color: theme.colors.neutral[500] }]}>Caption (13px)</Text>
            <Text style={styles.typoMeta}>Timestamps, small notes / Regular</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.smallCaption, { color: theme.colors.neutral[900] }]}>Small Caption (14px)</Text>
            <Text style={styles.typoMeta}>Form labels / SemiBold</Text>
          </View>

          <View style={styles.typoRow}>
            <Text style={[theme.typography.label, { color: theme.colors.neutral[900] }]}>Label (16px)</Text>
            <Text style={styles.typoMeta}>Button labels / SemiBold</Text>
          </View>
        </View>

        <Divider />

        {/* 2. COLORS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Color Palette</Text>
          <Spacer size="sm" />
          
          <Text style={styles.subLabel}>Brand Colors</Text>
          <View style={styles.colorGrid}>
            <ColorBox hex={theme.colors.primary} name="Primary" label="Forest Green 500" lightText />
            <ColorBox hex={theme.colors.secondary} name="Secondary" label="Forest Green 900" lightText />
            <ColorBox hex={theme.colors.tertiary} name="Tertiary" label="Vivid Orange 500" lightText />
          </View>

          <Spacer size="sm" />
          <Text style={styles.subLabel}>Neutrals</Text>
          <View style={styles.colorGrid}>
            <ColorBox hex={theme.colors.neutral[900]} name="Neutral 900" label="Primary Text" lightText />
            <ColorBox hex={theme.colors.neutral[700]} name="Neutral 700" label="Secondary Text" lightText />
            <ColorBox hex={theme.colors.neutral[500]} name="Neutral 500" label="Helper Text" lightText />
            <ColorBox hex={theme.colors.neutral[200]} name="Neutral 200" label="Disabled BG" />
            <ColorBox hex={theme.colors.neutral[50]} name="Neutral 50" label="Base BG" bordered />
          </View>

          <Spacer size="sm" />
          <Text style={styles.subLabel}>Layout Backgrounds & Utility</Text>
          <View style={styles.colorGrid}>
            <ColorBox hex={theme.colors.background.layout} name="Bg-Background" label="Forest Green 50" bordered />
            <ColorBox hex={theme.colors.background.orange} name="Bg-Orange Base" label="Vivid Orange 50" bordered />
            <ColorBox hex={theme.colors.border.green} name="G Line" label="Forest Green 200" />
            <ColorBox hex={theme.colors.status.error} name="Error (D)" label="Validation" lightText />
            <ColorBox hex={theme.colors.status.errorBg} name="Error Bg" label="Pink Red 50" bordered />
          </View>
        </View>

        <Divider />

        {/* 3. HEADERS & STATUS BARS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Header Variants & Status Bars</Text>
          <Spacer size="sm" />

          {/* Dark Status Bar mockup */}
          <Text style={styles.subLabel}>Header Type A (Dark Status Bar Mockup)</Text>
          <View style={styles.headerMockContainer}>
            <View style={[styles.statusBarMock, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.whiteTime}>9:30</Text>
              <View style={styles.mockStatusIcons}>
                <Text style={styles.whiteIcon}>📶</Text>
                <Text style={styles.whiteIcon}>🔋</Text>
              </View>
            </View>
            <View style={styles.headerMock}>
              <IconButton type="back" size={28} accessibilityLabel="Back" onPress={() => {}} />
              <Text style={[theme.typography.h3, { color: theme.colors.neutral[900], flex: 1, marginLeft: 12 }]}>
                Create Account
              </Text>
              <IconButton type="menu" size={28} accessibilityLabel="Menu" onPress={() => {}} />
            </View>
          </View>

          <Spacer size="md" />

          {/* Header B Mockup */}
          <Text style={styles.subLabel}>Header Type B (Progress Bar Mockup)</Text>
          <View style={styles.headerMockContainer}>
            <View style={styles.headerMock}>
              <IconButton type="back" size={28} accessibilityLabel="Back" onPress={() => {}} />
              <View style={styles.progressMockContainer}>
                {/* 5 lines progress indicator */}
                <View style={[styles.progressLine, styles.activeProgress]} />
                <View style={styles.progressLine} />
                <View style={styles.progressLine} />
                <View style={styles.progressLine} />
                <View style={styles.progressLine} />
              </View>
              <Text style={styles.progressStepText}>1 of 6</Text>
            </View>
          </View>

          <Spacer size="md" />

          {/* Header D Mockup */}
          <Text style={styles.subLabel}>Header Type D (Date Title & Close Mockup)</Text>
          <View style={styles.headerMockContainer}>
            <View style={styles.headerMock}>
              <Text style={[theme.typography.bodyLarge, { fontWeight: 'bold', flex: 1 }]}>
                15 April 2026
              </Text>
              <IconButton type="close" size={28} bg={theme.colors.primary} accessibilityLabel="Close" onPress={() => {}} />
            </View>
          </View>
        </View>

        <Divider />

        {/* 4. BUTTONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Buttons Matrix</Text>
          <Spacer size="sm" />

          <Text style={styles.subLabel}>Primary & Secondary Buttons</Text>
          <View style={styles.row}>
            <PrimaryButton label="Primary" onPress={() => setToastVisible(true)} style={styles.flexBtn} />
            <Spacer size="sm" horizontal />
            <SecondaryButton label="Secondary" onPress={() => setToastVisible(true)} style={styles.flexBtn} />
          </View>

          <Spacer size="sm" />
          <Text style={styles.subLabel}>Tertiary & Destructive Buttons</Text>
          <View style={styles.row}>
            <TertiaryButton label="Tertiary" onPress={() => setToastVisible(true)} style={styles.flexBtn} />
            <Spacer size="sm" horizontal />
            <DestructiveButton label="Destructive" onPress={() => setToastVisible(true)} style={styles.flexBtn} />
          </View>

          <Spacer size="sm" />
          <Text style={styles.subLabel}>Small Sized Buttons (Height 32dp)</Text>
          <View style={styles.row}>
            <PrimaryButton size="small" label="Small Primary" onPress={() => setToastVisible(true)} />
            <Spacer size="sm" horizontal />
            <TertiaryButton size="small" label="Small Orange" onPress={() => setToastVisible(true)} />
            <Spacer size="sm" horizontal />
            <SecondaryButton size="small" label="Small Sec" onPress={() => setToastVisible(true)} />
          </View>

          <Spacer size="sm" />
          <Text style={styles.subLabel}>Disabled States</Text>
          <View style={styles.row}>
            <PrimaryButton disabled label="Primary Disabled" onPress={() => {}} style={styles.flexBtn} />
            <Spacer size="sm" horizontal />
            <TertiaryButton disabled label="Tertiary Disabled" onPress={() => {}} style={styles.flexBtn} />
          </View>

          <Spacer size="sm" />
          <Text style={styles.subLabel}>Links and Text Buttons</Text>
          <View style={styles.row}>
            <TextButton label="Primary Underlined Link" onPress={() => setSnackbarVisible(true)} />
            <Spacer size="md" horizontal />
            <TextButton label="Orange Link" textColor={theme.colors.tertiary} onPress={() => setSnackbarVisible(true)} />
          </View>
        </View>

        <Divider />

        {/* 5. INPUTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Input Form Fields</Text>
          <Spacer size="sm" />

          <TextInput
            label="Name Field (Default)"
            placeholder="Enter your full name"
          />

          <TextInput
            label="Email Field (With Error State)"
            placeholder="Enter email address"
            value="invalid-email@"
            error="Please enter a valid email address"
          />

          <PasswordInput
            label="Password Field"
            placeholder="Enter password"
          />

          <SearchInput
            label="Search Field"
            placeholder="Search companionship services..."
          />

          <Text style={styles.subLabel}>OTP Verification Row (4 digits)</Text>
          <OTPInput
            length={4}
            value={otpValue}
            onChange={(val) => {
              setOtpValue(val);
              if (val.length === 4) {
                setToastVisible(true);
              }
            }}
          />
          <Text style={styles.otpHelper}>Current value: {otpValue || 'None'}</Text>
        </View>

        <Divider />

        {/* 6. CARDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Cards Framework</Text>
          <Spacer size="sm" />

          <Text style={styles.subLabel}>InfoCard (Warning Alert type / Bg-Orange)</Text>
          <InfoCard
            type="warning"
            title="Awaiting Verification"
            description="Your documents are being checked. This usually takes around 24 hours. We'll alert you via SMS once complete."
          />

          <Spacer size="md" />
          
          <Text style={styles.subLabel}>InfoCard (Success type / Bg-Green)</Text>
          <InfoCard
            type="success"
            title="Profile Complete!"
            description="Thank you for signing up. You can now browse local companions and start scheduling care sessions."
          />

          <Spacer size="md" />

          <Text style={styles.subLabel}>FeatureCard (Service Info Item)</Text>
          <FeatureCard
            title="Elder Companionship"
            description="Friendly visits, sharing meals, reading aloud, and taking gentle neighborhood walks."
            icon={
              <Text style={styles.largeEmoji}>👵</Text>
            }
          />

          <Spacer size="md" />

          <Text style={styles.subLabel}>ActionCard (Interactive Navigation link)</Text>
          <ActionCard
            title="View Local Caregivers"
            description="Explore available matches within 5 miles of your address"
            onPress={() => navigation.navigate('Home')}
            icon={
              <Text style={styles.smallEmoji}>🏡</Text>
            }
          />
        </View>
      </View>

      <Spacer size="giant" />

      {/* Global Feedback Overlays */}
      <Toast visible={toastVisible} message="Showcase trigger fired!" onDismiss={() => setToastVisible(false)} />
      <Snackbar
        visible={snackbarVisible}
        type="success"
        message="Snackbar triggered successfully!"
        onDismiss={() => setSnackbarVisible(false)}
      />
    </Screen>
  );
};

// --- DYNAMIC INNER COMPONENTS ---

interface ColorBoxProps {
  hex: string;
  name: string;
  label: string;
  lightText?: boolean;
  bordered?: boolean;
}

const ColorBox: React.FC<ColorBoxProps> = ({ hex, name, label, lightText = false, bordered = false }) => {
  return (
    <View style={styles.colorBoxContainer}>
      <View
        style={[
          styles.colorColor,
          {
            backgroundColor: hex,
            borderWidth: bordered ? 1 : 0,
            borderColor: theme.colors.border.default,
          },
        ]}
      />
      <Text style={styles.colorName}>{name}</Text>
      <Text style={styles.colorLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.base,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border.default,
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h1.fontSize),
    color: theme.colors.neutral[900],
    fontWeight: 'bold',
  },
  sectionSub: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
    marginTop: theme.spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  navBtn: {
    flex: 1,
  },
  section: {
    paddingVertical: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  subLabel: {
    fontFamily: theme.typography.smallCaption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    color: theme.colors.neutral[500],
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexBtn: {
    flex: 1,
  },
  typoRow: {
    marginBottom: theme.spacing.md,
  },
  typoMeta: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  colorBoxContainer: {
    width: scale(95),
    marginBottom: theme.spacing.sm,
  },
  colorColor: {
    height: scale(50),
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  colorName: {
    fontSize: responsiveFontSize(13),
    fontWeight: 'bold',
    color: theme.colors.neutral[900],
  },
  colorLabel: {
    fontSize: responsiveFontSize(11),
    color: theme.colors.neutral[500],
  },
  headerMockContainer: {
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  statusBarMock: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  whiteTime: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(12),
    fontWeight: 'bold',
  },
  mockStatusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  whiteIcon: {
    fontSize: responsiveFontSize(12),
    color: '#FFFFFF',
  },
  headerMock: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  progressMockContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.xl,
    gap: 4,
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 1.5,
  },
  activeProgress: {
    backgroundColor: theme.colors.tertiary,
  },
  progressStepText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(12),
    color: theme.colors.primary,
    fontWeight: '600',
  },
  otpHelper: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(13),
    textAlign: 'center',
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.sm,
  },
  largeEmoji: {
    fontSize: 28,
  },
  smallEmoji: {
    fontSize: 20,
  },
});

export default ShowcaseScreen;
