import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput } from '@/components/inputs';
import { HomeInfoCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import { BrandLogoSVG } from '@/components/BrandLogoSVG';
import { responsiveFontSize } from '@/utils/responsive';
import { useUserStore } from '@/store/user.store';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemePalette } from '@/theme/palette';
import { EwsHomeCard } from '@/features/ews/components/EwsHomeCard';

// "Home" (Figma 1248:44660) — new-user landing state with empty task/request/event sections.

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatToday = (): string =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  colors: ThemePalette;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll, colors }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
    <Pressable style={styles.viewAll} onPress={onViewAll}>
      <Text style={styles.viewAllText}>View All</Text>
      <Icon name="navigationRight" variant="outline" size={20} color={theme.colors.primary} />
    </Pressable>
  </View>
);

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const userName = useUserStore((s) => s.profile?.name) ?? 'Kamala';
  const colors = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + theme.spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand logo */}
        <View style={styles.logoRow}>
          <BrandLogoSVG width={135} height={36} />
        </View>

        <Spacer size="lg" />

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={[styles.greeting, { color: colors.text.primary }]}>{getGreeting()} {userName},</Text>
            <Text style={[styles.date, { color: colors.text.secondary }]}>{formatToday()}</Text>
          </View>
          <View style={styles.avatar}>
            <Icon name="profile" variant="outline" size={28} color={theme.colors.primary} />
          </View>
        </View>

        <Spacer size="xl" />

        {/* Quote of the day card */}
        <HomeInfoCard
          status="quote"
          buttonLabel="How are you feeling today?"
        />

        <Spacer size="lg" />

        {/* Elder Wellbeing Score — Figma "Hub" Wellbeing card (3344:324314) */}
        <EwsHomeCard />

        <Spacer size={40} />

        {/* Today's Task */}
        <SectionHeader title="Today’s Task" colors={colors} />
        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>There are no tasks scheduled today.</Text>

        <Spacer size={40} />

        {/* Track Requests */}
        <SectionHeader title="Track Requests" colors={colors} />
        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>There are no request today.</Text>

        <Spacer size={40} />

        {/* Upcoming events */}
        <SectionHeader title="Upcoming events" colors={colors} />
        <View style={styles.eventsEmpty}>
          <Icon name="celebrate" variant="filled" size={72} />
          <Spacer size="md" />
          <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>There are no event scheduled.</Text>
          <Spacer size="lg" />
          <PrimaryButton label="Join your Social event" onPress={() => {}} style={styles.eventButton} />
        </View>

        <Spacer size="xxl" />

        {/* Ask bar */}
        <TextInput
          label="Ask me any question or find something"
          placeholder="Type your question"
          value={question}
          onChangeText={setQuestion}
        />
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
    paddingBottom: 120, // clear the floating bottom tab bar
  },
  logoRow: {
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
  },
  date: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    marginTop: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.forestGreen[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: theme.colors.primary,
  },
  emptyText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  eventsEmpty: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  eventButton: {
    width: 'auto',
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
});

export default HomeScreen;
