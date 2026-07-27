import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/design/theme';
import { ToastProvider } from '../src/ui/toast';

/**
 * Root layout. Wraps the whole app in the providers every screen relies on:
 * gesture handler (for swipes/sheets), safe-area, theme (light/dark), and the
 * single-slot toast host. The Stack renders the (tabs) group.
 *
 * Fonts: the app boots on system fonts. To activate the real type
 * (Instrument Serif / Switzer / Geist Mono), drop the .ttf files into
 * assets/fonts and enable the useFonts block documented in
 * assets/fonts/README.md — no other change needed.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
