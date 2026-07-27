import React, { useState, useCallback, createContext, useContext } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { ThemeProvider, useTheme } from '../design/theme';
import { AuraOrb } from '../design/components/AuraOrb';
import { Toast, type ToastData } from '../design/components/Toast';

/* ---- lightweight toast context so any screen can raise one ---- */
const ToastCtx = createContext<(t: ToastData) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { c } = useTheme();
  const stroke = focused ? c.ink : c.slate;
  const common = { fill: 'none', stroke, strokeWidth: 1.5 } as const;
  switch (name) {
    case 'today':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Rect x={3} y={4} width={18} height={17} rx={2} {...common} />
          <Path d="M3 9h18M8 2v4M16 2v4" {...common} />
          <Circle cx={12} cy={15} r={1.6} fill={stroke} />
        </Svg>
      );
    case 'closet':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M12 3l7 5v11a1 1 0 01-1 1H6a1 1 0 01-1-1V8l7-5z" {...common} />
          <Path d="M12 3v6M8 19v-6h8v6" {...common} />
        </Svg>
      );
    case 'discover':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...common} />
        </Svg>
      );
    default:
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M5 21v-1a7 7 0 0114 0v1" {...common} />
        </Svg>
      );
  }
}

function Shell() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastData | null>(null);
  const raise = useCallback((t: ToastData) => setToast(t), []);

  return (
    <ToastCtx.Provider value={raise}>
      <View style={{ flex: 1, backgroundColor: c.paper }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              height: 64 + insets.bottom,
              paddingBottom: insets.bottom,
              backgroundColor: c.paper,
              borderTopColor: c.mist,
            },
            tabBarShowLabel: true,
            tabBarActiveTintColor: c.ink,
            tabBarInactiveTintColor: c.slate,
          }}
        >
          <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="today" focused={focused} /> }} />
          <Tabs.Screen name="closet" options={{ title: 'Closet', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="closet" focused={focused} /> }} />
          {/* docked orb — a real tab slot so it sits at the exact centre of the thumb arc */}
          <Tabs.Screen
            name="aura"
            options={{
              title: '',
              tabBarIcon: () => <AuraOrb size={44} />,
              tabBarButton: (props: any) => <Pressable {...props} onPress={() => raise({ message: 'Aura sheet — generator opens here' })} />,
            }}
          />
          <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="discover" focused={focused} /> }} />
          <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="you" focused={focused} /> }} />
        </Tabs>
        <Toast data={toast} onClear={() => setToast(null)} />
      </View>
    </ToastCtx.Provider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Shell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
