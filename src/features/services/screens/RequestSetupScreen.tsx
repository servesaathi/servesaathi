import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Modal } from 'react-native';
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
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemePalette } from '@/theme/palette';
import {
  WEEKDAY_ABBR,
  MONTH_NAMES,
  startOfDay,
  isSameDay,
  buildWeekStrip,
  buildMonthGrid,
  toDateISO,
} from '../utils/scheduleDate';

// "Request Set up" (Figma 1256:24696) — connect-method, schedule and reminder form.

const METHODS = ['Direct Call', 'Request Callback', 'Schedule a Site Visit', 'Virtual Consulation'];

// Each day-part offers its own block of slots (Figma only specced Morning;
// Afternoon/Evening follow the same "first and last slot unavailable" shape).
const TIME_SLOTS_BY_PART: Array<Array<{ time: string; disabled?: boolean }>> = [
  [
    // Morning
    { time: '8:00 AM', disabled: true },
    { time: '8:30 AM', disabled: true },
    { time: '9:00 AM' },
    { time: '9:30 AM' },
    { time: '10:00 AM' },
    { time: '10:30 AM' },
    { time: '11:00 AM' },
    { time: '11:30 AM' },
    { time: '12:00 PM', disabled: true },
  ],
  [
    // Afternoon
    { time: '12:00 PM', disabled: true },
    { time: '12:30 PM' },
    { time: '1:00 PM' },
    { time: '1:30 PM' },
    { time: '2:00 PM' },
    { time: '2:30 PM' },
    { time: '3:00 PM' },
    { time: '3:30 PM' },
    { time: '4:00 PM', disabled: true },
  ],
  [
    // Evening
    { time: '4:00 PM', disabled: true },
    { time: '4:30 PM' },
    { time: '5:00 PM' },
    { time: '5:30 PM' },
    { time: '6:00 PM' },
    { time: '6:30 PM' },
    { time: '7:00 PM' },
    { time: '7:30 PM' },
    { time: '8:00 PM', disabled: true },
  ],
];
const firstAvailableTime = (slots: Array<{ time: string; disabled?: boolean }>): string | null =>
  slots.find((s) => !s.disabled)?.time ?? null;

const BackArrow = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckBadge = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 1l2.4 2.1 3.1-.5 1.1 3 3 1.1-.5 3.1L23 12l-2.1 2.4.5 3.1-3 1.1-1.1 3-3.1-.5L12 23l-2.4-2.1-3.1.5-1.1-3-3-1.1.5-3.1L1 12l2.1-2.4-.5-3.1 3-1.1 1.1-3 3.1.5L12 1z" />
    <Path d="M8 12l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronLeft = ({ color }: { color: string }) => (
  <Svg width="10" height="16" viewBox="0 0 10 16" fill="none">
    <Path d="M9 1L1 8l8 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ChevronRight = ({ color }: { color: string }) => (
  <Svg width="10" height="16" viewBox="0 0 10 16" fill="none">
    <Path d="M1 1l8 7-8 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface CalendarSheetProps {
  month: Date;
  selectedDate: Date;
  today: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: Date) => void;
  onClose: () => void;
  colors: ThemePalette;
}

