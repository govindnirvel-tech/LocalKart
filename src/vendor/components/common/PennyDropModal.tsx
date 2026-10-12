import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { fonts } from '@/theme/fonts';
import {
  CrossIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  FileTextIcon,
  CameraIcon,
  ImageIcon,
} from './Icons';

interface PennyDropModalProps {
  visible: boolean;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  onClose: () => void;
  onVerificationComplete: (result: {
    chequeDocName: string;
    verifiedBankName: string;
    beneficiaryName: string;
    pennyDropStatus: 'SUCCESS';
    utrNumber: string;
  }) => void;
}

export const PennyDropModal: React.FC<PennyDropModalProps> = ({
  visible,
  accountNumber,
  accountHolderName,
  ifscCode,
  onClose,
  onVerificationComplete,
}) => {
  const [stage, setStage] = useState<'pick' | 'verifying' | 'success'>('pick');
  const [selectedSource, setSelectedSource] = useState<'cheque' | 'passbook' | 'pdf'>('cheque');
  const [currentStepText, setCurrentStepText] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const maskedAccount = accountNumber
    ? `•••• •••• ${accountNumber.slice(-4)}`
    : '•••• •••• 0481';

  const startPennyDrop = (sourceType: 'cheque' | 'passbook' | 'pdf') => {
    setSelectedSource(sourceType);
    setStage('verifying');
    setCurrentStepText('Connecting to NPCI IMPS Clearing House...');

    setTimeout(() => {
      setCurrentStepText(`Transferring ₹1.00 test penny to A/C ${maskedAccount}...`);

      setTimeout(() => {
        setCurrentStepText('Awaiting Real-time Bank Response...');

        setTimeout(() => {
          const generatedUtr = `NPCI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
          setUtrNumber(generatedUtr);
          setStage('success');
        }, 900);
      }, 900);
    }, 700);
  };

  const handleConfirm = () => {
    const fileName =
      selectedSource === 'cheque'
        ? 'Cancelled_Cheque_Proof.jpg'
        : selectedSource === 'passbook'
        ? 'Bank_Passbook_Front_Page.jpg'
        : 'Bank_Statement_Official.pdf';

    onVerificationComplete({
      chequeDocName: fileName,
      verifiedBankName: 'HDFC Bank, Vijay Nagar Branch',
      beneficiaryName: accountHolderName || 'AMAN SHARMA',
      pennyDropStatus: 'SUCCESS',
      utrNumber: utrNumber || 'NPCI987123405912',
    });
    handleClose();
  };

  const handleClose = () => {
    setStage('pick');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <ShieldCheckIcon size={22} color="#00B074" />
              </View>
              <View>
                <Text style={styles.title}>Bank & Cheque Verification</Text>
                <Text style={styles.subtitle}>NPCI Automated Penny Drop Authentication</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={handleClose}>
              <CrossIcon size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {stage === 'pick' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.desc}>
                To prevent fraud and fake bank details, LocalKart validates your bank account via instant
                ₹1 IMPS Penny Drop directly from the RBI/NPCI clearing house.
              </Text>

              {/* Target Bank Card */}
              <View style={styles.bankPreviewCard}>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>Account Holder:</Text>
                  <Text style={styles.bankVal}>{accountHolderName || 'Aman Sharma'}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>Account Number:</Text>
                  <Text style={styles.bankValMono}>{maskedAccount}</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankKey}>IFSC Code:</Text>
                  <Text style={styles.bankValMono}>{ifscCode || 'HDFC0001234'}</Text>
                </View>
              </View>

              <Text style={styles.pickTitle}>Select Bank Document to Upload:</Text>

              <View style={styles.optionsList}>
                <TouchableOpacity
                  style={styles.optionItem}
                  activeOpacity={0.8}
                  onPress={() => startPennyDrop('cheque')}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#FEE8F0' }]}>
                    <CameraIcon size={20} color="#FF5790" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionName}>Upload Cancelled Cheque</Text>
                    <Text style={styles.optionSub}>Name printed on cheque leaf</Text>
                  </View>
                  <Text style={styles.recommendedBadge}>RECOMMENDED</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionItem}
                  activeOpacity={0.8}
                  onPress={() => startPennyDrop('passbook')}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#EBF2FF' }]}>
                    <ImageIcon size={20} color="#004BFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionName}>Bank Passbook Front Page</Text>
                    <Text style={styles.optionSub}>Clear photo showing account & IFSC</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionItem}
                  activeOpacity={0.8}
                  onPress={() => startPennyDrop('pdf')}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#F0FDF4' }]}>
                    <FileTextIcon size={20} color="#00B074" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionName}>Bank Account Statement (PDF)</Text>
                    <Text style={styles.optionSub}>Recent e-statement with bank logo</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {stage === 'verifying' && (
            <View style={styles.verifyingBox}>
              <ActivityIndicator size="large" color="#00B074" />
              <Text style={styles.verifyingTitle}>Executing ₹1 Penny Drop</Text>
              <Text style={styles.verifyingSub}>{currentStepText}</Text>

              <View style={styles.processSteps}>
                <Text style={styles.processStepItem}>● Depositing ₹1.00 via IMPS Network</Text>
                <Text style={styles.processStepItem}>● Fetching Core Banking System (CBS) Name</Text>
                <Text style={styles.processStepItem}>● Cross-referencing against PAN Name</Text>
              </View>
            </View>
          )}

          {stage === 'success' && (
            <View style={styles.successCard}>
              <View style={styles.successBadgeRow}>
                <CheckCircleIcon size={18} color="#00B074" />
                <Text style={styles.successBadgeText}>PENNY DROP VERIFIED (100% MATCH)</Text>
              </View>

              <Text style={styles.successTitle}>Bank Account Authenticated!</Text>
              <Text style={styles.successSub}>
                ₹1.00 successfully credited. Beneficiary name retrieved directly from bank matches your PAN card.
              </Text>

              <View style={styles.resultDetailsBox}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultKey}>Bank Response:</Text>
                  <Text style={styles.resultVal}>HDFC Bank (Active)</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultKey}>Beneficiary Name:</Text>
                  <Text style={[styles.resultVal, { color: '#00B074', fontWeight: 'bold' }]}>
                    {accountHolderName || 'AMAN SHARMA'}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultKey}>Name Match Score:</Text>
                  <Text style={[styles.resultVal, { color: '#00B074', fontWeight: 'bold' }]}>
                    100% Exact Match
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultKey}>IMPS UTR No:</Text>
                  <Text style={styles.resultValMono}>{utrNumber}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.attachSuccessBtn}
                activeOpacity={0.88}
                onPress={handleConfirm}
              >
                <Text style={styles.attachSuccessBtnText}>Confirm & Attach Bank Proof</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#8E8E93',
  },
  desc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#707070',
    lineHeight: 18,
    marginBottom: 12,
  },
  bankPreviewCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 8,
    marginBottom: 16,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankKey: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
  },
  bankVal: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  bankValMono: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12,
    color: '#FF5790',
  },
  pickTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
    marginBottom: 10,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 12,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionName: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  optionSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  recommendedBadge: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9,
    color: '#FF5790',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  // Verifying
  verifyingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 12,
  },
  verifyingTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  verifyingSub: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#00B074',
    textAlign: 'center',
  },
  processSteps: {
    backgroundColor: '#FAFBFC',
    padding: 14,
    borderRadius: 12,
    gap: 6,
    width: '100%',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  processStepItem: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
  },
  // Success Card
  successCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 10,
  },
  successBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  successBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#00B074',
    letterSpacing: 0.5,
  },
  successTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  successSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    lineHeight: 16,
  },
  resultDetailsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 8,
    marginTop: 4,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultKey: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
  },
  resultVal: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#181C1F',
  },
  resultValMono: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  attachSuccessBtn: {
    backgroundColor: '#00B074',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  attachSuccessBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
