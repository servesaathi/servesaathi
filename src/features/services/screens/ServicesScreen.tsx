import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Modal } from 'react-native';
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
import { SERVICE_CATEGORIES, INFRASTRUCTURE_OPTIONS } from '../data';

// "Our Service - My Services / All Services" (Figma 1255:26894 / 1255:26926)
// plus the "Infrastructure" picker sheet (1256:23704).

interface SectionHeaderProps {
  title: string;
  right?: string;
  rightArrow?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, right, rightArrow }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
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
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0); // 0 = My Services, 1 = All Services
  const [showInfrastructure, setShowInfrastructure] = useState(false);

  const handleCategoryPress = (categoryId: string) => {
    // Only Infrastructure has a designed flow so far
    if (categoryId === 'infrastructure') setShowInfrastructure(true);
  };

  const handleInfrastructureOption = (label: string) => {
    setShowInfrastructure(false);
    navigation.navigate('PersonalizedQuestions', { serviceType: label });
  };

  return (
    <View style={styles.root}>
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
          <Text style={styles.headerTitle}>Our Service</Text>
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
            <SectionHeader title="Upcoming Services" right="3 bookings" />
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
            <SectionHeader title="Saved Services" right="2 saved" />
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
            <SectionHeader title="Past History" right="View All" rightArrow />
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
            <Text style={styles.gridTitle}>What do you need help with?</Text>
            <Spacer size="lg" />
            <View style={styles.grid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(cat.id)}
                >
                  <View style={styles.categoryArch}>
                    <Icon name={cat.icon} variant="outline" size={40} color={theme.colors.tertiary} />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Infrastructure picker sheet (Figma 1256:23704) */}
      {showInfrastructure && (
        <Modal visible animationType="slide" transparent onRequestClose={() => setShowInfrastructure(false)}>
          <View style={styles.modalRoot}>
            <View style={[styles.modalSheet, { paddingTop: insets.top + theme.spacing.xxl }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Infrastructure</Text>
                <IconButton
                  type="close"
                  accessibilityLabel="Close"
                  onPress={() => setShowInfrastructure(false)}
                  size={40}
                />
              </View>
              <Spacer size="xxl" />
              <Text style={styles.modalQuestion}>Who needs care?</Text>
              <Text style={styles.modalSubtitle}>Help us personalize your search</Text>
              <Spacer size="xl" />

              <View style={styles.optionList}>
                {INFRASTRUCTURE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={styles.optionCard}
                    onPress={() => handleInfrastructureOption(opt.label)}
                  >
                    <View style={styles.optionIcon}>
                      <Icon name={opt.icon} variant="outline" size={24} color={theme.colors.tertiary} />
                    </View>
                    <View>
                      <Text style={styles.optionTitle}>{opt.label}</Text>
                      <Text style={styles.optionCaption}>{opt.available} available</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  categoryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  categoryArch: {
    width: '100%',
    height: 76,
    backgroundColor: theme.colors.vividOrange[100],
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryLabel: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[800],
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(9, 25, 10, 0.9)',
  },
  modalSheet: {
    flex: 1,
    marginTop: theme.spacing.xxxl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.background.layout,
    paddingHorizontal: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    flex: 1,
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginLeft: 40, // balance the 40px close button
  },
  modalQuestion: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  modalSubtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    marginTop: 2,
  },
  optionList: {
    gap: theme.spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.base,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tertiary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.vividOrange[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  optionCaption: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    marginTop: 1,
  },
});

export default ServicesScreen;
