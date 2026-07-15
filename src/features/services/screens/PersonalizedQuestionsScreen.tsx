import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp, RootRouteProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Spacer } from '@/components/layouts';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/buttons';
import { TextInput, SelectableChip } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly } from '@/utils/validation';

// "Personalized Question 1–5" (Figma 1256:23745 / 23825 / 23785 / 23864 / 23918) —
// a 5-step sheet-style questionnaire before showing matching organizations.

const WHO_NEEDS = ['Myself', 'Parent', 'Partner', 'Other'];
const LIVING = ['Alone', 'Partner', 'Family', 'Caregiver', 'Home Care', 'Hospital'];
const URGENCY = ['Today', 'This week', 'Just Exploring'];
const RISKS = ['Fall risk', 'Memory Issue', 'Chronic Pain', 'Mobility Limited', 'Post Surgery', 'Other'];
const CONDITIONS = [
  'Arthritis', "Alzheimer's", 'COPD', 'Diabetes', 'Dementia',
  'Heart Disease', 'Hypertension', "Parkinson's", 'Kidney Disease', 'Other',
];
const MOBILITY = ['Independent', 'Wheelchair', 'Assisted', 'Bedridden'];
const COGNITIVE = ['None', 'Mild Memory Issues', 'Dementia', "Alzheimer's"];
const BUDGETS = ['Under ₹20,000', '₹20,000 - ₹50,000', '₹50,000 - ₹1,00,000', 'Above ₹1,00,000'];
const SERVICE_TYPES = ['24/7 Care', 'Day Care', 'On-demand', 'Part time'];
const CG_PREFERENCE = ['No Preference', 'Female Caregiver', 'Male Caregiver'];
const LANGUAGES = ['Hindi', 'English'];

const STEP_META = [
  { title: 'Basic Information', subtitle: 'Help us find the best match for you' },
  { title: 'Basic Information', subtitle: 'Help us find the best match for you' },
  { title: 'Let’s understand your needs', subtitle: 'Help us find the best match for you' },
  { title: 'Health & Medical Information', subtitle: 'Help us match you with appropriate care' },
  { title: 'Service Preferences', subtitle: 'Help us find the perfect match' },
];

