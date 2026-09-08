import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/buttons';
import { TextInput } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { getOrganization } from '../data';
import { useThemeColors } from '@/hooks/useThemeColors';

// "Book Details" (Figma 2895:69772) — booking checkout: summary, billing
// breakdown, promo code, payment method and notes, reached from Request
// Details' "Proceed to Payment" once a Book/Enquire lead is verified.
// "Pay Deposit - Done" (Figma 2895:69361) is the confirm popup at the bottom.

const TAX = 241;

export const BookDetailsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'BookDetails'>>();
  const route = useRoute<RootRouteProp<'BookDetails'>>();
  const org = getOrganization(route.params?.orgId ?? 'agewell');
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [paying, setPaying] = useState(false);

  const priceValue = Number(String(org.price).replace(/[^\d]/g, '')) || 3999;
  const total = priceValue + TAX;

  const handlePayNow = () => {
    if (paying) return;
    setPaying(true);
    // No real payment API yet — simulate confirmation and land back on Home,
    // matching the Figma flow's final "Home" screen.
    setTimeout(() => {
      setPaying(false);
      setShowPayModal(false);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }, 600);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <IconButton type="back" bg={colors.accentPrimary} accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Review and Confirm</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />

        {/* Organization summary card */}
        <View style={[styles.orgCard, { backgroundColor: colors.background.base, borderLeftColor: colors.accentPrimary }]}>
          <View style={styles.orgHeaderRow}>
            {org.image ? (
              <Image source={org.image} style={styles.orgThumb} resizeMode="cover" />
            ) : (
              <View style={[styles.orgThumb, { backgroundColor: colors.border.hairline }]} />
            )}
            <View style={styles.orgHeaderText}>
              <Text style={[styles.orgName, { color: colors.text.secondary }]}>{org.name}</Text>
              <View style={styles.ratingRow}>
                <View style={[styles.ratingChip, { backgroundColor: colors.background.orange }]}>
                  <Icon name="star" variant="filled" size={14} color={colors.accentOrange} />
                  <Text style={[styles.ratingChipText, { color: colors.accentOrange }]}>{org.rating ?? '-'}</Text>
                </View>
                <Text style={[styles.ratingCount, { color: colors.accentOrange }]}>({org.ratingCount})</Text>
              </View>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldIcon, { backgroundColor: colors.border.hairline }]}>
              <Icon name="calendar" variant="outline" size={22} color={colors.accentPrimary} />
            </View>
            <View style={styles.fieldText}>
              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Date &amp; Time</Text>
              <Text style={[styles.fieldValue, { color: colors.text.secondary }]}>Wednesday, 15 May</Text>
              <Text style={[styles.fieldValueOrange, { color: colors.accentOrange }]}>3:00 PM</Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldIcon, { backgroundColor: colors.border.hairline }]}>
              <Icon name="government" variant="outline" size={22} color={colors.accentPrimary} />
            </View>
            <View style={styles.fieldText}>
              <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Location</Text>
              <Text style={[styles.fieldValue, { color: colors.text.tertiary }]}>
                Second Floor, M8A, Vinoba Puri, Block M, Part II, Lajpat Nagar, New Delhi, Delhi 110024
              </Text>
            </View>
          </View>
        </View>

        <Spacer size="xl" />

        {/* Billing */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Billing</Text>
        <Spacer size="sm" />
        <View style={[styles.billingCard, { backgroundColor: colors.background.base }]}>
          <View style={styles.feeRow}>
            <Text style={[styles.feeLabel, { color: colors.text.secondary }]}>Assigned Living -{'\n'}{org.name}</Text>
            <Text style={[styles.feeValue, { color: colors.text.secondary }]}>₹ {priceValue}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border.hairline }]} />
          <View style={styles.feeRow}>
            <Text style={[styles.feeLabel, { color: colors.text.tertiary }]}>Tax</Text>
            <Text style={[styles.feeValue, { color: colors.text.tertiary }]}>₹ {TAX}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border.hairline }]} />
          <View style={styles.feeRow}>
            <Text style={[styles.feeLabelTotal, { color: colors.accentOrange }]}>Total Due</Text>
            <Text style={[styles.feeValueTotal, { color: colors.accentOrange }]}>₹ {total}</Text>
          </View>
        </View>

        <Spacer size="xl" />

        {/* Promo code */}
        <View style={styles.promoRow}>
          <TextInput
            label="Promo / Coupon Code"
            placeholder="--"
            value={promoCode}
            onChangeText={setPromoCode}
            containerStyle={styles.promoInput}
          />
          <SecondaryButton label="Add" size="small" onPress={() => {}} style={styles.promoBtn} />
        </View>

        <Spacer size="lg" />

        {/* Payment method */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Payment method</Text>
        <Spacer size="sm" />
        <View style={styles.paymentRow}>
          <View style={[styles.paymentCard, { backgroundColor: colors.background.base, borderColor: colors.border.hairline }]}>
            <View style={[styles.cardLogo, { backgroundColor: colors.background.orange }]}>
              <Icon name="payment" variant="outline" size={22} color={colors.accentOrange} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text.secondary }]}>Card</Text>
              <Text style={[styles.cardSubtitle, { color: colors.text.tertiary }]}>Visa *4289</Text>
            </View>
          </View>
          <SecondaryButton label="Edit" size="small" onPress={() => navigation.navigate('PaymentMethod')} style={styles.promoBtn} />
        </View>

        <Spacer size="lg" />
        <TextInput
          label="Additional Notes"
          placeholder="Any specific requirement or questions"
          value={notes}
          onChangeText={setNotes}
          multiline
          inputStyle={styles.notesInput}
        />

        <Spacer size="lg" />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Additional terms and conditions</Text>
        <Spacer size="xs" />
        <Text style={[styles.termsText, { color: colors.text.secondary }]}>
          Deposits are non refundable, you can reschedule your booking and your deposit will be transferred over to
          your future booking. If you are unable to reschedule, please contact us at least 48 hours before your
          booking.
        </Text>

        <Spacer size={110} />
      </ScrollView>

      {/* Bottom nav — total + Confirm (opens the Pay Deposit popup) */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background.base, borderTopColor: colors.border.hairline, paddingBottom: insets.bottom || theme.spacing.md },
        ]}
      >
        <View>
          <Text style={[styles.totalPrice, { color: colors.text.primary }]}>₹ {total}</Text>
          <Text style={[styles.totalCaption, { color: colors.text.tertiary }]}>1 service</Text>
        </View>
        <PrimaryButton label="Confirm" onPress={() => setShowPayModal(true)} style={styles.confirmBtn} />
      </View>

      {/* "Pay Deposit - Done" popup (Figma 2895:69361) */}
      {showPayModal && (
        <View style={styles.payBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !paying && setShowPayModal(false)} />
          <View style={[styles.payCard, { backgroundColor: colors.background.layout }]}>
            <View style={styles.payHeaderRow}>
              <View style={{ flex: 1 }} />
              <IconButton
                type="close"
                bg={colors.accentPrimary}
                accessibilityLabel="Close"
                onPress={() => setShowPayModal(false)}
                size={40}
              />
            </View>
            <Spacer size="sm" />
            <Text style={[styles.title, { color: colors.text.primary }]}>Pay deposit to confirm</Text>
            <Spacer size="md" />
            <Text style={[styles.body, { color: colors.text.secondary }]}>
              You’re about to pay the deposit using your Visa card ending in *4289
            </Text>

            <Spacer size="lg" />
            <Text style={[styles.paymentMethodLabel, { color: colors.text.primary }]}>Payment method</Text>
            <Spacer size="xs" />
            <View style={[styles.paymentCard, { backgroundColor: colors.background.base, borderColor: colors.border.hairline, width: '100%' }]}>
              <View style={[styles.cardLogo, { backgroundColor: colors.background.orange }]}>
                <Icon name="payment" variant="outline" size={22} color={colors.accentOrange} />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text.secondary }]}>Card</Text>
                <Text style={[styles.cardSubtitle, { color: colors.text.tertiary }]}>Visa *4289</Text>
              </View>
            </View>

            <Spacer size="md" />
            <View style={[styles.depositRow, { backgroundColor: colors.background.base }]}>
              <Text style={[styles.feeLabelTotal, { color: colors.accentOrange }]}>Deposit Due</Text>
              <Text style={[styles.feeValueTotal, { color: colors.accentOrange }]}>₹ {total}</Text>
            </View>

            <Spacer size="lg" />
            <View style={styles.payButtonsRow}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setShowPayModal(false)}
                style={styles.payButton}
                disabled={paying}
              />
              <PrimaryButton label="Pay Now" onPress={handlePayNow} loading={paying} style={styles.payButton} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
  },
  orgCard: {
    borderLeftWidth: 4,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  orgHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  orgThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  orgHeaderText: {
    gap: theme.spacing.sm,
  },
  orgName: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(18),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    borderRadius: 60,
    paddingHorizontal: theme.spacing.sm,
  },
  ratingChipText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(13),
  },
  ratingCount: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
  },
  fieldRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldText: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(14),
  },
  fieldValue: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    lineHeight: 22,
  },
  fieldValueOrange: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
  },
  sectionTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
  },
  billingCard: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  feeLabel: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 22,
  },
  feeValue: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
  feeLabelTotal: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
  },
  feeValueTotal: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(16),
  },
  divider: {
    height: 1,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.lg,
  },
  promoInput: {
    flex: 1,
  },
  promoBtn: {
    width: 100,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  paymentCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.lg,
  },
  cardLogo: {
    width: 40,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
  },
  cardSubtitle: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  termsText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  totalPrice: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(20),
  },
  totalCaption: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
  },
  confirmBtn: {
    width: 160,
  },
  payBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 25, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  payCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  payHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    textAlign: 'center',
  },
  body: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 22,
    textAlign: 'center',
  },
  paymentMethodLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  payButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  payButton: {
    flex: 1,
    width: 'auto',
  },
});

export default BookDetailsScreen;
