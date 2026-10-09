/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BigButton } from '../components/BigButton';
import { useRemotes } from '../store/remotes';
import { Colors, Sizes } from '../theme';
import { useColorScheme } from 'react-native';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const { remotes, loaded, setActive, removeRemote } = useRemotes();

  if (!loaded) return <View style={[styles.wrap, { backgroundColor: c.background }]} />;

  return (
    <View style={[styles.wrap, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        {t('home.title')}
      </Text>
      {remotes.length === 0 ? (
        <View>
          <Text style={[styles.body, { color: c.text }]}>{t('home.empty')}</Text>
          <BigButton
            label={t('home.add')}
            accessibilityLabel={t('home.add')}
            icon="📺"
            onPress={() => router.push('/onboarding/model')}
          />
        </View>
      ) : (
        <FlatList
          data={remotes}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{item.name}</Text>
              <Text style={[styles.cardSub, { color: c.text }]}>{item.tvModel}</Text>
              <BigButton
                label={t('home.open')}
                accessibilityLabel={`${t('home.open')}: ${item.name}`}
                icon="▶"
                onPress={() => {
                  setActive(item.id);
                  router.push(`/remote/${item.id}`);
                }}
              />
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <BigButton
                    variant="secondary"
                    label={t('home.delete')}
                    accessibilityLabel={`${t('home.delete')}: ${item.name}`}
                    onPress={() =>
                      Alert.alert(t('home.delete_confirm'), item.name, [
                        { text: t('setup.back'), style: 'cancel' },
                        { text: 'OK', onPress: () => removeRemote(item.id) },
                      ])
                    }
                  />
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <BigButton
              variant="secondary"
              label={t('home.add')}
              accessibilityLabel={t('home.add')}
              icon="+"
              onPress={() => router.push('/onboarding/model')}
            />
          }
        />
      )}
      <Link href="/onboarding/model" accessibilityLabel={t('home.add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20 },
  title: { fontSize: Sizes.fontTitle, fontWeight: '800', marginBottom: 12 },
  body: { fontSize: Sizes.fontBase, marginBottom: 16, lineHeight: 30 },
  card: { borderRadius: Sizes.radius, borderWidth: 2, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 26, fontWeight: '800' },
  cardSub: { fontSize: 20, marginBottom: 8 },
  row: { flexDirection: 'row' },
});
