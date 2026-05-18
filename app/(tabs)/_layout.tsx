import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSizes, FontWeights } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
  color,
}: {
  name: IoniconsName;
  focused: boolean;
  color: string;
}) {
  return <Ionicons name={focused ? name : `${name}-outline` as IoniconsName} size={24} color={color} />;
}

export default function TabLayout() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: tabBarPaddingBottom,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.semibold,
          marginTop: 2,
        },
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Cursos',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="book" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bar-chart" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="library" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="people" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
