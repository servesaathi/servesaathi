import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { SearchInput } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { ORGANIZATIONS, Organization } from '../data';

// "Comparsion" (Figma 1256:24299) — side-by-side comparison table, horizontally scrollable.

const COL_WIDTH = 150;

const Star = ({ filled }: { filled: boolean }) => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#E7A500' : theme.colors.neutral[200]}>
    <Path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
  </Svg>
);

export const ComparisonScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Comparison'>>();
  const route = useRoute<RootRouteProp<'Comparison'>>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [ids, setIds] = useState<string[]>(route.params?.orgIds ?? []);

  const orgs = ids
    .map((id) => ORGANIZATIONS.find((o) => o.id === id))
    .filter((o): o is Organization => !!o);

  const removeOrg = (id: string) => {
    const next = ids.filter((i) => i !== id);
    if (next.length === 0) navigation.goBack();
    else setIds(next);
  };

  // Row helpers — every row renders one fixed-width cell per organization so
  // the columns stay aligned inside the horizontal scroll.
  const cellsRow = (render: (org: Organization) => React.ReactNode, shaded = false) => (
    <View style={styles.row}>
      {orgs.map((org) => (
        <View key={org.id} style={[styles.cell, shaded && styles.cellShaded]}>
          {render(org)}
        </View>
      ))}
    </View>
  );

  const labelRow = (label: string) =>
    cellsRow(() => <Text style={styles.rowLabel}>{label}</Text>, true);

  const sectionHeader = (label: string) => (
    <View style={[styles.sectionHeader, { width: orgs.length * COL_WIDTH }]}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
    </View>
  );

  const listRows = (pick: (org: Organization) => string[]) => {
    const max = Math.max(...orgs.map((o) => pick(o).length));
    return Array.from({ length: max }).map((_, i) => (
      <React.Fragment key={i}>
        {cellsRow((org) => {
          const value = pick(org)[i];
          return value ? <Text style={styles.rowValue}>{value}</Text> : null;
        })}
      </React.Fragment>
    ));
  };

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + theme.spacing.lg }]}>
        <View style={styles.headerRow}>
          <IconButton type="back" accessibilityLabel="Go back" onPress={() => navigation.goBack()} size={40} />
          <Text style={styles.headerTitle}>Caregiver</Text>
          <View style={{ width: 40 }} />
        </View>
        <Spacer size="lg" />
        <SearchInput placeholder="Search caregivers" value={search} onChangeText={setSearch} />
        <Spacer size="lg" />
        <Text style={styles.pageTitle}>Compare Products</Text>
        <Spacer size="md" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Org headers */}
          <View style={styles.row}>
            {orgs.map((org) => (
              <View key={org.id} style={styles.orgHeaderCell}>
                <View style={styles.orgLogoBox}>
                  {org.image ? (
                    <Image source={org.image} style={styles.orgLogo} resizeMode="cover" />
                  ) : (
                    <View style={[styles.orgLogo, { backgroundColor: theme.colors.neutral[200] }]} />
                  )}
                  <Pressable style={styles.removeBtn} onPress={() => removeOrg(org.id)}>
                    <Text style={styles.removeX}>×</Text>
                  </Pressable>
                </View>
                <Text style={styles.orgName}>{org.name}</Text>
                <PrimaryButton
                  label="See details"
                  size="small"
                  onPress={() => navigation.navigate('CaregiverDetail', { orgId: org.id })}
                />
              </View>
            ))}
          </View>

          {labelRow('Price')}
          {cellsRow((org) => <Text style={styles.rowValue}>{org.price}</Text>)}

          {sectionHeader('Identity & Mission')}
          {labelRow('Founded')}
          {cellsRow((org) => <Text style={styles.rowValue}>{org.founded}</Text>)}
          {labelRow('Mission')}
          {cellsRow((org) => <Text style={styles.rowValue}>{org.mission}</Text>)}

          {sectionHeader('Ratings and Review')}
          {labelRow('Ratings')}
          {cellsRow((org) => (
            <View>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={org.rating != null && i < Math.round(org.rating)} />
                ))}
              </View>
              <Text style={styles.ratingText}>
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
        </ScrollView>
      </ScrollView>
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
    width: COL_WIDTH,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.forestGreen[50],
    backgroundColor: theme.colors.background.base,
    justifyContent: 'center',
  },
  cellShaded: {
    backgroundColor: theme.colors.forestGreen[50],
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
  sectionHeader: {
    backgroundColor: theme.colors.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sectionHeaderText: {
    fontFamily: theme.typography.h6.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h6.fontSize),
    color: '#FFFFFF',
  },
  orgHeaderCell: {
    width: COL_WIDTH,
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
});

export default ComparisonScreen;
