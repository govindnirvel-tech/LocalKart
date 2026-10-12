import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '@/theme/fonts';

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
  onSaveExit?: () => void;
}

export const OnboardingHeader = ({
  currentStep,
  totalSteps = 5,
  onBack,
  onSaveExit,
}: OnboardingHeaderProps) => {
  return (
    <View style={styles.header}>
      {/* Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 19l-7-7 7-7"
            stroke="#181C1F"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {/* Step Badge */}
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>
          STEP {currentStep} OF {totalSteps}
        </Text>
      </View>

      {/* Save & Exit Option */}
      {onSaveExit ? (
        <TouchableOpacity
          style={styles.saveExitButton}
          activeOpacity={0.7}
          onPress={onSaveExit}
        >
          <Text style={styles.saveExitText}>Save & Exit</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBadge: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  stepBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
    letterSpacing: 0.8,
  },
  saveExitButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  saveExitText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#707070',
  },
  spacer: {
    width: 40,
  },
});
