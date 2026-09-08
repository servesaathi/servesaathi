import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { SearchInput, TextInput, OTPInput, SelectableChip } from '@/components/inputs';
import { ComparePopUpCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { authService, getErrorMessage } from '@/api';
import { ORGANIZATIONS } from '../data';

// Guest browsing screen (Figma "Browse Services" — 2694:20730 → 2696:4239 → 2895:73743),
// with the "unlock more providers" gate flow (2895:78057 → 2895:78101/78127 → 2895:78081).
// Reached from Onboarding's "Get Started". The visitor previews a few providers, then
// verifies a phone number to reveal the full list.

// Figma 2895:73743 shows three provider cards before the "View Providers" gate.
const GUEST_VISIBLE_COUNT = 3;
// Header pill shown once a location has been picked (matches the 2895:73743 mock).
const DEFAULT_LOCATION_LABEL = 'New Delhi, Delhi 110001';
const OTP_LENGTH = 4;
const RESEND_SECONDS = 28; // Figma copy: "Resend in 00:28"

const NAV_ITEMS: { key: string; label: string; icon: IconName }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'hub', label: 'Hub', icon: 'grid' },
  { key: 'profile', label: 'Profile', icon: 'profile' },
  { key: 'setting', label: 'Setting', icon: 'setting' },
];

// Fallback imagery for orgs with no photo of their own (Figma shows grey slots).
const FALLBACK_IMAGES = [theme.images.onboarding1, theme.images.onboarding2, theme.images.onboarding3];

// "Filter by" sheet groups (Figma 2696:6231), replicated as-is.
const FILTER_RATINGS = ['24/7 Care', 'Day Care', 'On-demand', 'Part time'];
const FILTER_BUDGETS = ['Under ₹20,000', '₹20,000 - ₹50,000', '₹50,000 - ₹1,00,000', 'Above ₹1,00,000'];
const FILTER_URGENCY = ['Today', 'Just exploring', 'This week'];
const FILTER_SERVICE_TYPES = ['24/7 Care', 'Day Care', 'On-demand', 'Part time'];
const FILTER_LANGUAGES = ['Hindi', 'English'];

// "Sort by" sheet options (Figma 2696:6289), replicated as-is.
const SORT_OPTIONS = [
  'Recommended',
  'Highest Rated',
  'Budget-Friendly',
  'Price: Low to High',
  'Price: High to Low',
  'Distance',
];

type FilterKey = 'ratings' | 'budget' | 'urgency' | 'serviceTypes' | 'languages';
type FilterState = Record<FilterKey, string[]>;
// Figma 2696:6231 shows "English" pre-selected.
const INITIAL_FILTERS: FilterState = { ratings: [], budget: [], urgency: [], serviceTypes: [], languages: ['English'] };

// "+919812340002" → "+91-98****02"
const maskPhone = (phone: string) => {
  const match = phone.match(/^(\+\d{1,3})(\d{10})$/);
  if (!match) return phone;
  const digits = match[2];
  return `${match[1]}-${digits.slice(0, 2)}****${digits.slice(8)}`;
};

const isValidIndianMobile = (v: string) => /^[6-9]\d{9}$/.test(v);

type UnlockStep = 'form' | 'otp' | 'done' | null;

