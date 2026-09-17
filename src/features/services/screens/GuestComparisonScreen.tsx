import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useIsGuestVerified } from '@/store/auth.store';
import { ORGANIZATIONS, Organization, getOrgImage } from '../data';
import { GuestBottomNav } from '../components/GuestBottomNav';
import { UnlockComparisonSheet } from '../components/UnlockComparisonSheet';

// Guest-facing "Comparsion" (Figma 2895:78461) — the provider headers and the
// Price row are visible, everything below ("Identity & Mission" onward) is dimmed
// behind a "Compare All Providers Side-by-Side" gate until the guest verifies a
// phone number. Verified/registered users skip the gate entirely.
//
// Layout: 1 provider -> prompt to add another; 2 -> columns split the screen
// (no horizontal scroll); 3+ -> fixed 150px columns inside a horizontal scroll.

const COL_WIDTH = 150;

const Star = ({ filled, mutedColor }: { filled: boolean; mutedColor: string }) => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#E7A500' : mutedColor}>
    <Path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </Svg>
);

export const GuestComparisonScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'GuestComparison'>>();
  const route = useRoute<RootRouteProp<'GuestComparison'>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  // Gated for anyone without a real account — a guest, or just a not-yet-logged-in
  // visitor. A signed-in user (real token) or one already saved via the
  // frontend-only stopgap (see guestVerification.ts) sees the full matrix straight away.
  //
  // isVerified is read live on every render rather than snapshotted once —
  // useState(isVerified) would only capture whatever it was at this screen's
  // FIRST mount, so verifying on a different screen (e.g. GuestBrowse's
  // "Unlock All Provider") wouldn't be reflected here if this screen was
  // already mounted, or if it mounts before the auth store finishes anything
  // async. sheetUnlocked covers unlocking via this screen's own sheet instead.
  const isVerified = useIsGuestVerified();
  const [ids, setIds] = useState<string[]>(route.params?.orgIds ?? []);
  const [sheetUnlocked, setSheetUnlocked] = useState(false);
  const unlocked = isVerified || sheetUnlocked;
  const [showUnlock, setShowUnlock] = useState(false);
  const [navHeight, setNavHeight] = useState(64 + (insets.bottom || theme.spacing.md));

  const title = route.params?.serviceType ?? 'Compare';

  const orgs = ids
    .map((id) => ORGANIZATIONS.find((o) => o.id === id))
    .filter((o): o is Organization => !!o);

  // 3+ columns can't fit a phone — only then do we switch to fixed-width columns
  // and horizontal scrolling. 1–2 columns just divide the available width.
  const isScrollable = orgs.length >= 3;
  const cellSizing: StyleProp<ViewStyle> = isScrollable ? styles.cellFixed : styles.cellFlex;

  const removeOrg = (id: string) => {
    const next = ids.filter((i) => i !== id);
    if (next.length === 0) navigation.goBack();
    else setIds(next); // 1 left -> the "add one more" prompt below takes over
  };

  const handleSeeDetails = (orgId: string) => {
    if (unlocked) navigation.navigate('CaregiverDetail', { orgId, serviceType: route.params?.serviceType });
    else setShowUnlock(true);
  };

  // Nav tabs stay gated until the guest verifies; afterwards they fall through to Home.
  const handleNavPress = () => {
    if (unlocked) navigation.navigate('Home');
    else setShowUnlock(true);
  };

  const handleVerified = () => {
    setSheetUnlocked(true);
    setShowUnlock(false);
  };

  const leaveForAuth = (go: () => void) => {
    setShowUnlock(false);
    go();
  };

  // Row helpers — every row renders one cell per organization so the columns
  // stay aligned (fixed width when scrolling, otherwise an equal share).
  const cellsRow = (render: (org: Organization) => React.ReactNode, shaded = false) => (
    <View style={styles.row}>
      {orgs.map((org) => (
        <View
          key={org.id}
          style={[
            styles.cell,
            cellSizing,
            {
              borderColor: colors.border.hairline,
              backgroundColor: shaded ? colors.background.orange : colors.background.base,
            },
          ]}
        >
          {render(org)}
        </View>
      ))}
    </View>
  );

  const labelRow = (label: string) =>
    cellsRow(() => <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>, true);

  const sectionHeader = (label: string) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: colors.accentOrange },
        isScrollable && { width: orgs.length * COL_WIDTH },
      ]}
    >
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );

  const listRows = (pick: (org: Organization) => string[]) => {
    const max = Math.max(...orgs.map((o) => pick(o).length));
    return Array.from({ length: max }).map((_, i) => (
      <React.Fragment key={i}>
        {cellsRow((org) => {
          const value = pick(org)[i];
          return value ? <Text style={[styles.rowValue, { color: colors.text.secondary }]}>{value}</Text> : null;
        })}
      </React.Fragment>
    ));
  };

  const renderHeaderCard = (org: Organization, sizing: StyleProp<ViewStyle>) => (
    <View key={org.id} style={[styles.orgHeaderCell, sizing]}>
      <View style={styles.orgLogoBox}>
        <Image source={getOrgImage(org)} style={styles.orgLogo} resizeMode="cover" />
        <Pressable
          style={[styles.removeBtn, { backgroundColor: colors.background.base, borderColor: colors.accentPrimary }]}
          onPress={() => removeOrg(org.id)}
          accessibilityLabel={`Remove ${org.name}`}
        >
          <Text style={[styles.removeX, { color: colors.accentPrimary }]}>×</Text>
        </Pressable>
      </View>
      <Text style={[styles.orgName, { color: colors.accentPrimary }]}>{org.name}</Text>
      <PrimaryButton label="See details" size="small" onPress={() => handleSeeDetails(org.id)} />
    </View>
  );

  const renderBody = (outerStyle?: StyleProp<ViewStyle>) => (
    <ScrollView
      style={outerStyle}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: navHeight + theme.spacing.xxl }}
    >
      {/* Provider headers (always visible) */}
      <View style={styles.row}>{orgs.map((org) => renderHeaderCard(org, cellSizing))}</View>

      {/* Price row (always visible) */}
      {labelRow('Price')}
      {cellsRow((org) => <Text style={[styles.rowValue, { color: colors.text.secondary }]}>{org.price}</Text>)}

      {/* Everything below is gated for guests. */}
      <View style={!unlocked && styles.lockedRows} pointerEvents={unlocked ? 'auto' : 'none'}>
        {sectionHeader('Identity & Mission')}
        {labelRow('Founded')}
        {cellsRow((org) => <Text style={[styles.rowValue, { color: colors.text.secondary }]}>{org.founded}</Text>)}
        {labelRow('Mission')}
        {cellsRow((org) => <Text style={[styles.rowValue, { color: colors.text.secondary }]}>{org.mission}</Text>)}

        {sectionHeader('Ratings and Review')}
        {labelRow('Ratings')}
        {cellsRow((org) => (
          <View>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} filled={org.rating != null && i < Math.round(org.rating)} mutedColor={colors.border.card} />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: colors.accentOrange }]}>
              {org.rating ?? '-'} ({org.ratingCount})
            </Text>
          </View>
        ))}
        {labelRow('Impact Ratings')}
        {listRows((org) => org.impact)}

        {sectionHeader('Programs & Initiatives')}
        {listRows((org) => org.programs)}

        {sectionHeader('Services Provided')}
        {listRows((org) => org.services)}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <View style={[styles.top, { paddingTop: insets.top + theme.spacing.lg }]}>
        <View style={styles.headerRow}>
          <IconButton type="back" bg={colors.accentPrimary} accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <Spacer size="lg" />
        <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Compare Products</Text>
        <Spacer size="md" />
      </View>

      {orgs.length < 2 ? (
        // Need at least two providers — show the one picked plus a prompt to
        // go back and add another.
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.needMore, { paddingBottom: navHeight + theme.spacing.xxl }]}
        >
          <View style={styles.row}>
            {orgs.map((org) => renderHeaderCard(org, styles.cellFlex))}
            <Pressable
              style={[styles.addCard, { borderColor: colors.border.card }]}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Add another provider"
            >
              <Text style={[styles.addPlus, { color: colors.text.muted }]}>+</Text>
              <Text style={[styles.addText, { color: colors.text.muted }]}>Add provider</Text>
            </Pressable>
          </View>

          <Spacer size="xl" />
          <Text style={[styles.needMoreText, { color: colors.text.secondary }]}>
            Add one more provider to see the full side-by-side comparison.
          </Text>
          <Spacer size="lg" />
          <PrimaryButton label="Add Provider" onPress={() => navigation.goBack()} />
        </ScrollView>
      ) : isScrollable ? (
        <ScrollView horizontal style={{ flex: 1 }} showsHorizontalScrollIndicator={false}>
          {renderBody()}
        </ScrollView>
      ) : (
        renderBody({ flex: 1 })
      )}

      {/* Gate: scrim + "Compare All Providers Side-by-Side" card (Figma 2895:78665) */}
      {orgs.length >= 2 && !unlocked && (
        <>
          <View
            style={[styles.gateScrim, { backgroundColor: colors.background.layout, bottom: navHeight }]}
            pointerEvents="none"
          />
          <View style={[styles.gateWrap, { bottom: navHeight + theme.spacing.xxl }]} pointerEvents="box-none">
            <View style={[styles.gateCard, { backgroundColor: colors.background.layout }]}>
              <Text style={[styles.gateTitle, { color: colors.text.primary }]}>Compare All Providers Side-by-Side</Text>
              <Text style={[styles.gateBody, { color: colors.text.secondary }]}>
                See full specifications, hidden fees, and performance ratings for all available options.
              </Text>
              <PrimaryButton label="View Full Comparison" onPress={() => setShowUnlock(true)} />
            </View>
          </View>
        </>
      )}

      <GuestBottomNav
        onLockedPress={handleNavPress}
        onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}
      />

      <UnlockComparisonSheet
        visible={showUnlock}
        onClose={() => setShowUnlock(false)}
        onVerified={handleVerified}
        onGoogle={() => leaveForAuth(() => navigation.navigate('Login', { intent: 'login' }))}
        onEmail={() => leaveForAuth(() => navigation.navigate('EnterEmail'))}
        onLogin={() => leaveForAuth(() => navigation.navigate('Login', { intent: 'login' }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.layout,
  },
  top: {
    paddingHorizontal: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  pageTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.forestGreen[50],
    backgroundColor: theme.colors.background.base,
    justifyContent: 'center',
  },
  cellFixed: {
    width: COL_WIDTH,
  },
  cellFlex: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
    color: theme.colors.neutral[900],
  },
  rowValue: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    lineHeight: 20,
    color: theme.colors.neutral[700],
  },
  lockedRows: {
    opacity: 0.35,
  },
  sectionHeader: {
    backgroundColor: theme.colors.tertiary,
    alignSelf: 'stretch',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sectionHeaderText: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
    color: '#FFFFFF',
  },
  orgHeaderCell: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  orgLogoBox: {
    position: 'relative',
  },
  orgLogo: {
    width: '100%',
    height: 100,
    borderRadius: theme.radius.sm,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.background.base,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeX: {
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: theme.fonts.bold,
  },
  orgName: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
    color: theme.colors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  needMore: {
    paddingHorizontal: theme.spacing.xl,
  },
  addCard: {
    flex: 1,
    height: 172,
    margin: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  addPlus: {
    fontFamily: theme.fonts.bold,
    fontSize: responsiveFontSize(28),
    lineHeight: 32,
  },
  addText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
  },
  needMoreText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    lineHeight: 22,
    textAlign: 'center',
  },
  gateScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%',
    opacity: 0.6,
  },
  gateWrap: {
    position: 'absolute',
    left: theme.spacing.xl,
    right: theme.spacing.xl,
    alignItems: 'center',
  },
  gateCard: {
    width: '100%',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  gateTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  gateBody: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
});

export default GuestComparisonScreen;
