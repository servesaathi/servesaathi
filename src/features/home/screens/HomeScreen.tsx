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
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
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

  return (
    <View style={styles.root}>
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
            <Text style={styles.greeting}>{getGreeting()} {userName},</Text>
            <Text style={styles.date}>{formatToday()}</Text>
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

        <Spacer size={40} />

        {/* Today's Task */}
        <SectionHeader title="Today’s Task" />
        <Text style={styles.emptyText}>There are no tasks scheduled today.</Text>

        <Spacer size={40} />

        {/* Track Requests */}
        <SectionHeader title="Track Requests" />
        <Text style={styles.emptyText}>There are no request today.</Text>

        <Spacer size={40} />

        {/* Upcoming events */}
        <SectionHeader title="Upcoming events" />
        <View style={styles.eventsEmpty}>
          <Icon name="events" variant="outline" size={72} color={theme.colors.tertiary} />
          <Spacer size="md" />
          <Text style={styles.emptyText}>There are no event scheduled.</Text>
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