export const GuestBrowseServicesScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'GuestBrowse'>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [search, setSearch] = useState('');
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [compare, setCompare] = useState<string[]>([]);
  // Figma flow: the location sheet greets the guest as soon as they land here.
  const [showLocationSheet, setShowLocationSheet] = useState(true);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);

  // "Unlock more providers" gate flow
  const [unlockStep, setUnlockStep] = useState<UnlockStep>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const phone = `+91${mobile}`;
  const visibleOrgs = unlocked ? ORGANIZATIONS : ORGANIZATIONS.slice(0, GUEST_VISIBLE_COUNT);
  const lockedOrgs = unlocked ? [] : ORGANIZATIONS.slice(GUEST_VISIBLE_COUNT);

  // OTP resend countdown — only ticks while the OTP step is open.
  useEffect(() => {
    if (unlockStep !== 'otp' || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [unlockStep, resendIn]);

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev,
    );

  const toggleFilter = (key: FilterKey, value: string) =>
    setFilters((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const handleBack = () => {
    useAuthStore.getState().setGuest(false);
    navigation.goBack();
  };

  const handleLocationSearch = () => {
    setLocationLabel(locationQuery.trim() || DEFAULT_LOCATION_LABEL);
    setShowLocationSheet(false);
  };

  const openUnlock = () => {
    setFormError(null);
    setOtpError(null);
    setUnlockStep('form');
  };

  const closeUnlock = () => setUnlockStep(null);

  const requestOtp = async () => {
    await authService.requestOtp({ phone, role: useAuthStore.getState().role });
  };

  const handleSubmitDetails = async () => {
    if (submitting) return;
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!isValidIndianMobile(mobile)) {
      setFormError('Enter a valid 10-digit mobile number starting with 6–9.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await requestOtp();
      useAuthStore.getState().setPhone(phone);
      setOtpCode('');
      setResendIn(RESEND_SECONDS);
      setUnlockStep('otp');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (code: string = otpCode) => {
    if (submitting || code.length !== OTP_LENGTH) return;
    setSubmitting(true);
    setOtpError(null);
    try {
      const data = await authService.verifyOtp({ phone, code });
      useAuthStore.getState().setPhoneVerification(data);

      // An existing account: /auth/otp/verify already logged us in.
      if (data.accessToken) {
        useAuthStore.getState().setToken(data.accessToken);
        useUserStore.getState().setProfile({
          name: data.user ? `${data.user.firstName} ${data.user.lastName}`.trim() : fullName.trim(),
          email: data.user?.email ?? '',
          phone: data.user?.phone ?? phone,
          role: null,
          age: '',
        });
      } else {
        // New phone: no full account yet — keep browsing as a verified guest and
        // hold on to the details captured here for the eventual sign-up.
        useUserStore.getState().setProfile({
          name: fullName.trim(),
          email: '',
          phone,
          role: null,
          age: '',
        });
      }

      setUnlocked(true);
      setUnlockStep('done');
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || submitting) return;
    setSubmitting(true);
    setOtpError(null);
    setOtpCode('');
    try {
      await requestOtp();
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const renderOrgCard = (org: (typeof ORGANIZATIONS)[number], index: number, locked = false) => (
    <ComparePopUpCard
      key={org.id}
      title={org.name}
      imageUri={org.image ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
      location={org.city}
      distance={`${org.distanceKm} km`}
      rating={org.rating != null ? String(org.rating) : '-'}
      featured={org.featured}
      compareChecked={compare.includes(org.id)}
      onCompareToggle={locked ? undefined : () => toggleCompare(org.id)}
      onSeeDetailsPress={locked ? undefined : openUnlock}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: back + title */}
        <View style={styles.headerRow}>
          <IconButton type="back" bg={colors.accentPrimary} accessibilityLabel="Go back" onPress={handleBack} size={40} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Browse Services</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />

        {/* Location address row (Figma "Location Text") */}
        <View style={styles.locationRow}>
          <Pressable
            style={[styles.locationField, { borderColor: colors.border.card, backgroundColor: colors.background.base }]}
            onPress={() => setShowLocationSheet(true)}
            accessibilityRole="button"
            accessibilityLabel="Set your location"
          >
            <Icon name="location" variant="outline" size={20} color={colors.accentPrimary} />
            <Text
              style={[styles.locationText, { color: locationLabel ? colors.text.strong : colors.text.muted }]}
              numberOfLines={1}
            >
              {locationLabel ?? 'Enter Location Address'}
            </Text>
            <Icon name="navigationDown" variant="outline" size={16} color={colors.text.muted} />
          </Pressable>
          <Pressable
            style={[styles.locationGpsButton, { backgroundColor: colors.accentPrimary }]}
            onPress={() => setShowLocationSheet(true)}
            accessibilityRole="button"
            accessibilityLabel="Use current location"
          >
            <Icon name="placeLocation" variant="outline" size={22} color={colors.textInverse} />
          </Pressable>
        </View>

        <Spacer size="lg" />
        <SearchInput placeholder="Search" value={search} onChangeText={setSearch} />
        <Spacer size="lg" />

        {/* FILTER BY | SORT BY (Figma 2895:73743) */}
        <View style={[styles.filterRow, { borderColor: colors.border.hairline }]}>
          <Pressable style={styles.filterCell} onPress={() => setShowFilterSheet(true)}>
            <Text style={[styles.filterText, { color: colors.text.primary }]}>FILTER BY</Text>
          </Pressable>
          <View style={[styles.filterDivider, { backgroundColor: colors.border.hairline }]} />
          <Pressable style={styles.filterCell} onPress={() => setShowSortSheet(true)}>
            <Text style={[styles.filterText, { color: colors.text.primary }]}>SORT BY</Text>
          </Pressable>
        </View>

        <Spacer size="lg" />
        <Text style={[styles.countText, { color: colors.text.secondary }]}>
          {ORGANIZATIONS.length} organizations
        </Text>
        <Spacer size="md" />

        {/* Preview: the first few providers are fully visible (all, once unlocked) */}
        {visibleOrgs.map((org, i) => (
          <View key={org.id} style={styles.cardWrap}>{renderOrgCard(org, i)}</View>
        ))}

        {/* Locked: the rest of the list is dimmed behind the sign-up gate
            (Figma "Hide Providers" 2895:73764 + "View Providers" 2895:74214) */}
        {lockedOrgs.length > 0 && (
          <View style={styles.lockedSection}>
            <View style={styles.lockedList} pointerEvents="none">
              {lockedOrgs.map((org, i) => (
                <View key={org.id} style={styles.cardWrap}>{renderOrgCard(org, i + GUEST_VISIBLE_COUNT, true)}</View>
              ))}
            </View>
            <View
              style={[styles.lockedScrim, { backgroundColor: colors.background.layout }]}
              pointerEvents="none"
            />

            <View style={styles.gateOverlay} pointerEvents="box-none">
              <View
                style={[
                  styles.gateCard,
                  { backgroundColor: colors.background.base, borderColor: colors.border.hairline },
                ]}
              >
                <Text style={[styles.gateTitle, { color: colors.text.primary }]}>View Providers</Text>
                <Text style={[styles.gateBody, { color: colors.text.secondary }]}>
                  Enter your mobile number and OTP to unlock more providers.
                </Text>
                <PrimaryButton label="Unlock All Provider" onPress={openUnlock} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Visual bottom nav — every tab is gated for guests */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border.hairline,
            paddingBottom: insets.bottom || theme.spacing.md,
          },
        ]}
      >
        <View style={styles.bottomNavContent}>
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <Pressable key={item.key} style={styles.navItem} onPress={openUnlock} accessibilityRole="button">
              <Icon name={item.icon} variant="outline" size={24} color={colors.text.muted} />
              <Text style={[styles.navLabel, { color: colors.text.muted }]}>{item.label}</Text>
            </Pressable>
          ))}

          <Pressable style={styles.navItem} onPress={openUnlock} accessibilityRole="button" accessibilityLabel="Helpline">
            <View style={[styles.helplineFab, { backgroundColor: colors.accentOrange }]}>
              <Icon name="phone" variant="outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.navLabel, { color: colors.text.muted }]}>Helpline</Text>
          </Pressable>

          {NAV_ITEMS.slice(2).map((item) => (
            <Pressable key={item.key} style={styles.navItem} onPress={openUnlock} accessibilityRole="button">
              <Icon name={item.icon} variant="outline" size={24} color={colors.text.muted} />
              <Text style={[styles.navLabel, { color: colors.text.muted }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Location bottom sheet (Figma "Pop Up" 2696:4242) */}
      <Modal
        visible={showLocationSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationSheet(false)}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable style={styles.sheetBackdropFill} onPress={() => setShowLocationSheet(false)} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.background.layout, paddingBottom: (insets.bottom || theme.spacing.md) + theme.spacing.xxl },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }} />
              <IconButton
                type="close"
                bg={colors.accentPrimary}
                accessibilityLabel="Close"
                onPress={() => setShowLocationSheet(false)}
                size={40}
              />
            </View>

            <Spacer size="lg" />
            <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Ready to find the right care?</Text>
            <Spacer size="sm" />
            <Text style={[styles.sheetBody, { color: colors.text.secondary }]}>
              Tell us your location to see available providers nearby.
            </Text>

            <Spacer size="lg" />
            <SearchInput
              placeholder="Search"
              value={locationQuery}
              onChangeText={setLocationQuery}
              onSubmitEditing={handleLocationSearch}
              returnKeyType="search"
            />
            <Spacer size="lg" />
            <PrimaryButton label="Search" onPress={handleLocationSearch} />
          </View>
        </View>
      </Modal>

      {/* Unlock-more-providers flow (Figma 2895:78057 / 78101 / 78081) */}
      <Modal
        visible={unlockStep !== null}
        transparent
        animationType="slide"
        onRequestClose={closeUnlock}
      >
        <KeyboardAvoidingView
          style={styles.sheetBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.sheetBackdropFill} onPress={closeUnlock} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.background.layout, paddingBottom: (insets.bottom || theme.spacing.md) + theme.spacing.xxl },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }} />
              <IconButton type="close" bg={colors.accentPrimary} accessibilityLabel="Close" onPress={closeUnlock} size={40} />
            </View>

            {unlockStep === 'form' && (
              <>
                <Spacer size="sm" />
                <Text style={[styles.sheetSubtitle, { color: colors.text.primary }]}>View More Provider</Text>
                <Spacer size="md" />
                <Text style={[styles.sheetBody, { color: colors.text.secondary }]}>
                  Provide your full name and mobile number to access provider profiles, pricing, and
                  availability details.
                </Text>
                <Spacer size="lg" />

                <TextInput
                  label="Full Name"
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={(v) => {
                    setFullName(v);
                    if (formError) setFormError(null);
                  }}
                  autoCapitalize="words"
                />

                <TextInput
                  label="Mobile Number"
                  placeholder="000-000-0000"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={(v) => {
                    setMobile(v.replace(/\D/g, '').slice(0, 10));
                    if (formError) setFormError(null);
                  }}
                  prefixIcon={
                    <View style={styles.countryCode}>
                      <Text style={[styles.countryCodeText, { color: colors.text.primary }]}>(+91)</Text>
                      <Icon name="navigationDown" variant="outline" size={14} color={colors.text.secondary} />
                      <View style={[styles.countryCodeDivider, { backgroundColor: colors.border.hairline }]} />
                    </View>
                  }
                  error={formError ?? undefined}
                />

                <Spacer size="md" />
                <PrimaryButton label="Unlock All Provider" onPress={handleSubmitDetails} loading={submitting} />
              </>
            )}

            {unlockStep === 'otp' && (
              <>
                <Spacer size="sm" />
                <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Enter verification code</Text>
                <Spacer size="md" />
                <Text style={[styles.sheetBody, { color: colors.text.secondary }]}>
                  The OTP has been sent to your verified mobile{' '}
                  <Text style={[styles.sheetBodyStrong, { color: colors.text.primary }]}>{maskPhone(phone)}</Text>
                </Text>

                <Spacer size="lg" />
                <OTPInput
                  length={OTP_LENGTH}
                  value={otpCode}
                  onChange={(v) => {
                    setOtpCode(v);
                    if (otpError) setOtpError(null);
                  }}
                  onComplete={(code) => handleVerifyOtp(code)}
                  error={!!otpError}
                />
                {otpError && (
                  <>
                    <Spacer size="sm" />
                    <Text style={styles.errorText}>{otpError}</Text>
                  </>
                )}

                <Spacer size="xl" />
                <PrimaryButton
                  label="Continue"
                  onPress={() => handleVerifyOtp()}
                  loading={submitting}
                  disabled={otpCode.length !== OTP_LENGTH}
                />

                <Spacer size="lg" />
                <Text style={[styles.resendText, { color: colors.text.secondary }]}>
                  {"Didn't receive OTP? "}
                  {resendIn > 0 ? (
                    <Text style={[styles.sheetBodyStrong, { color: colors.text.primary }]}>
                      Resend in 00:{String(resendIn).padStart(2, '0')}
                    </Text>
                  ) : (
                    <Text style={[styles.resendLink, { color: colors.accentPrimary }]} onPress={handleResend}>
                      {submitting ? 'Sending…' : 'Resend'}
                    </Text>
                  )}
                </Text>
              </>
            )}

            {unlockStep === 'done' && (
              <>
                <Spacer size="sm" />
                <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>{"You're All Set!"}</Text>
                <Spacer size="md" />
                <Text style={[styles.sheetBody, { color: colors.text.secondary }]}>
                  Your mobile number has been verified. You can now view more providers.
                </Text>
                <Spacer size="lg" />
                <PrimaryButton label="View Providers" onPress={closeUnlock} />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* "Filter by" sheet (Figma 2696:6231) */}
      <Modal
        visible={showFilterSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable style={styles.sheetBackdropFill} onPress={() => setShowFilterSheet(false)} />
          <View style={[styles.sheet, styles.filterSheet, { backgroundColor: colors.background.layout }]}>
            <View style={styles.sheetHeader}>
              <View style={{ width: 40 }} />
              <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Filter by</Text>
              <IconButton
                type="close"
                bg={colors.accentPrimary}
                accessibilityLabel="Close"
                onPress={() => setShowFilterSheet(false)}
                size={40}
              />
            </View>

            <ScrollView
              style={styles.filterScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.filterScroll,
                { paddingBottom: (insets.bottom || theme.spacing.md) + theme.spacing.lg },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {/* Find Type of Facilities */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Find Type of Facilities <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.selectField, { backgroundColor: colors.background.base, borderColor: colors.border.hairline }]}>
                <Text style={[styles.selectPlaceholder, { color: colors.text.muted }]}>Care Facilities</Text>
                <Icon name="navigationDown" variant="outline" size={16} color={colors.text.muted} />
              </View>

              {/* Search Type of Each Facilities */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Search Type of Each Facilities <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.selectField, { backgroundColor: colors.background.base, borderColor: colors.border.hairline }]}>
                <Text style={[styles.selectPlaceholder, { color: colors.text.muted }]}>Search type of Care Facilities</Text>
                <Icon name="navigationDown" variant="outline" size={16} color={colors.text.muted} />
              </View>

              {/* Ratings */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Ratings <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipGrid}>
                {FILTER_RATINGS.map((item) => (
                  <SelectableChip
                    key={item}
                    label={item}
                    selected={filters.ratings.includes(item)}
                    onPress={() => toggleFilter('ratings', item)}
                    style={styles.chipHalf}
                  />
                ))}
              </View>

              {/* Monthly Budget Range */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Monthly Budget Range <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipStack}>
                {FILTER_BUDGETS.map((item) => (
                  <SelectableChip
                    key={item}
                    label={item}
                    selected={filters.budget.includes(item)}
                    onPress={() => toggleFilter('budget', item)}
                    style={styles.chipFull}
                  />
                ))}
              </View>

              {/* Urgency */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Urgency <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipStack}>
                {FILTER_URGENCY.map((item) => (
                  <SelectableChip
                    key={item}
                    label={item}
                    selected={filters.urgency.includes(item)}
                    onPress={() => toggleFilter('urgency', item)}
                    style={styles.chipFull}
                  />
                ))}
              </View>

              {/* Type of Service */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Type of Service <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipGrid}>
                {FILTER_SERVICE_TYPES.map((item) => (
                  <SelectableChip
                    key={item}
                    label={item}
                    selected={filters.serviceTypes.includes(item)}
                    onPress={() => toggleFilter('serviceTypes', item)}
                    style={styles.chipHalf}
                  />
                ))}
              </View>

              {/* Language */}
              <Text style={[styles.filterGroupLabel, { color: colors.text.primary }]}>
                Language <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipGrid}>
                {FILTER_LANGUAGES.map((item) => (
                  <SelectableChip
                    key={item}
                    label={item}
                    selected={filters.languages.includes(item)}
                    onPress={() => toggleFilter('languages', item)}
                    style={styles.chipHalf}
                  />
                ))}
              </View>

              <Spacer size="lg" />
              <PrimaryButton label="Save" onPress={() => setShowFilterSheet(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* "Sort by" sheet (Figma 2696:6289) */}
      <Modal
        visible={showSortSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortSheet(false)}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable style={styles.sheetBackdropFill} onPress={() => setShowSortSheet(false)} />
          <View
            style={[
              styles.sheet,
              styles.filterSheet,
              {
                backgroundColor: colors.background.layout,
                paddingBottom: (insets.bottom || theme.spacing.md) + theme.spacing.lg,
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={{ width: 40 }} />
              <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Sort by</Text>
              <IconButton
                type="close"
                bg={colors.accentPrimary}
                accessibilityLabel="Close"
                onPress={() => setShowSortSheet(false)}
                size={40}
              />
            </View>

            <Spacer size="lg" />
            <View style={styles.chipStack}>
              {SORT_OPTIONS.map((item) => (
                <SelectableChip
                  key={item}
                  label={item}
                  selected={sortBy === item}
                  onPress={() => setSortBy((prev) => (prev === item ? null : item))}
                  style={styles.chipFull}
                />
              ))}
            </View>

            <View style={{ flex: 1 }} />
            <PrimaryButton label="Save" onPress={() => setShowSortSheet(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.layout,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 140, // clear the bottom nav
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  locationField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
  },
  locationText: {
    flex: 1,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
  locationGpsButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.forestGreen[100],
    marginHorizontal: -theme.spacing.xl,
  },
  filterCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  filterDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.forestGreen[100],
  },
  filterText: {
    fontFamily: theme.typography.smallCaption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.smallCaption.fontSize),
    color: theme.colors.neutral[900],
    letterSpacing: 0.5,
  },
  countText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
  },
  cardWrap: {
    marginBottom: theme.spacing.lg,
  },
  lockedSection: {
    position: 'relative',
  },
  lockedList: {
    opacity: 0.4,
  },
  lockedScrim: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  gateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 44, // let one dimmed card peek above the gate, per Figma
  },
  gateCard: {
    width: '100%',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.lg,
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  bottomNavContent: {
    flexDirection: 'row',
    minHeight: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 48,
  },
  navLabel: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(14),
    lineHeight: 20,
    marginTop: 4,
  },
  helplineFab: {
    width: 56,
    height: 56,
    borderRadius: 200,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 25, 10, 0.9)',
    justifyContent: 'flex-end',
  },
  sheetBackdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
  },
  filterSheet: {
    flex: 1,
    marginTop: theme.spacing.xxxl,
  },
  filterScrollView: {
    flex: 1,
  },
  filterScroll: {
    paddingTop: theme.spacing.lg,
  },
  filterGroupLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.status.error,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
  },
  selectPlaceholder: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chipStack: {
    gap: theme.spacing.sm,
  },
  chipHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  chipFull: {
    width: '100%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  sheetBody: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  sheetBodyStrong: {
    fontFamily: theme.fonts.bold,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
  },
  countryCodeText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(16),
  },
  countryCodeDivider: {
    width: 1.5,
    height: 24,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  resendText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  resendLink: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
});

export default GuestBrowseServicesScreen;
