import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer, SegmentedTabs } from '@/components/layouts';
import { IconButton } from '@/components/buttons';
import { SearchInput } from '@/components/inputs';
import { OrganizationCard } from '@/components/cards';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemePalette } from '@/theme/palette';
import type { ServiceCategory } from '../data';
import { CategoryGrid } from '../components/CategoryGrid';

// "Our Service - My Services / All Services" (Figma 1255:26894 / 1255:26926).

interface SectionHeaderProps {
  title: string;
  right?: string;
  rightArrow?: boolean;
  colors: ThemePalette;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, right, rightArrow, colors }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
    <View style={styles.sectionRight}>
      {right && <Text style={styles.sectionRightText}>{right}</Text>}
      {rightArrow && (
        <Icon name="navigationRight" variant="outline" size={20} color={theme.colors.primary} />
      )}
    </View>
  </View>
);

export const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Home'>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0); // 0 = My Services, 1 = All Services

  // Every category opens the provider list filtered to it (GET /providers?categoryId=).
  const handleCategoryPress = (category: ServiceCategory) =>
    navigation.navigate('CaregiverList', { serviceType: category.label, categoryId: category.id });

  return (
    <View style={[styles.root, { backgroundColor: colors.background.layout }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: back + title + notification bell */}
        <View style={styles.headerRow}>
          <IconButton
            type="back"
            accessibilityLabel="Go back"
            onPress={() => navigation.navigate('Home')}
            size={40}
          />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Our Service</Text>
          <IconButton
            type="custom"
            icon={<Icon name="notification" variant="outline" size={22} color="#FFFFFF" />}
            accessibilityLabel="Notifications"
            onPress={() => {}}
            size={40}
          />
        </View>

        <Spacer size="lg" />

        {/* Green banner */}
        <LinearGradient
          colors={[theme.colors.forestGreen[500], theme.colors.forestGreen[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerSmall}>What do you need today?</Text>
          <Text style={styles.bannerTitle}>Care at your Doorstep</Text>
          <Text style={styles.bannerSmall}>Trusted help, whenever you need.</Text>
        </LinearGradient>

        <Spacer size="xl" />
        <SearchInput placeholder="Search for service" value={search} onChangeText={setSearch} />

        <Spacer size="lg" />
        <SegmentedTabs
          options={['My Services', 'All Services']}
          activeIndex={tab}
          onChange={setTab}
          variant="filled"
        />

        <Spacer size="xxl" />

        {tab === 0 ? (
          <>
            <SectionHeader title="Upcoming Services" right="3 bookings" colors={colors} />
            <Spacer size="md" />
            <OrganizationCard
              title="Yoga & Wellness"
              place="Zoom"
              date="23 April"
              time="9:00 AM"
              status="category"
              categoryLabel="Social Events"
              icon={<Icon name="companion" variant="outline" size={24} color={theme.colors.primary} />}
            />

            <Spacer size="xxl" />
            <SectionHeader title="Saved Services" right="2 saved" colors={colors} />
            <Spacer size="md" />
            <OrganizationCard
              title="Nutrition Education Workshops"
              place="Online"
              date="Saved for Later"
              time="21 April"
              status="category"
              categoryLabel="Social Events"
              icon={<Icon name="food" variant="outline" size={24} color={theme.colors.primary} />}
            />

            <Spacer size="xxl" />
            <SectionHeader title="Past History" right="View All" rightArrow colors={colors} />
            <Spacer size="md" />
            <OrganizationCard
              title="Caregiver: HelpAge India"
              place=""
              date="12 April"
              time="5:00 PM"
              status="category"
              categoryLabel="Care & Support"
              icon={<Icon name="caregiver" variant="outline" size={24} color={theme.colors.primary} />}
            />
          </>
        ) : (
          <>
            <Text style={[styles.gridTitle, { color: colors.text.primary }]}>What do you need help with?</Text>
            <Spacer size="lg" />
            <CategoryGrid onSelect={handleCategoryPress} />
          </>
        )}
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
  banner: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    gap: 2,
  },
  bannerSmall: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: '#FFFFFF',
  },
  bannerTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: '#FFFFFF',
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
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionRightText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(14),
    color: theme.colors.primary,
  },
  gridTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
});

export default ServicesScreen;
