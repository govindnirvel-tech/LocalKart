import React from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { ThemeProvider } from '@shopify/restyle';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { lightTheme, darkTheme } from '@/theme';
import RootNavigator from '@/navigation/RootNavigator';
import { store } from '@/store';

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const navTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.mainBackground,
      card: theme.colors.mainBackground,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
    },
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <ThemeProvider theme={theme}>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}