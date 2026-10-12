import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = ['Store', 'Location', 'KYC', 'Bank', 'Review'];

export const StepProgressBar = ({
  currentStep,
  totalSteps = 5,
}: StepProgressBarProps) => {
  const progressPercent = ((currentStep) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Linear Track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Step Indicators */}
      <View style={styles.stepsRow}>
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={label} style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                ]}
              >
                {isCompleted ? (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      isCurrent && styles.circleTextCurrent,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isCurrent || isCompleted) && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FAFBFC',
  },
  track: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    backgroundColor: '#FF5790',
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    width: 58,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCurrent: {
    backgroundColor: '#FF5790',
    borderColor: '#FF5790',
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  circleCompleted: {
    backgroundColor: '#17BE5A',
    borderColor: '#17BE5A',
  },
  circleText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#707070',
  },
  circleTextCurrent: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8D8D8D',
  },
  stepLabelActive: {
    fontFamily: fonts.nunito.bold,
    color: '#181C1F',
  },
});
