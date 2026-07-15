import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { SearchInput, Checkbox, SelectableChip } from '@/components/inputs';
import { StatusChip } from '@/components/cards';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { ORGANIZATIONS } from '../data';

// "Caregiver training" list + "Compare Close" (Figma 1256:24028 / 1256:24118),
// with the "Filter by" (1256:23970) and "Sort by" (1256:24175) sheets.

const SORT_OPTIONS = ['Recommended', 'Highest Rated', 'Budget-Friendly', 'Price: Low to High', 'Price: High to Low', 'Distance'];
const FILTER_RATINGS = ['24/7 Care', 'Day Care', 'On-demand', 'Part time']; // replicated from Figma as-is
const FILTER_BUDGETS = ['Under ₹20,000', '₹20,000 - ₹50,000', '₹50,000 - ₹1,00,000', 'Above ₹1,00,000'];
const FILTER_URGENCY = ['Today', 'Just exploring', 'This week'];
const FILTER_TYPES = ['24/7 Care', 'Day Care', 'On-demand', 'Part time'];
const FILTER_LANGUAGES = ['Hindi', 'English'];

const Star = ({ color = theme.colors.tertiary }: { color?: string }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </Svg>
);

const VerifiedDot = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill={theme.colors.primary}>
    <Path d="M12 1l2.4 2.1 3.1-.5 1.1 3 3 1.1-.5 3.1L23 12l-2.1 2.4.5 3.1-3 1.1-1.1 3-3.1-.5L12 23l-2.4-2.1-3.1.5-1.1-3-3-1.1.5-3.1L1 12l2.1-2.4-.5-3.1 3-1.1 1.1-3 3.1.5L12 1z" />
    <Path d="M8 12l3 3 5-6" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface SheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSave: () => void;
}

const Sheet: React.FC<SheetProps> = ({ title, onClose, children, onSave }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.modalSheet, { paddingTop: insets.top + theme.spacing.xxl }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <IconButton type="close" accessibilityLabel="Close" onPress={onClose} size={40} />
          </View>
          <Spacer size="xl" />
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {children}
            <Spacer size="xl" />
          </ScrollView>
          <PrimaryButton label="Save" onPress={onSave} />
          <Spacer size="xl" />
        </View>
      </View>
    </Modal>
  );
};

