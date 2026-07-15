import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer, SegmentedTabs } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/buttons';
import { TextInput, SelectableChip, ToggleSwitch } from '@/components/inputs';
import { StatusChip, FavoriteButton, DateCard, TimeCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { getOrganization } from '../data';

// "Request Set up" (Figma 1256:24696) — connect-method, schedule and reminder form.

const METHODS = ['Direct Call', 'Request Callback', 'Schedule a Site Visit', 'Virtual Consulation'];
const DATES = [
  { date: '15', week: 'WED' },
  { date: '16', week: 'THU' },
  { date: '17', week: 'FRI' },
  { date: '18', week: 'SAT' },
  { date: '19', week: 'SUN' },
];
const TIME_SLOTS: Array<{ time: string; disabled?: boolean }> = [
  { time: '8:00 AM', disabled: true },
  { time: '8:30 AM', disabled: true },
  { time: '9:00 AM' },
  { time: '9:30 AM' },
  { time: '10:00 AM' },
  { time: '10:30 AM' },
  { time: '11:00 AM' },
  { time: '11:30 AM' },
  { time: '12:00 PM', disabled: true },
];

const BackArrow = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckBadge = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={theme.colors.primary}>
    <Path d="M12 1l2.4 2.1 3.1-.5 1.1 3 3 1.1-.5 3.1L23 12l-2.1 2.4.5 3.1-3 1.1-1.1 3-3.1-.5L12 23l-2.4-2.1-3.1.5-1.1-3-3-1.1.5-3.1L1 12l2.1-2.4-.5-3.1 3-1.1 1.1-3 3.1.5L12 1z" />
    <Path d="M8 12l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const RequestSetupScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RequestSetup'>>();
  const route = useRoute<RootRouteProp<'RequestSetup'>>();
  const org = getOrganization(route.params?.orgId ?? 'agewell');
  const insets = useSafeAreaInsets();

  const [fav, setFav] = useState(false);
  const [method, setMethod] = useState<string | null>(null);
  const [date, setDate] = useState('15');
  const [dayPart, setDayPart] = useState(0);
  const [time, setTime] = useState('9:00 AM');
  const [reminder, setReminder] = useState(true);
  const [notes, setNotes] = useState('');

  const canConfirm = method !== null && time !== null;

  const handleConfirm = () => {
    if (!canConfirm) return;
    navigation.navigate('RequestDetails');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <IconButton type="back" accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={styles.headerTitle}>Request</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />
        <StatusChip label="Verified Partner" variant="softGreen" icon={<CheckBadge />} style={styles.verifiedChip} />
        <Spacer size="md" />
        <View style={styles.nameRow}>
          <Text style={styles.orgName}>{org.name}</Text>
          <FavoriteButton active={fav} onPress={() => setFav((v) => !v)} />
        </View>

        <Spacer size="lg" />
        <Text style={styles.sectionTitle}>Complete Your Request</Text>
        <Text style={styles.subtitle}>Choose how you’d like to connect</Text>

        <Spacer size="lg" />
        <Text style={styles.groupLabel}>How would you like to proceed?</Text>
        <View style={styles.chipCol}>
          {METHODS.map((m) => (
            <SelectableChip
              key={m}
              label={m}
              selected={method === m}
              onPress={() => setMethod(m)}
              style={styles.chipFull}
            />
          ))}
        </View>

        <Spacer size="lg" />
        <View style={styles.scheduleHeader}>
          <Text style={styles.groupLabel}>Schedule</Text>
          <Pressable style={styles.monthRow}>
            <Text style={styles.monthText}>April</Text>
            <Icon name="navigationRight" variant="outline" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>
        <Spacer size="sm" />
        <View style={styles.datesRow}>
          {DATES.map((d) => (
            <DateCard
              key={d.date}
              date={d.date}
              week={d.week}
              selected={date === d.date}
              onPress={() => setDate(d.date)}
              style={styles.dateCard}
            />
          ))}
        </View>

        <Spacer size="xl" />
        <Text style={styles.groupLabel}>Preferred Time to connect</Text>
        <Spacer size="sm" />
        <SegmentedTabs
          options={['Morning', 'Afternoon', 'Evening']}
          activeIndex={dayPart}
          onChange={setDayPart}
          variant="filled"
        />

        <Spacer size="lg" />
        <View style={styles.timesGrid}>
          {TIME_SLOTS.map((slot) => (
            <TimeCard
              key={slot.time}
              time={slot.time}
              status={slot.disabled ? 'disabled' : time === slot.time ? 'selected' : 'default'}
              onPress={() => setTime(slot.time)}
              style={styles.timeCard}
            />
          ))}
        </View>

        <Spacer size="xl" />
        <View style={styles.reminderRow}>
          <Text style={styles.groupLabel}>Set up a reminder</Text>
          <ToggleSwitch value={reminder} onValueChange={setReminder} color="orange" />
        </View>
        <Spacer size="md" />
        <View style={styles.reminderPickRow}>
          <Text style={styles.reminderLabel}>Reminder</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>Before 1 hour</Text>
            <Svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <Path d="M1 1l5 5 5-5" stroke={theme.colors.neutral[700]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
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

        <Spacer size="xl" />
        <View style={styles.footerRow}>
          <SecondaryButton label="Back" onPress={() => navigation.goBack()} prefixIcon={<BackArrow />} style={styles.footerBtn} />
          <PrimaryButton label="Confirm" onPress={handleConfirm} disabled={!canConfirm} style={styles.footerBtn} />
        </View>
        <Spacer size="xl" />
      </ScrollView>
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
    paddingBottom: 24,
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
  verifiedChip: {
    alignSelf: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orgName: {
    flex: 1,
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  sectionTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[900],
  },
  subtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    marginTop: 2,
  },
  groupLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  chipCol: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chipFull: {
    width: '100%',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monthText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.primary,
  },
  datesRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dateCard: {
    flex: 1,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeCard: {
    flexBasis: '30%',
    flexGrow: 1,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.base,
    borderWidth: 1.5,
    borderColor: theme.colors.forestGreen[100],
    borderRadius: 10,
    paddingHorizontal: theme.spacing.lg,
    height: 44,
  },
  dropdownText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  footerBtn: {
    flex: 1,
    width: 'auto',
  },
});

export default RequestSetupScreen;
