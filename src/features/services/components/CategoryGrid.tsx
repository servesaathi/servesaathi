import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { Icon } from '@/components/icons';
import { responsiveFontSize } from '@/utils/responsive';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getErrorMessage } from '@/api';
import type { ServiceCategory } from '../data';
import { useServiceCategories } from '../hooks/useProviders';

// The "What do you need help with?" category grid (Figma 1255:26926), shared by
// ServicesScreen and GuestBrowseServicesScreen. Live categories only — on
// failure it offers a retry rather than showing placeholder categories.

const ICON_SIZE = 40;

/** The category's own iconUrl when it has one (and it loads), else the app's icon for its slug. */
const CategoryIcon: React.FC<{ category: ServiceCategory; color: string }> = ({ category, color }) => {
  const [failed, setFailed] = useState(false);
  if (category.iconUrl && !failed) {
    return (
      <Image
        source={{ uri: category.iconUrl }}
        style={styles.iconImage}
        resizeMode="contain"
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return <Icon name={category.icon} variant="outline" size={ICON_SIZE} color={color} />;
};

interface Props {
  onSelect: (category: ServiceCategory) => void;
}

export const CategoryGrid: React.FC<Props> = ({ onSelect }) => {
  const colors = useThemeColors();
  const categoriesQuery = useServiceCategories();

  if (categoriesQuery.isPending) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <View style={styles.state}>
        <Text style={[styles.stateText, { color: colors.text.secondary }]}>
          {getErrorMessage(categoriesQuery.error)}
        </Text>
        <Spacer size="md" />
        <PrimaryButton label="Try Again" size="small" onPress={() => categoriesQuery.refetch()} />
      </View>
    );
  }

  if (categoriesQuery.data.length === 0) {
    return (
      <View style={styles.state}>
        <Text style={[styles.stateText, { color: colors.text.secondary }]}>No services are available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {categoriesQuery.data.map((cat) => (
        <Pressable
          key={cat.id}
          style={[styles.card, { backgroundColor: colors.background.base }]}
          onPress={() => onSelect(cat)}
          accessibilityRole="button"
          accessibilityLabel={cat.label}
        >
          <View style={[styles.arch, { backgroundColor: colors.background.orange }]}>
            <CategoryIcon key={cat.iconUrl ?? ''} category={cat} color={colors.accentOrange} />
          </View>
          <Text style={[styles.label, { color: colors.text.strong }]}>{cat.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  arch: {
    width: '100%',
    height: 76,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  label: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  state: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  stateText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    textAlign: 'center',
  },
});

export default CategoryGrid;
