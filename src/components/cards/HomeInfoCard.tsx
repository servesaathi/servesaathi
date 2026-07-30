import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
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
// home-screen info card, 6 status variants, using the dot-pattern background asset.
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

  // The dot-pattern asset must cover the card exactly, but the card's height is
  // text-driven and percentage sizes inside ImageBackground don't resolve
  // reliably against content-sized parents on iOS (the image ends up at its
  // intrinsic 312×181, leaving part of the card uncovered). Measuring the card
  // and sizing the image in absolute pixels is deterministic on every platform;
  // the card's solid green base color backstops the first frame before layout.
  const [bgSize, setBgSize] = useState<{ width: number; height: number } | null>(null);
  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!bgSize || bgSize.width !== width || bgSize.height !== height) {
      setBgSize({ width, height });
    }
  };

  return (
    <View style={[styles.card, style]} onLayout={onCardLayout}>
      {bgSize && (
        <Image
          source={theme.images.homeInfoBg}
          style={[styles.cardImage, bgSize]}
          resizeMode="stretch"
        />
      )}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary, 'rgba(46, 125, 50, 0)']}
        locations={[0, 0.6262, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
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
          {!isQuote && <Text style={styles.subheadline}>{subheadline}</Text>}
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    overflow: 'hidden',
    // Solid base so the card never shows the page through it, even before the
    // measured background image is ready.
    backgroundColor: theme.colors.primary,
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: theme.radius.sm,
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
    gap: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.35,
    borderColor: theme.colors.forestGreen[200],
    borderRadius: theme.radius.sm,
    // minHeight (not height): larger font settings scale the label, which must
    // grow the button instead of overflowing it.
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  buttonText: {
    flexShrink: 1,
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
