import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '@/navigation/types';
import { theme } from '@/theme';
import { Screen, Spacer, Header, SegmentedTabs } from '@/components/layouts';
import { PrimaryButton } from '@/components/buttons';
import { PlanSelectCard } from '@/components/inputs';
import { responsiveFontSize } from '@/utils/responsive';

// "Subscription" (Figma 1248:44406) — plan picker after the Profile Creation wizard.
const MONTHLY_PLANS = [
  { id: 'essential', label: 'Essential Care', price: '₹ 1990.00' },
  { id: 'gold', label: 'Essential Care Gold', price: '₹ 3990.00' },
  { id: 'platinum', label: 'Essential Care Platinum', price: '₹ 6990.00' },
];

// Annual pricing = 12 months with the "Save 25%" discount applied
const ANNUAL_PLANS = [
  { id: 'essential', label: 'Essential Care', price: '₹ 17,910.00' },
  { id: 'gold', label: 'Essential Care Gold', price: '₹ 35,910.00' },
  { id: 'platinum', label: 'Essential Care Platinum', price: '₹ 62,910.00' },
];

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp<'Subscription'>>();
  const [billing, setBilling] = useState(0); // 0 = monthly, 1 = annually
  const [selectedPlan, setSelectedPlan] = useState('essential');

  const plans = billing === 0 ? MONTHLY_PLANS : ANNUAL_PLANS;

  const handleCheckout = () => {
    navigation.navigate('PaymentMethod');
  };

  return (
    <Screen scrollable statusBarBg={theme.colors.background.layout} statusBarStyle="dark-content">
      <Header title="Subscription" leftIcon="back" transparent />

      <View style={styles.content}>
        <Spacer size="md" />
        <Text style={styles.subtitle}>
          Upgrade your plan to unlock premium features designed for seamless care coordination,
          enhanced or organization, and secure data management
        </Text>

        <Spacer size="xxl" />
        <SegmentedTabs
          options={['Pay monthly', 'Pay annually']}
          activeIndex={billing}
          onChange={setBilling}
          variant="filled"
          badge={{ index: 1, label: 'Save 25%' }}
        />

        <Spacer size="xxl" />
        <View style={styles.plans}>
          {plans.map((plan) => (
            <PlanSelectCard
              key={plan.id}
              label={plan.label}
              price={plan.price}
              selected={selectedPlan === plan.id}
              onPress={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Checkout" onPress={handleCheckout} />
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
  subtitle: {
    fontFamily: theme.typography.bodyLarge.fontFamily,
    fontSize: responsiveFontSize(theme.typography.bodyLarge.fontSize),
    color: theme.colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  plans: {
    gap: theme.spacing.lg,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.xxl,
  },
});

export default SubscriptionScreen;
