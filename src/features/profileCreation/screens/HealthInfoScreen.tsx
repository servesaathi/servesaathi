import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, Checkbox, SelectableChip } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { masterdataService, type MasterDataOption } from '@/api';

// "Profile Creation 3a" (Figma 1248:44732) — step 3 of 6.

export const HealthInfoScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileHealth'>>();
  const [conditions, setConditions] = useState<string[]>([]);
  const [mobility, setMobility] = useState<string | null>(null);
  const [cognitive, setCognitive] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [regularMedication, setRegularMedication] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState<MasterDataOption[]>([]);
  const [mobilitySupports, setMobilitySupports] = useState<MasterDataOption[]>([]);
  const [cognitiveConditions, setCognitiveConditions] = useState<MasterDataOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const toggleCondition = (item: string) => {
    setConditions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item],
    );
  };

  // The design marks Existing Medical Conditions and Mobility Support with *
  const isFormValid = conditions.length > 0 && mobility !== null;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setOptionsError(null);
        const [medical, mobility, cognitive] = await Promise.all([
          masterdataService.getMedicalConditions(),
          masterdataService.getMobilitySupports(),
          masterdataService.getCognitiveConditions(),
        ]);
        setMedicalConditions(medical);
        setMobilitySupports(mobility);
        setCognitiveConditions(cognitive);
      } catch (err) {
        setOptionsError('Unable to load health options right now.');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleContinue = () => {
    if (!isFormValid) return;
    navigation.navigate('ProfileInterests');
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header leftIcon="back" transparent stepper={{ current: 3, total: 6 }} />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title}>Health &amp; Medical Information</Text>
        <Spacer size="xl" />

        <Text style={styles.sectionLabel}>
          Existing Medical Conditions <Text style={styles.required}>*</Text>
        </Text>
        {isLoadingOptions ? (
          <Text style={styles.helperText}>Loading options…</Text>
        ) : optionsError ? (
          <Text style={styles.helperText}>{optionsError}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {medicalConditions.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={conditions.includes(item.value)}
                onPress={() => toggleCondition(item.value)}
                style={styles.chipHalf}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>
          Mobility Support <Text style={styles.required}>*</Text>
        </Text>
        {isLoadingOptions ? (
          <Text style={styles.helperText}>Loading options…</Text>
        ) : optionsError ? (
          <Text style={styles.helperText}>{optionsError}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {mobilitySupports.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={mobility === item.value}
                onPress={() => setMobility(item.value)}
                style={styles.chipHalf}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Cognitive Conditions</Text>
        {isLoadingOptions ? (
          <Text style={styles.helperText}>Loading options…</Text>
        ) : optionsError ? (
          <Text style={styles.helperText}>{optionsError}</Text>
        ) : (
          <View style={styles.chipGrid}>
            {cognitiveConditions.map((item) => (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={cognitive === item.value}
                onPress={() => setCognitive(item.value)}
                style={styles.chipFull}
              />
            ))}
          </View>
        )}

        <Spacer size="md" />
        <TextInput
          label="Notes"
          placeholder="Special instruction"
          value={notes}
          onChangeText={setNotes}
        />

        <Pressable style={styles.checkRow} onPress={() => setRegularMedication((v) => !v)}>
          <Checkbox
            checked={regularMedication}
            onPress={() => setRegularMedication((v) => !v)}
            color="orange"
          />
          <Text style={styles.checkText}>Regular medication required.</Text>
        </Pressable>

        <Spacer size="xl" />
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!isFormValid} />
        <Spacer size="xl" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  required: {
    color: theme.colors.status.error,
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
  chipFull: {
    width: '100%',
  },
  helperText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  checkText: {
    flex: 1,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[900],
  },
});

export default HealthInfoScreen;
