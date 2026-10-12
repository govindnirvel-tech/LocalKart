import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  setAppMode,
  setStep,
  nextStep,
  prevStep,
  updateBusiness,
  updateAddress,
  updateDocuments,
  updateBank,
  setTermsAccepted,
  submitVerification,
} from '../store/vendorOnboardingSlice';
import { OnboardingHeader } from '../components/OnboardingHeader';
import { StepProgressBar } from '../components/StepProgressBar';
import { BusinessInfoStep } from '../components/steps/BusinessInfoStep';
import { HyperlocalAddressStep } from '../components/steps/HyperlocalAddressStep';
import { TaxLegalStep } from '../components/steps/TaxLegalStep';
import { BankPayoutStep } from '../components/steps/BankPayoutStep';
import { ReviewSubmitStep } from '../components/steps/ReviewSubmitStep';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'VendorOnboarding'>;

export function VendorOnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const dispatch = useDispatch();
  const onboardingState = useSelector(
    (state: RootState) => state.vendorOnboarding
  );
  const { currentStep, business, address, documents, bank, termsAccepted } =
    onboardingState;

  useEffect(() => {
    if (route.params?.initialStep) {
      dispatch(setStep(route.params.initialStep));
    }
  }, [route.params?.initialStep, dispatch]);

  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(prevStep());
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      dispatch(setAppMode('customer'));
    }
  };

  const handleSaveExit = () => {
    dispatch(setAppMode('customer'));
  };

  const handleSubmit = () => {
    dispatch(submitVerification());
    navigation.navigate('VendorUnderReview', {
      referenceId: onboardingState.referenceId,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Persistent Header */}
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={5}
        onBack={handleBack}
        onSaveExit={handleSaveExit}
      />

      {/* Progress Bar & Indicators */}
      <StepProgressBar currentStep={currentStep} totalSteps={5} />

      {/* Multi-Step Body */}
      <View style={styles.body}>
        {currentStep === 1 && (
          <BusinessInfoStep
            data={business}
            onChange={(fields) => dispatch(updateBusiness(fields))}
            onNext={() => dispatch(nextStep())}
          />
        )}

        {currentStep === 2 && (
          <HyperlocalAddressStep
            data={address}
            onChange={(fields) => dispatch(updateAddress(fields))}
            onNext={() => dispatch(nextStep())}
            onPrev={() => dispatch(prevStep())}
          />
        )}

        {currentStep === 3 && (
          <TaxLegalStep
            data={documents}
            category={business.category}
            onChange={(fields) => dispatch(updateDocuments(fields))}
            onNext={() => dispatch(nextStep())}
            onPrev={() => dispatch(prevStep())}
          />
        )}

        {currentStep === 4 && (
          <BankPayoutStep
            data={bank}
            onChange={(fields) => dispatch(updateBank(fields))}
            onNext={() => dispatch(nextStep())}
            onPrev={() => dispatch(prevStep())}
          />
        )}

        {currentStep === 5 && (
          <ReviewSubmitStep
            state={onboardingState}
            onGoToStep={(step) => dispatch(setStep(step))}
            onTermsToggle={() => dispatch(setTermsAccepted(!termsAccepted))}
            onSubmit={handleSubmit}
            onPrev={() => dispatch(prevStep())}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  body: {
    flex: 1,
  },
});

export default VendorOnboardingScreen;
