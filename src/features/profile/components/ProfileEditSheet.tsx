import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, SelectableChip } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidDateOfBirth, isValidPinCode } from '@/utils/validation';
import {
  careProfileService,
  customerService,
  masterdataService,
  getErrorMessage,
  type Address,
  type CareProfile,
  type MasterDataOption,
} from '@/api';

export type EditSection = 'details' | 'address' | 'interests';

const SECTION_TITLES: Record<EditSection, string> = {
  details: 'Edit Personal Details',
  address: 'Edit Home Address',
  interests: 'Edit Interests',
};

interface Props {
  section: EditSection | null;
  careProfile: CareProfile | null;
  address: Address | null;
  onClose: () => void;
  /** Called after a successful save so the parent can refetch. */
  onSaved: () => void;
}

// Bottom sheet backing the Edit buttons on the Profile page.
// details/interests → PATCH /care-profiles/me, address → PATCH /customers/me/addresses/{id}.
export const ProfileEditSheet: React.FC<Props> = ({
  section,
  careProfile,
  address,
  onClose,
  onSaved,
}) => {
  // Personal details
  const [preferredName, setPreferredName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [genderId, setGenderId] = useState<string | null>(null);
  const [livingId, setLivingId] = useState<string | null>(null);
  const [dependencyId, setDependencyId] = useState<string | null>(null);
  // Address
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  // Interests
  const [interestIds, setInterestIds] = useState<string[]>([]);

  const [genders, setGenders] = useState<MasterDataOption[]>([]);
  const [livingSituations, setLivingSituations] = useState<MasterDataOption[]>([]);
  const [dependencyLevels, setDependencyLevels] = useState<MasterDataOption[]>([]);
  const [interestOptions, setInterestOptions] = useState<MasterDataOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form from current data every time the sheet opens.
  useEffect(() => {
    if (!section) return;
    setError(null);
    if (section === 'details') {
      setPreferredName(careProfile?.preferredName ?? '');
      const iso = careProfile?.dateOfBirth?.split('T')[0];
      const [y, m, d] = iso ? iso.split('-') : ['', '', ''];
      setDobYear(y ?? '');
      setDobMonth(m ?? '');
      setDobDay(d ?? '');
      setGenderId(careProfile?.gender?.id != null ? String(careProfile.gender.id) : null);
      setLivingId(
        careProfile?.livingSituation?.id != null ? String(careProfile.livingSituation.id) : null
      );
      setDependencyId(
        careProfile?.dependencyLevel?.id != null ? String(careProfile.dependencyLevel.id) : null
      );
    } else if (section === 'address') {
      setLine1(address?.line1 ?? '');
      setLine2(address?.line2 ?? '');
      setCity(address?.city ?? '');
      setStateName(address?.state ?? '');
      setPinCode(address?.pincode ?? '');
    } else if (section === 'interests') {
      setInterestIds((careProfile?.interests ?? []).map((i) => String(i.id)));
    }
  }, [section, careProfile, address]);

  // Master data only matters for the chip sections; fetched once per need.
  useEffect(() => {
    if (!section || section === 'address') return;
    const needDetails = section === 'details' && genders.length === 0;
    const needInterests = section === 'interests' && interestOptions.length === 0;
    if (!needDetails && !needInterests) return;
    setLoadingOptions(true);
    const load = async () => {
      try {
        if (needDetails) {
          const [g, l, d] = await Promise.all([
            masterdataService.getGenders(),
            masterdataService.getLivingSituations(),
            masterdataService.getDependencyLevels(),
          ]);
          setGenders(g);
          setLivingSituations(l);
          setDependencyLevels(d);
        }
        if (needInterests) {
          setInterestOptions(await masterdataService.getInterests());
        }
      } catch {
        setError('Unable to load options right now.');
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, [section, genders.length, interestOptions.length]);

  const toggleInterest = (id: string) => {
    setInterestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isDobValid = isValidDateOfBirth(dobDay, dobMonth, dobYear);
  const isValid =
    section === 'details'
      ? preferredName.trim().length > 0 && isDobValid
      : section === 'address'
      ? line1.trim().length > 0 &&
        city.trim().length > 0 &&
        stateName.trim().length > 0 &&
        isValidPinCode(pinCode)
      : interestIds.length > 0;

  const handleSave = async () => {
    if (!section || !isValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (section === 'details') {
        await careProfileService.updateCareProfile({
          preferredName: preferredName.trim(),
          dateOfBirth: `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`,
          ...(genderId ? { genderId: Number(genderId) } : {}),
          ...(livingId ? { livingSituationId: Number(livingId) } : {}),
          ...(dependencyId ? { dependencyLevelId: Number(dependencyId) } : {}),
        });
      } else if (section === 'address') {
        const payload = {
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pinCode,
        };
        if (address) {
          await customerService.updateAddress(address.id, payload);
        } else {
          await customerService.addAddress({ ...payload, label: 'Home', isDefault: true });
        }
      } else {
        await careProfileService.updateCareProfile({
          interestIds: interestIds.map(Number),
        });
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const ChipGroup = ({
    label,
    options,
    selected,
    onSelect,
  }: {
    label: string;
    options: MasterDataOption[];
    selected: string | null;
    onSelect: (id: string) => void;
  }) => (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipGrid}>
        {options.map((item) => (
          <SelectableChip
            key={item.id}
            label={item.label}
            selected={selected === item.id}
            onPress={() => onSelect(item.id)}
            style={styles.chipHalf}
          />
        ))}
      </View>
    </>
  );

  return (
    <Modal visible={!!section} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{section ? SECTION_TITLES[section] : ''}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {section === 'details' && (
              <>
                <TextInput
                  label="Preferred Name"
                  placeholder="Enter your call name"
                  value={preferredName}
                  onChangeText={setPreferredName}
                />
                <Text style={styles.sectionLabel}>Date of Birth</Text>
                <View style={styles.dobRow}>
                  <View style={styles.dobField}>
                    <TextInput
                      placeholder="DD"
                      value={dobDay}
                      onChangeText={(v) => setDobDay(digitsOnly(v).slice(0, 2))}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.dobField}>
                    <TextInput
                      placeholder="MM"
                      value={dobMonth}
                      onChangeText={(v) => setDobMonth(digitsOnly(v).slice(0, 2))}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.dobField}>
                    <TextInput
                      placeholder="YYYY"
                      value={dobYear}
                      onChangeText={(v) => setDobYear(digitsOnly(v).slice(0, 4))}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </View>
                </View>
                {loadingOptions ? (
                  <Text style={styles.helperText}>Loading options…</Text>
                ) : (
                  <>
                    <ChipGroup
                      label="Gender"
                      options={genders}
                      selected={genderId}
                      onSelect={setGenderId}
                    />
                    <ChipGroup
                      label="Living Situation"
                      options={livingSituations}
                      selected={livingId}
                      onSelect={setLivingId}
                    />
                    <ChipGroup
                      label="Dependency Level"
                      options={dependencyLevels}
                      selected={dependencyId}
                      onSelect={setDependencyId}
                    />
                  </>
                )}
              </>
            )}

            {section === 'address' && (
              <>
                <TextInput
                  label="Address line 1"
                  placeholder="House no., street"
                  value={line1}
                  onChangeText={setLine1}
                />
                <TextInput
                  label="Address line 2"
                  placeholder="Area, locality, landmark"
                  value={line2}
                  onChangeText={setLine2}
                />
                <TextInput label="City" placeholder="City or Town" value={city} onChangeText={setCity} />
                <TextInput
                  label="State"
                  placeholder="State"
                  value={stateName}
                  onChangeText={setStateName}
                />
                <TextInput
                  label="PIN Code"
                  placeholder="6-digit postal code"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pinCode}
                  onChangeText={(v) => setPinCode(digitsOnly(v).slice(0, 6))}
                  error={
                    pinCode.length === 6 && !isValidPinCode(pinCode)
                      ? 'Enter a valid 6-digit PIN code'
                      : undefined
                  }
                />
              </>
            )}

            {section === 'interests' && (
              <>
                {loadingOptions ? (
                  <Text style={styles.helperText}>Loading options…</Text>
                ) : (
                  <View style={styles.chipGrid}>
                    {interestOptions.map((item) => (
                      <SelectableChip
                        key={item.id}
                        label={item.label}
                        selected={interestIds.includes(item.id)}
                        onPress={() => toggleInterest(item.id)}
                        style={styles.chipHalf}
                      />
                    ))}
                  </View>
                )}
              </>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.footer}>
              <PrimaryButton
                label="Save changes"
                onPress={handleSave}
                disabled={!isValid}
                loading={saving}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: theme.colors.background.base,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '85%',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: responsiveFontSize(18),
    color: theme.colors.neutral[900],
  },
  cancelText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(15),
    color: theme.colors.primary,
  },
  sectionLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  dobRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dobField: {
    flex: 1,
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
  helperText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
    marginVertical: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  footer: {
    paddingVertical: theme.spacing.xl,
  },
});

export default ProfileEditSheet;
