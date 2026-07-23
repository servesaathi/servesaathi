import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header } from '@/components/layouts';
import { PrimaryButton, IconButton } from '@/components/buttons';
import { TextInput, SelectableChip, ToggleSwitch } from '@/components/inputs';
import { StatusChip } from '@/components/cards';
import { responsiveFontSize } from '@/utils/responsive';
import { digitsOnly, isValidIndianMobile, isValidName } from '@/utils/validation';
import {
  careProfileService,
  masterdataService,
  getErrorMessage,
  type FamilyMember,
  type MasterDataOption,
} from '@/api';

// "Profile Creation 5a/5b/5c/5d" (Figma 1248:44491 / 44283 / 44310 / 44544) — step 5 of 6.
// Sharing toggles + emergency contacts list, with a full-screen "Emergency Contacts" form modal.
// Contacts go to POST /care-profiles/me/family-members; toggles PATCH /care-profiles/me on Continue.

interface SharingToggleProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

const SharingToggle: React.FC<SharingToggleProps> = ({ label, value, onValueChange }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <ToggleSwitch value={value} onValueChange={onValueChange} color="orange" />
  </View>
);

export const CircleOfCareScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'ProfileCircle'>>();
  const insets = useSafeAreaInsets();
  const [saveEvents, setSaveEvents] = useState(false);
  const [seeHealthNotes, setSeeHealthNotes] = useState(true);
  const [seeVisitReports, setSeeVisitReports] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [contacts, setContacts] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<MasterDataOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal form state
  const [showForm, setShowForm] = useState(false);
  const [showSentPopup, setShowSentPopup] = useState(false);
  const [lastSentContact, setLastSentContact] = useState<{ name: string; relationship: string } | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Relationship chips come from master data (numeric ids the POST needs);
    // existing members load so revisiting the step doesn't look empty.
    const load = async () => {
      try {
        const [options, members] = await Promise.all([
          masterdataService.getFamilyRelationships(),
          careProfileService.getFamilyMembers(),
        ]);
        setRelationships(options);
        setContacts(members);
      } catch {
        // Non-fatal: chips render empty and the form shows an error on send.
      }
    };
    load();
  }, []);

  const relationshipName = (member: FamilyMember) =>
    member.relationship?.name ??
    relationships.find((r) => Number(r.id) === member.familyRelationshipId)?.label ??
    'Family';

  const isPhoneValid = isValidIndianMobile(phone);
  const phoneError =
    phone.length === 10 && !isPhoneValid
      ? 'Enter a valid 10-digit mobile number starting with 6–9'
      : undefined;
  const isContactFormValid =
    isValidName(firstName) && isValidName(lastName) && relationshipId !== null && isPhoneValid;

  const handleRequestSend = async () => {
    if (!isContactFormValid || sending) return;
    setSending(true);
    setFormError(null);
    try {
      const member = await careProfileService.addFamilyMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        familyRelationshipId: Number(relationshipId),
        phone: `+91${phone}`,
      });
      setContacts((prev) => [...prev, member]);
      setLastSentContact({
        name: `${member.firstName} ${member.lastName}`.trim(),
        relationship: relationshipName(member),
      });
      setFirstName('');
      setLastName('');
      setRelationshipId(null);
      setPhone('');
      setShowForm(false);
      setShowSentPopup(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleContinue = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await careProfileService.updateCareProfile({
        shareUpcomingEvents: saveEvents,
        shareHealthNotes: seeHealthNotes,
        shareVisitReports: seeVisitReports,
        shareLocation,
      });
      navigation.navigate('ProfileAccessibility');
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const CountryCodePrefix = () => (
    <View style={styles.countryCodeContainer}>
      <Text style={styles.countryCodeText}>(+91)</Text>
      <Svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={styles.chevron}>
        <Path
          d="M1 1L5 5L9 1"
          stroke={theme.colors.neutral[700]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.countryCodeDivider} />
    </View>
  );

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header
        leftIcon="back"
        transparent
        stepper={{ current: contacts.length > 0 ? 6 : 5, total: 6 }}
      />

      <View style={styles.content}>
        <Spacer size="lg" />
        <Text style={styles.title}>Your Circle of Care - Family</Text>
        <Spacer size="xl" />

        <SharingToggle label="Save my upcoming events" value={saveEvents} onValueChange={setSaveEvents} />
        <SharingToggle label="See my health notes" value={seeHealthNotes} onValueChange={setSeeHealthNotes} />
        <SharingToggle label="See Saathi visit reports" value={seeVisitReports} onValueChange={setSeeVisitReports} />
        <SharingToggle label="Share my location" value={shareLocation} onValueChange={setShareLocation} />

        <Spacer size="lg" />
        <Text style={styles.sectionLabel}>Emergency Contacts</Text>
        <Spacer size="sm" />

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {contact.firstName} {contact.lastName}
              </Text>
              <View style={styles.contactMetaRow}>
                <Text style={styles.contactMeta}>{relationshipName(contact)}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.contactMeta}>{contact.phone}</Text>
              </View>
            </View>
            <StatusChip
              label={contact.status === 'accepted' ? 'Verified' : 'Waiting'}
              bgColor={
                contact.status === 'accepted' ? theme.colors.primary : theme.colors.tertiary
              }
              textColor="#FFFFFF"
            />
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonPlus}>+</Text>
          <Text style={styles.addButtonText}>Add another family member</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            You're always in control. Change these anytime in your profile settings
          </Text>
          <Spacer size="md" />
          {submitError && <Text style={styles.errorText}>{submitError}</Text>}
          <PrimaryButton label="Continue" onPress={handleContinue} loading={submitting} />
          <Spacer size="xl" />
        </View>
      </View>

      {/* Emergency Contacts form (Figma "Profile Creation 5b/5c").
          Mounted only while open — react-native-web keeps closed Modal nodes in the DOM. */}
      {showForm && (
      <Modal visible animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalRoot}>
          <View style={[styles.modalSheet, { paddingTop: insets.top + theme.spacing.xxl }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Contacts</Text>
              <IconButton
                type="close"
                accessibilityLabel="Close"
                onPress={() => setShowForm(false)}
                size={40}
              />
            </View>
            <Spacer size="xl" />

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
                <Text style={styles.contactMeta}>Loading relationships…</Text>
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

            <Spacer size="md" />
            <TextInput
              label="Family's phone number"
              placeholder="000-000-0000"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(v) => setPhone(digitsOnly(v).slice(0, 10))}
              error={phoneError}
              prefixIcon={<CountryCodePrefix />}
            />

            <View style={styles.modalFooter}>
              {formError && <Text style={styles.errorText}>{formError}</Text>}
              <PrimaryButton
                label="Request Send"
                onPress={handleRequestSend}
                disabled={!isContactFormValid}
                loading={sending}
              />
              <Spacer size="xl" />
            </View>
          </View>
        </View>
      </Modal>
      )}

      {/* Request-sent confirmation popup shown after adding a contact */}
      {showSentPopup && lastSentContact && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowSentPopup(false)}>
          <View style={styles.popupOverlay}>
            <View style={styles.popupCard}>
              <View style={styles.popupIconContainer}>
                <Svg width={36} height={36} viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M13.7524 2.24923C13.6446 2.14149 13.51 2.06443 13.3625 2.026C13.215 1.98757 13.0599 1.98916 12.9133 2.0306H12.9052L2.61994 5.15144C2.45297 5.19956 2.30456 5.29729 2.19438 5.43166C2.0842 5.56604 2.01745 5.73072 2.00298 5.90389C1.98851 6.07706 2.027 6.25054 2.11335 6.40134C2.19971 6.55214 2.32984 6.67313 2.48652 6.7483L7.03703 8.96461L9.25012 13.5124C9.31896 13.6593 9.4284 13.7835 9.56551 13.8702C9.70262 13.9568 9.86168 14.0025 10.0239 14.0017C10.0486 14.0017 10.0732 14.0006 10.0979 13.9985C10.2709 13.9845 10.4355 13.9179 10.5696 13.8076C10.7037 13.6974 10.8008 13.5487 10.8481 13.3817L13.9668 3.09642C13.9668 3.09374 13.9668 3.09106 13.9668 3.08839C14.0087 2.94208 14.011 2.78723 13.9733 2.63975C13.9357 2.49228 13.8594 2.35749 13.7524 2.24923ZM10.0287 13.1363L10.026 13.1438V13.14L7.8794 8.72991L10.4515 6.15778C10.5285 6.07674 10.5708 5.96881 10.5694 5.85703C10.5679 5.74524 10.5229 5.63844 10.4439 5.55939C10.3648 5.48034 10.258 5.4353 10.1462 5.43386C10.0344 5.43243 9.92651 5.47473 9.84546 5.55173L7.27334 8.12385L2.86162 5.9772H2.85787H2.86537L13.1458 2.85582L10.0287 13.1363Z"
                    fill="#FFFFFF"
                  />
                </Svg>
              </View>
              <View>
                <Text style={styles.popupTitle}>Request Sent to</Text>
                <Text style={styles.popupTitle}>Family Member</Text>
              </View>
              <Text style={styles.popupBody}>

                We’ve sent an approval link to{' '}
                <Text style={styles.popupName}>{lastSentContact.name.replace(' ', '\u00A0')}</Text>
                {' '}
                <Text style={styles.popupName}>{`(${lastSentContact.relationship})`}</Text>
                . They just need to tap the link in their message to confirm they are your emergency contact. You’ll see a "Verified" badge on your profile once they’ve approved.
              </Text>
              <View style={styles.popupActions}>
                <PrimaryButton label="Close" onPress={() => setShowSentPopup(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  toggleLabel: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[800],
  },
  sectionLabel: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    lineHeight: theme.typography.h5.lineHeight,
    color: theme.colors.neutral[900],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  contactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: 2,
  },
  contactMeta: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[600],
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.tertiary,
    marginHorizontal: theme.spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.base,
    borderWidth: 1.5,
    borderColor: theme.colors.border.green,
  },
  addButtonPlus: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(20),
    color: theme.colors.primary,
  },
  addButtonText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: responsiveFontSize(theme.typography.label.fontSize),
    color: theme.colors.primary,
  },
  footer: {
    marginTop: 'auto',
  },
  footerNote: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
    lineHeight: 20,
  },
  errorText: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: responsiveFontSize(theme.typography.caption.fontSize),
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#09190A',
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
    marginLeft: 40, // balance the 40px close button so the title stays centered
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
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: theme.spacing.md,
  },
  countryCodeText: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(16),
    color: theme.colors.neutral[900],
  },
  chevron: {
    marginLeft: 6,
  },
  countryCodeDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: theme.colors.forestGreen[100],
    position: 'absolute',
    right: 0,
  },
  modalFooter: {
    marginTop: 'auto',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  popupCard: {
    width: '100%',
    maxWidth: 312,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    backgroundColor: theme.colors.background.layout,
  },
  popupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.forestGreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  popupTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    lineHeight: 30,
    fontSize: 20,
    color: theme.colors.neutral[900],
    textAlign: 'center',
  },
  popupBody: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: theme.spacing.xxl,
  },
  popupActions: {
    width: '100%',
  },
  popupName: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontWeight: '700',
    fontSize: responsiveFontSize(theme.typography.bodyMedium.fontSize),
    color: '#2E7D32',
  },
});

export default CircleOfCareScreen;
