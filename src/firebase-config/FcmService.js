// import messaging from '@react-native-firebase/messaging';
// import { requestNotificationPermission } from './Notification';

// export const initFCM = async () => {
//   try {
//     const hasPermission = await requestNotificationPermission();

//     if (!hasPermission) {
//       console.log('Notification permission denied');
//       return null;
//     }

//     const token = await messaging().getToken();

//     if (token) {
//       console.log('======== YOUR FCM TOKEN ========');
//       console.log(token);

//       return token;
//     }

//     return null;
//   } catch (error) {
//     console.log('FCM Error:', error);
//     return null;
//   }
// };


import { getMessaging, getToken, onMessage } from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { requestNotificationPermission } from './Notification';

export const initFCM = async () => {
  try {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = getMessaging();
    const token = await getToken(messaging);

    if (token) {
      console.log('======== YOUR FCM TOKEN ========');
      console.log(token);
  
    }

    // Foreground me jab app open ho tab alert dikhayega
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      console.log('Foreground Message received:', JSON.stringify(remoteMessage, null, 2));

      const title =
        remoteMessage.notification?.title ||
        remoteMessage.data?.title ||
        'LocalKart';

      const body =
        remoteMessage.notification?.body ||
        remoteMessage.data?.body ||
        remoteMessage.data?.message ||
        'New message received from Firebase';


    });

    return unsubscribe;
  } catch (error) {
    console.log('FCM Error:', error);
    return null;
  }
};
