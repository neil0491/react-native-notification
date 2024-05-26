/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  PermissionsAndroid,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import WebView from 'react-native-webview';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM token:', token);
      }
    };
    messaging().onNotificationOpenedApp(async remoteMessage=>{
      console.log(JSON.stringify(remoteMessage));
      
    })
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    requestUserPermission();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const webviewRef = useRef<any>();
  const deviceHeight = Dimensions.get('window').height;
  const deviceWidth = Dimensions.get('window').width;

  const webViewcanGoBack = useRef(false);

  const handleBackButtonPress = () => {
    try {
      if (webviewRef) webviewRef.current?.goBack();

      if (webViewcanGoBack.current === false) {
        BackHandler.exitApp();
      }
    } catch (err: any) {
      console.log('[handleBackButtonPress] Error : ', err.message);
    }
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonPress,
      );
    };
  }, []);

  return (
    <SafeAreaView style={{width: deviceWidth, height: deviceHeight}}>
      <WebView
        ref={webviewRef}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        source={{uri: 'https://tvcom.uz/'}}
        onLoadProgress={({nativeEvent}) => {
          // This function is called everytime your web view loads a page
          // and here we change the state of can go back
          try {
            webViewcanGoBack.current = nativeEvent.canGoBack;
          } catch (err: any) {
            console.log('[handleBackButtonPress] Error : ', err.message);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});

export default App;
