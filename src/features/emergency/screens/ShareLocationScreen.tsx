import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { theme } from '@/theme';
import { Screen, Header, Spacer } from '@/components/layouts';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { SelectableChip } from '@/components/inputs';
import { Icon } from '@/components/icons';
import { Snackbar } from '@/components/feedback';
import { responsiveFontSize } from '@/utils/responsive';
import { SHARE_CONTACTS, MOCK_LOCATION } from '../data';

type PermissionState = 'checking' | 'granted' | 'denied';

// "Share Location" (Figma 1372:8432) — real OS location permission + device position,
// reverse-geocoded like AddressScreen; contacts and the share action itself are mocked
// until the emergency-share API exists.
export const ShareLocationScreen: React.FC = () => {
  const [permission, setPermission] = useState<PermissionState>('checking');
  const [place, setPlace] = useState(MOCK_LOCATION.place);
  const [address, setAddress] = useState(MOCK_LOCATION.address);
  const [selectedContactId, setSelectedContactId] = useState(SHARE_CONTACTS[0].id);
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const requestLocation = async () => {
    setPermission('checking');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [result] = await Location.reverseGeocodeAsync(position.coords);
        if (result) {
          const line = [result.street, result.district, result.city, result.region, result.postalCode]
            .filter(Boolean)
            .join(', ');
          if (result.name || result.city) setPlace(`You are in ${result.name || result.city}`);
          if (line) setAddress(line);
        }
      } catch {
        // Device position/geocoding is best-effort on web/simulators — mock address stands in.
      }
    } catch {
      setPermission('denied');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleShare = async () => {
    setSharing(true);
    const contact = SHARE_CONTACTS.find((c) => c.id === selectedContactId);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSharing(false);
    setToast({ visible: true, message: `Location shared with ${contact?.label ?? 'contact'}` });
  };

  return (
    <Screen statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Share Location" leftIcon="back" transparent />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {permission === 'denied' ? (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Icon name="placeLocation" variant="outline" size={32} color={theme.colors.tertiary} />
            </View>
            <Text style={styles.permissionTitle}>Location access needed</Text>
            <Text style={styles.permissionBody}>
              ServeSaathi needs permission to access your device location so it can be shared with
              your emergency contacts.
            </Text>
            <Spacer size="lg" />
            <SecondaryButton label="Allow Location Access" onPress={requestLocation} />
          </View>
        ) : (
          <View style={styles.locationCard}>
            <View style={styles.mapPlaceholder}>
              <Icon name="placeLocation" variant="filled" size={40} color={theme.colors.tertiary} />
            </View>
            <Text style={styles.place}>{permission === 'checking' ? 'Locating you…' : place}</Text>
            <Text style={styles.address}>{address}</Text>
          </View>
        )}

        <Spacer size="xl" />

        <Text style={styles.question}>Whom are you sharing location with?</Text>
        <Spacer size="sm" />
        <View style={styles.chipList}>
          {SHARE_CONTACTS.map((contact) => (
            <SelectableChip
              key={contact.id}
              label={contact.label}
              selected={selectedContactId === contact.id}
              onPress={() => setSelectedContactId(contact.id)}
            />
          ))}
        </View>

        <Spacer size="xl" />

        <PrimaryButton
          label="Share Location"
          onPress={handleShare}
          loading={sharing}
          disabled={permission !== 'granted'}
        />
        <Spacer size="lg" />
      </ScrollView>

      <Snackbar
        visible={toast.visible}
        message={toast.message}
        type="success"
        onDismiss={() => setToast({ visible: false, message: '' })}
        bottomOffset={100} // clear the floating bottom tab bar (this screen sits inside HelplineStack)
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  locationCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  mapPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.background.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  place: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
  },
  address: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
  permissionCard: {
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 200,
    backgroundColor: theme.colors.vividOrange[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionTitle: {
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h4.fontSize),
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  permissionBody: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
  question: {
    fontFamily: theme.typography.h5.fontFamily,
    fontSize: responsiveFontSize(theme.typography.h5.fontSize),
    color: theme.colors.neutral[900],
  },
  chipList: {
    gap: theme.spacing.sm,
  },
});
