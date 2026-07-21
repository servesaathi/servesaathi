import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '@/components/buttons';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';
import { responsiveFontSize, scale } from '@/utils/responsive';

type NotificationStep = 'none' | 'device' | 'push';

// Fitbit brand mark from the Figma "Connect Your Device" notification (1248:44619).
const FitbitIcon = () => (
  <Svg width="22" height="20.642" viewBox="0 0 22 20.642" fill="none">
    <Path
      d="M9.50617 0C9.07397 0 8.65946 0.171693 8.35385 0.477307C8.04824 0.782922 7.87654 1.19742 7.87654 1.62963C7.87654 2.06183 8.04824 2.47634 8.35385 2.78195C8.65946 3.08757 9.07397 3.25926 9.50617 3.25926C9.93838 3.25926 10.3529 3.08757 10.6585 2.78195C10.9641 2.47634 11.1358 2.06183 11.1358 1.62963C11.1358 1.19742 10.9641 0.782922 10.6585 0.477307C10.3529 0.171693 9.93838 0 9.50617 0ZM14.3951 4.07407C13.8908 4.07407 13.4072 4.27438 13.0507 4.63093C12.6941 4.98748 12.4938 5.47107 12.4938 5.97531C12.4938 6.47955 12.6941 6.96313 13.0507 7.31968C13.4072 7.67623 13.8908 7.87654 14.3951 7.87654C14.8993 7.87654 15.3829 7.67623 15.7394 7.31968C16.096 6.96313 16.2963 6.47955 16.2963 5.97531C16.2963 5.47107 16.096 4.98748 15.7394 4.63093C15.3829 4.27438 14.8993 4.07407 14.3951 4.07407ZM9.50617 4.34568C9.07397 4.34568 8.65946 4.51737 8.35385 4.82299C8.04824 5.1286 7.87654 5.5431 7.87654 5.97531C7.87654 6.40751 8.04824 6.82202 8.35385 7.12763C8.65946 7.43324 9.07397 7.60494 9.50617 7.60494C9.93838 7.60494 10.3529 7.43324 10.6585 7.12763C10.9641 6.82202 11.1358 6.40751 11.1358 5.97531C11.1358 5.5431 10.9641 5.1286 10.6585 4.82299C10.3529 4.51737 9.93838 4.34568 9.50617 4.34568ZM5.16049 4.61728C4.80032 4.61728 4.4549 4.76036 4.20023 5.01504C3.94555 5.26972 3.80247 5.61514 3.80247 5.97531C3.80247 6.33548 3.94555 6.6809 4.20023 6.93558C4.4549 7.19026 4.80032 7.33333 5.16049 7.33333C5.52066 7.33333 5.86608 7.19026 6.12076 6.93558C6.37544 6.6809 6.51852 6.33548 6.51852 5.97531C6.51852 5.61514 6.37544 5.26972 6.12076 5.01504C5.86608 4.76036 5.52066 4.61728 5.16049 4.61728ZM19.8272 8.14815C19.2509 8.14815 18.6982 8.37707 18.2907 8.78456C17.8832 9.19204 17.6543 9.74471 17.6543 10.321C17.6543 10.8973 17.8832 11.4499 18.2907 11.8574C18.6982 12.2649 19.2509 12.4938 19.8272 12.4938C20.4034 12.4938 20.9561 12.2649 21.3636 11.8574C21.7711 11.4499 22 10.8973 22 10.321C22 9.74471 21.7711 9.19204 21.3636 8.78456C20.9561 8.37707 20.4034 8.14815 19.8272 8.14815ZM14.3951 8.41975C13.8908 8.41975 13.4072 8.62006 13.0507 8.97661C12.6941 9.33316 12.4938 9.81675 12.4938 10.321C12.4938 10.8252 12.6941 11.3088 13.0507 11.6654C13.4072 12.0219 13.8908 12.2222 14.3951 12.2222C14.8993 12.2222 15.3829 12.0219 15.7394 11.6654C16.096 11.3088 16.2963 10.8252 16.2963 10.321C16.2963 9.81675 16.096 9.33316 15.7394 8.97661C15.3829 8.62006 14.8993 8.41975 14.3951 8.41975ZM9.50617 8.69136C9.07397 8.69136 8.65946 8.86305 8.35385 9.16866C8.04824 9.47428 7.87654 9.88878 7.87654 10.321C7.87654 10.7532 8.04824 11.1677 8.35385 11.4733C8.65946 11.7789 9.07397 11.9506 9.50617 11.9506C9.93838 11.9506 10.3529 11.7789 10.6585 11.4733C10.9641 11.1677 11.1358 10.7532 11.1358 10.321C11.1358 9.88878 10.9641 9.47428 10.6585 9.16866C10.3529 8.86305 9.93838 8.69136 9.50617 8.69136ZM1.35802 8.96296C0.997854 8.96296 0.652435 9.10604 0.397756 9.36072C0.143077 9.6154 0 9.96082 0 10.321C0 10.6812 0.143077 11.0266 0.397756 11.2813C0.652435 11.5359 0.997854 11.679 1.35802 11.679C1.7182 11.679 2.06361 11.5359 2.31829 11.2813C2.57297 11.0266 2.71605 10.6812 2.71605 10.321C2.71605 9.96082 2.57297 9.6154 2.31829 9.36072C2.06361 9.10604 1.7182 8.96296 1.35802 8.96296ZM5.16049 8.96296C4.80032 8.96296 4.4549 9.10604 4.20023 9.36072C3.94555 9.6154 3.80247 9.96082 3.80247 10.321C3.80247 10.6812 3.94555 11.0266 4.20023 11.2813C4.4549 11.5359 4.80032 11.679 5.16049 11.679C5.52066 11.679 5.86608 11.5359 6.12076 11.2813C6.37544 11.0266 6.51852 10.6812 6.51852 10.321C6.51852 9.96082 6.37544 9.6154 6.12076 9.36072C5.86608 9.10604 5.52066 8.96296 5.16049 8.96296ZM14.3951 12.7654C13.8908 12.7654 13.4072 12.9657 13.0507 13.3223C12.6941 13.6788 12.4938 14.1624 12.4938 14.6667C12.4938 15.1709 12.6941 15.6545 13.0507 16.011C13.4072 16.3676 13.8908 16.5679 14.3951 16.5679C14.8993 16.5679 15.3829 16.3676 15.7394 16.011C16.096 15.6545 16.2963 15.1709 16.2963 14.6667C16.2963 14.1624 16.096 13.6788 15.7394 13.3223C15.3829 12.9657 14.8993 12.7654 14.3951 12.7654ZM9.50617 13.037C9.07397 13.037 8.65946 13.2087 8.35385 13.5143C8.04824 13.82 7.87654 14.2345 7.87654 14.6667C7.87654 15.0989 8.04824 15.5134 8.35385 15.819C8.65946 16.1246 9.07397 16.2963 9.50617 16.2963C9.93838 16.2963 10.3529 16.1246 10.6585 15.819C10.9641 15.5134 11.1358 15.0989 11.1358 14.6667C11.1358 14.2345 10.9641 13.82 10.6585 13.5143C10.3529 13.2087 9.93838 13.037 9.50617 13.037ZM5.16049 13.3086C4.80032 13.3086 4.4549 13.4517 4.20023 13.7064C3.94555 13.9611 3.80247 14.3065 3.80247 14.6667C3.80247 15.0268 3.94555 15.3723 4.20023 15.6269C4.4549 15.8816 4.80032 16.0247 5.16049 16.0247C5.52066 16.0247 5.86608 15.8816 6.12076 15.6269C6.37544 15.3723 6.51852 15.0268 6.51852 14.6667C6.51852 14.3065 6.37544 13.9611 6.12076 13.7064C5.86608 13.4517 5.52066 13.3086 5.16049 13.3086ZM9.50617 17.3827C9.07397 17.3827 8.65946 17.5544 8.35385 17.86C8.04824 18.1656 7.87654 18.5801 7.87654 19.0123C7.87654 19.4445 8.04824 19.859 8.35385 20.1647C8.65946 20.4703 9.07397 20.642 9.50617 20.642C9.93838 20.642 10.3529 20.4703 10.6585 20.1647C10.9641 19.859 11.1358 19.4445 11.1358 19.0123C11.1358 18.5801 10.9641 18.1656 10.6585 17.86C10.3529 17.5544 9.93838 17.3827 9.50617 17.3827Z"
      fill="#489FAA"
    />
  </Svg>
);

