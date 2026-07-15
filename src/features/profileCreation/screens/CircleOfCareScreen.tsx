import React, { useState } from 'react';
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

// "Profile Creation 5a/5b/5c/5d" (Figma 1248:44491 / 44283 / 44310 / 44544) — step 5 of 6.
// Sharing toggles + emergency contacts list, with a full-screen "Emergency Contacts" form modal.
const RELATIONSHIPS = ['Son', 'Daughter', 'Partner', 'Relative', 'Friend', 'Other'];

interface EmergencyContact {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  status: 'waiting' | 'accepted';
}

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
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Modal form state
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

  const isPhoneValid = isValidIndianMobile(phone);
  const phoneError =
    phone.length === 10 && !isPhoneValid
      ? 'Enter a valid 10-digit mobile number starting with 6–9'
      : undefined;
  const isContactFormValid =
    isValidName(firstName) && isValidName(lastName) && relationship !== null && isPhoneValid;

  const handleRequestSend = () => {
    if (!isContactFormValid) return;
    setContacts((prev) => [
      ...prev,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        relationship: relationship ?? 'Other',
        phone: `+91 ${phone}`,
        status: 'waiting',
      },
    ]);
    setFirstName('');
    setLastName('');
    setRelationship(null);
    setPhone('');
    setShowForm(false);
  };

  const handleContinue = () => {
    navigation.navigate('ProfileAccessibility');
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

        {contacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {contact.firstName} {contact.lastName}
              </Text>
              <View style={styles.contactMetaRow}>
                <Text style={styles.contactMeta}>{contact.relationship}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.contactMeta}>{contact.phone}</Text>
              </View>
            </View>
            <StatusChip
              label="Waiting"
              bgColor={theme.colors.tertiary}
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
          <PrimaryButton label="Continue" onPress={handleContinue} />
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
              {RELATIONSHIPS.map((item) => (
                <SelectableChip
                  key={item}
                  label={item}
                  selected={relationship === item}
                  onPress={() => setRelationship(item)}
                  style={styles.chipHalf}
                />
              ))}
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
              <PrimaryButton
                label="Request Send"
                onPress={handleRequestSend}
                disabled={!isContactFormValid}
              />
              <Spacer size="xl" />
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
    borderRadius: theme.radius.md,
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
    gap: theme.spacing.xs,
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: 48,
    borderRadius: theme.radius.md,
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
});

export default CircleOfCareScreen;