// Full month calendar for "choose a date" — the 5-day strip on the main
// screen only shows the next 5 days from whatever's picked here.
const CalendarSheet: React.FC<CalendarSheetProps> = ({
  month, selectedDate, today, onPrevMonth, onNextMonth, onSelectDay, onClose, colors,
}) => {
  const insets = useSafeAreaInsets();
  const grid = useMemo(() => buildMonthGrid(month), [month]);
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={calendarStyles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            calendarStyles.sheet,
            { backgroundColor: colors.background.layout, paddingBottom: (insets.bottom || theme.spacing.md) + theme.spacing.xl },
          ]}
        >
          <View style={calendarStyles.header}>
            <Text style={[calendarStyles.title, { color: colors.text.primary }]}>Choose a Date</Text>
            <IconButton type="close" bg={colors.accentPrimary} accessibilityLabel="Close" onPress={onClose} size={40} />
          </View>

          <Spacer size="lg" />
          <View style={calendarStyles.monthNav}>
            <Pressable
              onPress={onPrevMonth}
              disabled={isCurrentMonth}
              style={[calendarStyles.navButton, { opacity: isCurrentMonth ? 0.3 : 1 }]}
              accessibilityLabel="Previous month"
            >
              <ChevronLeft color={colors.accentPrimary} />
            </Pressable>
            <Text style={[calendarStyles.monthLabel, { color: colors.text.primary }]}>
              {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
            </Text>
            <Pressable onPress={onNextMonth} style={calendarStyles.navButton} accessibilityLabel="Next month">
              <ChevronRight color={colors.accentPrimary} />
            </Pressable>
          </View>

          <Spacer size="md" />
          <View style={calendarStyles.weekdayRow}>
            {WEEKDAY_ABBR.map((w) => (
              <Text key={w} style={[calendarStyles.weekdayText, { color: colors.text.tertiary }]}>
                {w}
              </Text>
            ))}
          </View>

          <Spacer size="sm" />
          <View style={calendarStyles.grid}>
            {grid.map((day, i) => {
              if (!day) return <View key={`blank-${i}`} style={calendarStyles.cell} />;
              const isPast = day < today;
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              return (
                <Pressable
                  key={day.toISOString()}
                  style={calendarStyles.cell}
                  disabled={isPast}
                  onPress={() => onSelectDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`${MONTH_NAMES[day.getMonth()]} ${day.getDate()}`}
                >
                  <View
                    style={[
                      calendarStyles.dayCircle,
                      isSelected && { backgroundColor: colors.accentOrange },
                      !isSelected && isToday && { borderWidth: 1.5, borderColor: colors.accentOrange },
                    ]}
                  >
                    <Text
                      style={[
                        calendarStyles.dayText,
                        { color: isSelected ? colors.textInverse : isPast ? colors.text.muted : colors.text.primary },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const calendarStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 25, 10, 0.9)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayText: {
    flexBasis: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(12),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    flexBasis: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(15),
  },
});

export const RequestSetupScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'RequestSetup'>>();
  const route = useRoute<RootRouteProp<'RequestSetup'>>();
  const org = getOrganization(route.params?.orgId ?? 'agewell');
  const isBooking = route.params?.isBooking ?? false;
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [fav, setFav] = useState(false);
  const [method, setMethod] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const weekStrip = useMemo(() => buildWeekStrip(selectedDate), [selectedDate]);

  const [dayPart, setDayPart] = useState(0);
  const timeSlots = TIME_SLOTS_BY_PART[dayPart];
  const [time, setTime] = useState<string | null>(firstAvailableTime(timeSlots));
  const [reminder, setReminder] = useState(true);
  const [notes, setNotes] = useState('');

  const canConfirm = method !== null && time !== null;

  const handleDayPartChange = (index: number) => {
    setDayPart(index);
    // Each day-part has its own slot list — the previously picked time may
    // not exist in it, so fall back to that part's first open slot.
    setTime(firstAvailableTime(TIME_SLOTS_BY_PART[index]));
  };

  const openCalendar = () => {
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setShowCalendar(true);
  };

  const handlePickDay = (day: Date) => {
    setSelectedDate(day);
    setShowCalendar(false);
  };

  const handleConfirm = () => {
    if (!canConfirm || !method || !time) return;
    navigation.navigate('RequestDetails', {
      orgId: org.id,
      isBooking,
      // Carried forward so Request Details shows the real pick (and "Edit"
      // there can send the guest back here — see RequestDetailsScreen).
      requestValues: { method, dateISO: toDateISO(selectedDate), time, notes, reminder },
    });
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
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Request</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />
        <StatusChip label="Verified Partner" variant="softGreen" icon={<CheckBadge color={colors.accentPrimary} />} style={styles.verifiedChip} />
        <Spacer size="md" />
        <View style={styles.nameRow}>
          <Text style={[styles.orgName, { color: colors.text.primary }]}>{org.name}</Text>
          <FavoriteButton active={fav} onPress={() => setFav((v) => !v)} />
        </View>

        <Spacer size="lg" />
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Complete Your Request</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Choose how you’d like to connect</Text>

        <Spacer size="lg" />
        <Text style={[styles.groupLabel, { color: colors.text.primary }]}>How would you like to proceed?</Text>
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
          <Text style={[styles.groupLabel, { color: colors.text.primary }]}>Schedule</Text>
          <Pressable style={styles.monthRow} onPress={openCalendar} accessibilityRole="button" accessibilityLabel="Choose a date">
            <Text style={[styles.monthText, { color: colors.accentPrimary }]}>{MONTH_NAMES[selectedDate.getMonth()]}</Text>
            <Icon name="navigationRight" variant="outline" size={20} color={colors.accentPrimary} />
          </Pressable>
        </View>
        <Spacer size="sm" />
        <View style={styles.datesRow}>
          {weekStrip.map((d) => (
            <DateCard
              key={d.toISOString()}
              date={String(d.getDate())}
              week={WEEKDAY_ABBR[d.getDay()]}
              selected={isSameDay(d, selectedDate)}
              onPress={() => setSelectedDate(d)}
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
          onChange={handleDayPartChange}
          variant="filled"
        />

        <Spacer size="lg" />
        <View style={styles.timesGrid}>
          {timeSlots.map((slot) => (
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
          <Text style={[styles.groupLabel, { color: colors.text.primary }]}>Set up a reminder</Text>
          <ToggleSwitch value={reminder} onValueChange={setReminder} color="orange" />
        </View>
        <Spacer size="md" />
        <View style={styles.reminderPickRow}>
          <Text style={[styles.reminderLabel, { color: colors.text.strong }]}>Reminder</Text>
          <Pressable style={[styles.dropdown, { backgroundColor: colors.background.base, borderColor: colors.border.card }]}>
            <Text style={[styles.dropdownText, { color: colors.text.strong }]}>Before 1 hour</Text>
            <Svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <Path d="M1 1l5 5 5-5" stroke={colors.text.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

      {showCalendar && (
        <CalendarSheet
          month={calendarMonth}
          selectedDate={selectedDate}
          today={today}
          onPrevMonth={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          onNextMonth={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          onSelectDay={handlePickDay}
          onClose={() => setShowCalendar(false)}
          colors={colors}
        />
      )}
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
