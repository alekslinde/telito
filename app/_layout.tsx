/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '../i18n';
import { useRemotes } from '../store/remotes';

export default function Layout() {
  const load = useRemotes((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontSize: 24, fontWeight: '700' },
        // Large headers + no animations = faster on old phones
        animation: 'none',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Telito' }} />
      <Stack.Screen name="onboarding/model" options={{ title: 'Step 1: Your TV' }} />
      <Stack.Screen name="onboarding/connect" options={{ title: 'Step 2: Connect' }} />
      <Stack.Screen name="onboarding/save" options={{ title: 'Step 3: Name it' }} />
      <Stack.Screen name="remote/[id]" options={{ title: 'Remote' }} />
    </Stack>
  );
}