// "Setting up" (Figma 1248:44478) — transition screen after profile creation. On completion,
// shows two onboarding prompts (Figma 1248:44619 "Connect Your Device" and 1248:44642
// "Reach your goal with your notifications") before landing on Home.
export const SettingUpScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'SettingUp'>>();
  const [notificationStep, setNotificationStep] = useState<NotificationStep>('none');

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotificationStep('device');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleDeviceDismiss = () => {
    // "Connect to Fitbit"/"Connect to Dr Ring" have no wearable-pairing backend yet —
    // both act the same as "Not NOW" and just advance to the next prompt.
    setNotificationStep('push');
  };

  const handlePushDismiss = () => {
    setNotificationStep('none');
    navigation.replace('Home');
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent />

      <View style={styles.content}>
        <BrandLogoSVG width={200} height={54} />
        <Spacer size="xl" />

        <Image
          source={theme.images.settingUpScribble}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Spacer size="xxl" />
        <Text style={styles.message}>
          Wait a second, we are setting{'\n'}everything up for you
        </Text>

        <Spacer size="xxl" />
        <ActivityIndicator size="large" color={theme.colors.tertiary} />
      </View>

      <Modal
        visible={notificationStep === 'device'}
        transparent
        animationType="fade"
        onRequestClose={handleDeviceDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>Connect Your Device</Text>
              <Text style={styles.subtitle}>
                For instant safety alerts and complete daily health tracking
              </Text>
            </View>
            <View style={styles.buttonBlock}>
              <TertiaryButton
                label="Connect to Fitbit"
                onPress={handleDeviceDismiss}
                prefixIcon={<FitbitIcon />}
                style={styles.lightButton}
                labelStyle={styles.lightButtonText}
              />
              <TertiaryButton
                label="Connect to Dr Ring"
                onPress={handleDeviceDismiss}
                style={styles.lightButton}
                labelStyle={styles.lightButtonText}
              />
              <PrimaryButton label="Not NOW" onPress={handleDeviceDismiss} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={notificationStep === 'push'}
        transparent
        animationType="fade"
        onRequestClose={handlePushDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>Reach your goal with{'\n'}your notifications</Text>
              <Text style={styles.subtitle}>
                You can turn off any of the reminders at anytime in the setting
              </Text>
            </View>
            <View style={styles.buttonBlock}>
              <PrimaryButton label="Continue" onPress={handlePushDismiss} />
              <SecondaryButton label="Not NOW" onPress={handlePushDismiss} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  illustration: {
    width: scale(303), // Figma "Setting up" scribble: 303×255
    height: scale(255),
  },
  message: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
    lineHeight: 28,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 328,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    gap: theme.spacing.xxxxl,
    alignItems: 'center',
    backgroundColor: theme.colors.background.layout,
  },
  textBlock: {
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(20),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonBlock: {
    width: '100%',
    gap: theme.spacing.md,
  },
  lightButton: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.forestGreen[100],
    borderWidth: 1.5,
  },
  lightButtonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[900],
  },
});

export default SettingUpScreen;
