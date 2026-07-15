import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, Checkbox, SelectableChip } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';

// "Profile Creation 3a" (Figma 1248:44732) — step 3 of 6.
const MEDICAL_CONDITIONS = [
  'Arthritis', "Alzheimer's", 'COPD', 'Diabetes', 'Dementia',
  'Heart Disease', 'Hypertension', "Parkinson's", 'Kidney Disease', 'Other',
];
const MOBILITY_SUPPORT = ['Independent', 'Wheelchair', 'Assisted', 'Bedridden'];
const COGNITIVE_CONDITIONS = ['None', 'Mild Memory Issues', 'Dementia', "Alzheimer's"];

export const HealthInfoScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileHealth'>>();
  const [conditions, setConditions] = useState<string[]>([]);
  const [mobility, setMobility] = useState<string | null>(null);
  const [cognitive, setCognitive] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [regularMedication, setRegularMedication] = useState(false);

  const toggleCondition = (item: string) => {
    setConditions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item],
    );
  };

  // The design marks Existing Medical Conditions and Mobility Support with *
  const isFormValid = conditions.length > 0 && mobility !== null;

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
        <View style={styles.chipGrid}>
          {MEDICAL_CONDITIONS.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={conditions.includes(item)}
              onPress={() => toggleCondition(item)}
              style={styles.chipHalf}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>
          Mobility Support <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipGrid}>
          {MOBILITY_SUPPORT.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={mobility === item}
              onPress={() => setMobility(item)}
              style={styles.chipHalf}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Cognitive Conditions</Text>
        <View style={styles.chipGrid}>
          {COGNITIVE_CONDITIONS.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={cognitive === item}
              onPress={() => setCognitive(item)}
              style={styles.chipFull}
            />
          ))}
        </View>

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