export const CaregiverListScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'CaregiverList'>>();
  const route = useRoute<RootRouteProp<'CaregiverList'>>();
  const serviceType = route.params?.serviceType ?? 'Caregiver';
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [compare, setCompare] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // filter/sort selections (visual only until API lands)
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [fRatings, setFRatings] = useState<string[]>([]);
  const [fBudget, setFBudget] = useState<string | null>(null);
  const [fUrgency, setFUrgency] = useState<string | null>(null);
  const [fTypes, setFTypes] = useState<string[]>([]);
  const [fLangs, setFLangs] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  const toggleCompare = (id: string) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const Label = ({ text }: { text: string }) => (
    <Text style={styles.groupLabel}>
      {text} <Text style={styles.required}>*</Text>
    </Text>
  );

  const chipGrid = (items: string[], selected: string | null | string[], onPress: (i: string) => void, full = false) => (
    <View style={styles.chipGrid}>
      {items.map((item) => (
        <SelectableChip
          key={item}
          label={item}
          selected={Array.isArray(selected) ? selected.includes(item) : selected === item}
          onPress={() => onPress(item)}
          style={full ? styles.chipFull : styles.chipHalf}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <IconButton type="back" accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={styles.headerTitle}>{serviceType}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Spacer size="lg" />
        <SearchInput placeholder="Search caregivers" value={search} onChangeText={setSearch} />
        <Spacer size="lg" />

        {/* FILTER BY | SORT BY */}
        <View style={styles.filterRow}>
          <Pressable style={styles.filterCell} onPress={() => setShowFilter(true)}>
            <Text style={styles.filterText}>FILTER BY</Text>
          </Pressable>
          <View style={styles.filterDivider} />
          <Pressable style={styles.filterCell} onPress={() => setShowSort(true)}>
            <Text style={styles.filterText}>SORT BY</Text>
          </Pressable>
        </View>

        <Spacer size="lg" />
        <Text style={styles.countText}>{ORGANIZATIONS.length} organizations</Text>
        <Spacer size="md" />

        {ORGANIZATIONS.map((org) => (
          <View key={org.id} style={styles.orgCard}>
            <View style={styles.orgImageWrap}>
              {org.image ? (
                <Image source={org.image} style={styles.orgImage} resizeMode="cover" />
              ) : (
                <View style={[styles.orgImage, styles.orgImagePlaceholder]} />
              )}
              {org.featured && (
                <View style={styles.ribbon}>
                  <Star color="#FFD700" />
                </View>
              )}
            </View>
            <View style={styles.orgBody}>
              <View style={styles.orgTitleRow}>
                <View style={styles.orgNameWrap}>
                  <Text style={styles.orgName}>
                    {org.name} <VerifiedDot />
                  </Text>
                </View>
                <StatusChip
                  label={org.rating != null ? String(org.rating) : '-'}
                  variant="rating"
                  icon={<Star />}
                />
              </View>
              <View style={styles.orgMetaRow}>
                <Icon name="location" variant="outline" size={16} color={theme.colors.primary} />
                <Text style={styles.orgMeta}>{org.city} • {org.distanceKm} km</Text>
              </View>
              <View style={styles.orgActionsRow}>
                <Pressable style={styles.compareRow} onPress={() => toggleCompare(org.id)}>
                  <Checkbox checked={compare.includes(org.id)} onPress={() => toggleCompare(org.id)} />
                  <Text style={styles.compareText}>Compare</Text>
                </Pressable>
                <PrimaryButton
                  label="See details"
                  size="small"
                  onPress={() => navigation.navigate('CaregiverDetail', { orgId: org.id })}
                />
              </View>
            </View>
          </View>
        ))}
        <Spacer size={compare.length > 0 ? 96 : 24} />
      </ScrollView>

      {/* Compare drawer (Figma "Compare Close") */}
      {compare.length > 0 && (
        <View style={[styles.compareBar, { paddingBottom: insets.bottom + theme.spacing.md }]}>
          <View style={styles.compareBarHandleWrap}>
            <View style={styles.compareBarHandle}>
              <Icon name="navigationRight" variant="outline" size={16} color={theme.colors.tertiary} />
            </View>
          </View>
          <View style={styles.compareBarRow}>
            <Text style={styles.compareBarText}>
              {compare.length < 2 ? 'Add more items' : `${compare.length} items selected`}
            </Text>
            <Pressable
              style={[styles.compareBtn, compare.length < 2 && styles.compareBtnDisabled]}
              onPress={() => compare.length >= 2 && navigation.navigate('Comparison', { orgIds: compare })}
            >
              <Text style={styles.compareBtnText}>Compare</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Filter by sheet */}
      {showFilter && (
        <Sheet title="Filter by" onClose={() => setShowFilter(false)} onSave={() => setShowFilter(false)}>
          <Label text="Ratings" />
          {chipGrid(FILTER_RATINGS, fRatings, (i) => toggle(fRatings, setFRatings, i))}
          <Spacer size="md" />
          <Label text="Monthly Budget Range" />
          {chipGrid(FILTER_BUDGETS, fBudget, setFBudget, true)}
          <Spacer size="md" />
          <Label text="Urgency" />
          {chipGrid(FILTER_URGENCY, fUrgency, setFUrgency, true)}
          <Spacer size="md" />
          <Label text="Type of Service" />
          {chipGrid(FILTER_TYPES, fTypes, (i) => toggle(fTypes, setFTypes, i))}
          <Spacer size="md" />
          <Label text="Language" />
          {chipGrid(FILTER_LANGUAGES, fLangs, (i) => toggle(fLangs, setFLangs, i))}
        </Sheet>
      )}

      {/* Sort by sheet */}
      {showSort && (
        <Sheet title="Sort by" onClose={() => setShowSort(false)} onSave={() => setShowSort(false)}>
          {chipGrid(SORT_OPTIONS, sortBy, setSortBy, true)}
        </Sheet>
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
  orgCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  orgImageWrap: {
    position: 'relative',
  },
  orgImage: {
    width: '100%',
    height: 140,
  },
  orgImagePlaceholder: {
    backgroundColor: theme.colors.neutral[200],
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: theme.spacing.lg,
    width: 28,
    height: 36,
    backgroundColor: theme.colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  orgBody: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  orgTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  orgNameWrap: {
    flex: 1,
  },
  orgName: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  orgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  orgMeta: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
  },
  orgActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  compareText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
  },
  compareBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.base,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: theme.spacing.xl,
    ...theme.shadows.md,
  },
  compareBarHandleWrap: {
    alignItems: 'center',
    marginTop: -14,
  },
  compareBarHandle: {
    width: 44,
    height: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: theme.colors.vividOrange[100],
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  compareBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  compareBarText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[900],
  },
  compareBtn: {
    backgroundColor: theme.colors.forestGreen[900],
    borderRadius: 6,
    paddingHorizontal: theme.spacing.xxl,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnDisabled: {
    backgroundColor: theme.colors.forestGreen[200],
  },
  compareBtnText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(14),
    color: '#FFFFFF',
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
    marginLeft: 40,
  },
  groupLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.status.error,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chipHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  chipFull: {
    width: '100%',
  },
});

export default CaregiverListScreen;