const BackArrow = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PersonalizedQuestionsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'PersonalizedQuestions'>>();
  const route = useRoute<RootRouteProp<'PersonalizedQuestions'>>();
  const serviceType = route.params?.serviceType ?? 'Caregiver';
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0); // 0..4
  const [who, setWho] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [living, setLiving] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [risks, setRisks] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [mobility, setMobility] = useState<string | null>(null);
  const [cognitive, setCognitive] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState<string | null>(null);
  const [svcType, setSvcType] = useState<string | null>(null);
  const [cgPref, setCgPref] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  // Required picks per step (fields marked * in the design)
  const stepValid = [
    who !== null,
    fullName.trim().length > 1 && age.length > 0 && location.trim().length > 0,
    urgency !== null,
    conditions.length > 0 && mobility !== null,
    budget !== null && svcType !== null && languages.length > 0,
  ][step];

  const handleContinue = () => {
    if (!stepValid) return;
    if (step < 4) setStep(step + 1);
    else navigation.replace('CaregiverList', { serviceType });
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <Text style={styles.groupLabel}>
      {text} {required && <Text style={styles.required}>*</Text>}
    </Text>
  );

  const chipGridHalf = (items: string[], selected: string | null | string[], onPress: (i: string) => void) => (
    <View style={styles.chipGrid}>
      {items.map((item) => (
        <SelectableChip
          key={item}
          label={item}
          selected={Array.isArray(selected) ? selected.includes(item) : selected === item}
          onPress={() => onPress(item)}
          style={styles.chipHalf}
        />
      ))}
    </View>
  );

  const chipListFull = (items: string[], selected: string | null | string[], onPress: (i: string) => void) => (
    <View style={styles.chipGrid}>
      {items.map((item) => (
        <SelectableChip
          key={item}
          label={item}
          selected={Array.isArray(selected) ? selected.includes(item) : selected === item}
          onPress={() => onPress(item)}
          style={styles.chipFull}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.sheet, { paddingTop: insets.top + theme.spacing.xxl }]}>
        {/* Sheet header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{serviceType}</Text>
          <IconButton
            type="close"
            accessibilityLabel="Close"
            onPress={() => navigation.goBack()}
            size={40}
          />
        </View>

        <Spacer size="xl" />

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.dashes}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.dash, i <= step ? styles.dashActive : styles.dashInactive]} />
            ))}
          </View>
          <Text style={styles.progressText}>{step + 1} of 5</Text>
        </View>

        <Spacer size="lg" />
        <Text style={styles.stepTitle}>{STEP_META[step].title}</Text>
        <Text style={styles.stepSubtitle}>{STEP_META[step].subtitle}</Text>
        <Spacer size="lg" />

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.body}>
          {step === 0 && (
            <>
              <Label text={`Who needs ${serviceType}s?`} />
              {chipListFull(WHO_NEEDS, who, setWho)}
            </>
          )}

          {step === 1 && (
            <>
              <TextInput label="Full Name  *" placeholder="Enter full name" value={fullName} onChangeText={setFullName} />
              <TextInput
                label="Age  *"
                placeholder="Enter age"
                keyboardType="number-pad"
                maxLength={3}
                value={age}
                onChangeText={(v) => setAge(digitsOnly(v).slice(0, 3))}
              />
              <TextInput label="Current Location  *" placeholder="Enter city" value={location} onChangeText={setLocation} />
              <Label text="Living Situation" />
              {chipGridHalf(LIVING, living, setLiving)}
            </>
          )}

          {step === 2 && (
            <>
              <Label text="How urgently do you need this service?" />
              {chipListFull(URGENCY, urgency, setUrgency)}
              <Spacer size="md" />
              <Label text="Any specific risk factors or concerns?" />
              {chipListFull(RISKS, risks, (i) => toggle(risks, setRisks, i))}
            </>
          )}

          {step === 3 && (
            <>
              <Label text="Existing Medical Conditions" required />
              {chipGridHalf(CONDITIONS, conditions, (i) => toggle(conditions, setConditions, i))}
              <Spacer size="md" />
              <Label text="Mobility Support" required />
              {chipGridHalf(MOBILITY, mobility, setMobility)}
              <Spacer size="md" />
              <Label text="Cognitive Conditions" />
              {chipListFull(COGNITIVE, cognitive, setCognitive)}
              <Spacer size="md" />
              <TextInput label="Notes" placeholder="None" value={notes} onChangeText={setNotes} />
            </>
          )}

          {step === 4 && (
            <>
              <TextInput label="Preferred Area" placeholder="e.g. South Delhi" value={area} onChangeText={setArea} />
              <Label text="Monthly Budget Range" required />
              {chipListFull(BUDGETS, budget, setBudget)}
              <Spacer size="md" />
              <Label text="Type of Service" required />
              {chipGridHalf(SERVICE_TYPES, svcType, setSvcType)}
              <Spacer size="md" />
              <Label text="Caregiver Preference" />
              {chipListFull(CG_PREFERENCE, cgPref, setCgPref)}
              <Spacer size="md" />
              <Label text="Language" required />
              {chipGridHalf(LANGUAGES, languages, (i) => toggle(languages, setLanguages, i))}
            </>
          )}
          <Spacer size="xl" />
        </ScrollView>

        {/* Back / Continue */}
        <View style={styles.footerRow}>
          <SecondaryButton
            label="Back"
            onPress={handleBack}
            prefixIcon={<BackArrow />}
            style={styles.footerBtn}
          />
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!stepValid}
            style={styles.footerBtn}
          />
        </View>
        <Spacer size="xl" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09190A',
  },
  sheet: {
    flex: 1,
    marginTop: theme.spacing.xxxl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.background.layout,
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h2.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginLeft: 40, // balance the close button
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashes: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginRight: theme.spacing.lg,
  },
  dash: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  dashActive: {
    backgroundColor: theme.colors.tertiary,
  },
  dashInactive: {
    backgroundColor: theme.colors.vividOrange[200],
  },
  progressText: {
    fontFamily: theme.typography.bodySmall.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodySmall.fontSize),
    color: theme.colors.primary,
  },
  stepTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h3.fontSize),
    color: theme.colors.neutral[900],
  },
  stepSubtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    marginTop: 2,
  },
  body: {
    flex: 1,
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
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  footerBtn: {
    flex: 1,
    width: 'auto',
  },
});

export default PersonalizedQuestionsScreen;
