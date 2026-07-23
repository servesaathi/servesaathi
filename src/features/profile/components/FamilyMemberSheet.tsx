import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';
import { PrimaryButton } from '@/components/buttons';
import { TextInput, SelectableChip } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidIndianMobile, isValidName } from '@/utils/validation';
import {
  careProfileService,
  masterdataService,
  getErrorMessage,
  type FamilyMember,
  type MasterDataOption,
} from '@/api';

interface Props {
  visible: boolean;
  /** null → add a new member; otherwise edit this one. */
  member: FamilyMember | null;
  onClose: () => void;
  /** Called after a successful save or delete so the parent can refetch. */
  onSaved: () => void;
}

// Bottom sheet for the Profile page contacts: POST/PATCH/DELETE /care-profiles/me/family-members.
export const FamilyMemberSheet: React.FC<Props> = ({ visible, member, onClose, onSaved }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [relationships, setRelationships] = useState<MasterDataOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setError(null);
    setFirstName(member?.firstName ?? '');
    setLastName(member?.lastName ?? '');
    setRelationshipId(
      member?.familyRelationshipId != null ? String(member.familyRelationshipId) : null
    );
    // Stored as E.164 (+91XXXXXXXXXX) — edit just the 10 digits.
    setPhone(member?.phone ? digitsOnly(member.phone).slice(-10) : '');
  }, [visible, member]);

  useEffect(() => {
    if (!visible || relationships.length > 0) return;
    masterdataService
      .getFamilyRelationships()
      .then(setRelationships)
      .catch(() => setError('Unable to load relationships right now.'));
  }, [visible, relationships.length]);

  const isPhoneValid = isValidIndianMobile(phone);
  const isValid =
    isValidName(firstName) && isValidName(lastName) && relationshipId !== null && isPhoneValid;

  const handleSave = async () => {
    if (!isValid || saving || deleting) return;
    setSaving(true);
    setError(null);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      familyRelationshipId: Number(relationshipId),
      phone: `+91${phone}`,
    };
    try {
      if (member) {
        await careProfileService.updateFamilyMember(member.id, payload);
      } else {
        await careProfileService.addFamilyMember(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!member || saving || deleting) return;
    Alert.alert(
      'Remove contact',
      `Remove ${member.firstName} ${member.lastName} from your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError(null);
            try {
              await careProfileService.deleteFamilyMember(member.id);
              onSaved();
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{member ? 'Edit Contact' : 'Add Family Member'}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              label="Last name"
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.sectionLabel}>Family Relationship</Text>
            <View style={styles.chipGrid}>
              {relationships.length === 0 ? (
                <Text style={styles.helperText}>Loading relationships…</Text>
              ) : (
                relationships.map((item) => (
                  <SelectableChip
                    key={item.id}
                    label={item.label}
                    selected={relationshipId === item.id}
                    onPress={() => setRelationshipId(item.id)}
                    style={styles.chipHalf}
                  />
                ))
              )}
            </View>

            <TextInput
              label="Phone number"
              placeholder="000-000-0000"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(v) => setPhone(digitsOnly(v).slice(0, 10))}
              error={
                phone.length === 10 && !isPhoneValid
                  ? 'Enter a valid 10-digit mobile number starting with 6–9'
                  : undefined
              }
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.footer}>
              <PrimaryButton
                label={member ? 'Save changes' : 'Request Send'}
                onPress={handleSave}
                disabled={!isValid}
                loading={saving}
              />
              {member && (
                <Pressable onPress={handleDelete} style={styles.deleteButton} disabled={deleting}>
                  <Text style={styles.deleteText}>
                    {deleting ? 'Removing…' : 'Remove contact'}
                  </Text>
                </Pressable>
              )}
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
    marginVertical: theme.spacing.sm,
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
  deleteButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  deleteText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: responsiveFontSize(15),
    color: theme.colors.status.error,
  },
});

export default FamilyMemberSheet;
