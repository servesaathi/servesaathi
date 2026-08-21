import React from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { theme } from '@/theme';
import { Screen, Header, Spacer } from '@/components/layouts';
import { ComparePopUpCard } from '@/components/cards';
import { EM_RESPONDERS } from '../data';
import { useThemeColors } from '@/hooks/useThemeColors';

// "EM Responder" list (Figma 1376:17625) — reached from the EM Responder quick action.
// Org detail pages aren't part of this section's Figma flow yet, so "See details" is a stub.
export const EMResponderScreen: React.FC = () => {
  const colors = useThemeColors();
  return (
    <Screen statusBarBg={colors.background.layout}>
      <Header title="EM Responder" leftIcon="back" transparent />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {EM_RESPONDERS.map((org) => (
            <ComparePopUpCard
              key={org.id}
              title={org.name}
              imageUri={org.image}
              imageAspectRatio={org.imageAspectRatio}
              location={org.city}
              rating={org.rating.toFixed(1)}
              verified={org.verified}
              showCompare={false}
              onSeeDetailsPress={() => Alert.alert(org.name, 'Organization details coming soon.')}
            />
          ))}
        </View>
        <Spacer size="giant" />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  list: {
    gap: theme.spacing.lg,
  },
});
