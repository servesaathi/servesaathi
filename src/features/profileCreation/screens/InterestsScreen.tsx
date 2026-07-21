import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { SelectableChip } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { masterdataService, type MasterDataOption } from '@/api';

// "Profile Creation 4" (Figma 1248:44337) — step 4 of 6.

export const InterestsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileInterests'>>();
  const [selected, setSelected] = useState<string[]>([]);
  const [interests, setInterests] = useState<MasterDataOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  useEffect(() => {
    const loadInterests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await masterdataService.getInterests();
        setInterests(data);
      } catch (err) {
        setError('Unable to load interests right now.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, []);

  const handleContinue = () => {
    navigation.navigate('ProfileCircle');
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent stepper={{ current: 4, total: 6 }} />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title}>Tell us your interests of Events</Text>
        <Spacer size="xs" />
        <Text style={styles.subtitle}>
          Choose at least 3 interests so we can tailor the best events for you.
        </Text>
        <Spacer size="xxl" />

        {isLoading ? (
          <Text style={styles.helperText}>Loading interests…</Text>
        ) : error ? (
          <Text style={styles.helperText}>{error}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {interests.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={selected.includes(item.value)}
                onPress={() => toggleInterest(item.value)}
                style={styles.chipHalf}
              />
            ))}
          </View>
        )}

        <Spacer size="xxl" />
        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={selected.length < 3}
          />
        </View>
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    paddingHorizontal: theme.spacing.xxl,
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  chipHalf: {
    flexBasis: '46%',
    flexGrow: 1,
  },
  helperText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
  },
});

export default InterestsScreen;
