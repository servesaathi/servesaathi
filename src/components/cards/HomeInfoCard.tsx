import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { responsiveFontSize } from '@/utils/responsive';
import { Icon } from '@/components/icons';

export type HomeInfoCardStatus =
  | 'quote'
  | 'withCaption'
  | 'withoutCaption'
  | 'withoutButton'
  | 'profile'
  | 'walletBalance';

interface HomeInfoCardProps {
  status?: HomeInfoCardStatus;
  subheadline?: string; // "Safety Check-in" — withoutCaption/withCaption/withoutButton
  bodyText?: string; // description under subheadline
  buttonLabel?: string; // "Show Barcode" / "How are you feeling today?"
  onButtonPress?: () => void;
  quoteText?: string;
  caption?: string; // withCaption: "Raj Kumar has notified..."
  captionPhotoUri?: string;
  name?: string; // profile: "Kamala Sharma"
  years?: string;
  gender?: string;
  profilePhotoUri?: string;
  balance?: string; // walletBalance: "₹ 2,450"
  onAddCash?: () => void;
  onCashOut?: () => void;
  style?: StyleProp<ViewStyle>;
}

// "Card View" (Label Cards) from Figma Card Views (node 103:288) — the dark-green
// gradient home-screen info card, 6 status variants. Figma's decorative dot-pattern
// background is approximated here with a plain green gradient (no pattern asset).
export const HomeInfoCard: React.FC<HomeInfoCardProps> = ({
  status = 'withoutCaption',
  subheadline = 'Safety Check-in',
  bodyText = "Tap to quickly show your safety barcode for your Saathi's arrival",
  buttonLabel = 'Show Barcode',
  onButtonPress,
  quoteText = 'Every morning is a fresh opportunity to embrace life with joy. You are not alone, your Saathi is here.',
  caption,
  captionPhotoUri,
  name = 'Kamala Sharma',
  years = '60 years old',
  gender = 'Female',
  profilePhotoUri,
  balance = '₹ 2,450',
  onAddCash,
  onCashOut,
  style,
}) => {
  const isQuote = status === 'quote';
  const isProfile = status === 'profile';
  const isWallet = status === 'walletBalance';
  const isWithCaption = status === 'withCaption';
  const showButton = ['quote', 'withCaption', 'withoutCaption'].includes(status);

  return (
    <LinearGradient
      colors={[theme.colors.forestGreen[500], theme.colors.forestGreen[900]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {isProfile ? (
        <View style={styles.profileRow}>
          {profilePhotoUri && <Image source={{ uri: profilePhotoUri }} style={styles.profilePhoto} />}
          <View style={styles.textCol}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.subRow}>
              <Text style={styles.whiteBody}>{years}</Text>
              <Text style={styles.dot}> · </Text>
              <Text style={styles.whiteBody}>{gender}</Text>
            </View>
          </View>
        </View>
      ) : isWallet ? (
        <View style={styles.textCol}>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletBalance}>{balance}</Text>
          <View style={styles.walletButtons}>
            <Pressable onPress={onAddCash} style={styles.walletButton}>
              <Text style={styles.walletButtonText}>Add Cash</Text>
            </Pressable>
            <Pressable onPress={onCashOut} style={styles.walletButton}>
              <Text style={styles.walletButtonText}>Cash Out</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {status === 'withoutButton' && <Text style={styles.eyebrow}>What do you need today?</Text>}
          {isQuote && <Text style={styles.eyebrowSmall}>Quote of the day</Text>}
          <Text style={styles.subheadline}>{isQuote ? undefined : subheadline}</Text>
          <Text style={styles.bodyText}>{isQuote ? `"${quoteText}"` : bodyText}</Text>
          {showButton && (
            <Pressable onPress={onButtonPress} style={styles.button}>
              <Text style={styles.buttonText}>
                {isQuote ? 'How are you feeling today?' : buttonLabel}
              </Text>
              <Icon name="navigationRight" variant="outline" size={24} color={theme.colors.neutral[700]} />
            </Pressable>
          )}
          {isWithCaption && caption && (
            <View style={styles.captionRow}>
              {captionPhotoUri && <Image source={{ uri: captionPhotoUri }} style={styles.captionPhoto} />}
              <Text style={styles.captionText}>{caption}</Text>
            </View>
          )}
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  textCol: {
    gap: theme.spacing.xs,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  eyebrowSmall: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: '#FFFFFF',
  },
  subheadline: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: '#FFFFFF',
  },
  bodyText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.35,
    borderColor: theme.colors.forestGreen[200],
    borderRadius: theme.radius.sm,
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  buttonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: theme.colors.neutral[700],
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  captionPhoto: {
    width: 40,
    height: 40,
    borderRadius: 200,
  },
  captionText: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 200,
  },
  name: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: '#FFFFFF',
  },
  whiteBody: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: '#FFFFFF',
  },
  dot: {
    color: theme.colors.tertiary,
    fontWeight: 'bold',
  },
  walletLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: '#FFFFFF',
  },
  walletBalance: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: responsiveFontSize(28),
    color: '#FFFFFF',
  },
  walletButtons: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  walletButton: {
    flex: 1,
    height: 48,
    borderWidth: 1.35,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletButtonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: theme.colors.neutral[700],
  },
});
