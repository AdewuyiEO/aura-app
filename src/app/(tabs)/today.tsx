import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useStore } from '../../data/store';
import { useTheme } from '../../design/theme';
import { useToast } from '../_layout';
import { AuraOrb } from '../../design/components/AuraOrb';
import { Button } from '../../design/components/Button';
import { SwatchStrip, OutfitComposite } from '../../design/components/OutfitComposite';
import { ReasonPill } from '../../design/components/ReasonPill';
import { EmptyState } from '../../design/components/EmptyState';
import { colorOf } from '../../domain/garments';
import type { ColorId, Garment, GeneratedOutfit } from '../../domain/types';

export default function TodayScreen() {
  const { c, type, space, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const items = useStore((s) => s.items);
  const streak = useStore((s) => s.streak);
  const activeItems = useStore((s) => s.activeItems);
  const generateLooks = useStore((s) => s.generateLooks);
  const wearOutfit = useStore((s) => s.wearOutfit);
  const seedDemo = useStore((s) => s.seedDemo);

  const active = activeItems();
  const [drop, setDrop] = useState<GeneratedOutfit | null>(null);
  const [railSel, setRailSel] = useState<ColorId | null>(null);

  // (re)generate the drop whenever inventory changes and we don't have one
  const looks = useMemo(
    () => (active.length >= 5 ? generateLooks({ tempC: 31, formality: 3 }) : []),
    [items, railSel],
  );
  const current = drop ?? looks[0] ?? null;

  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const palette = useMemo(() => Array.from(new Set(active.map((i) => i.color))).slice(0, 7) as ColorId[], [items]);

  const onWear = () => {
    if (!current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const undo = wearOutfit(current);
    const hero = current.pieces[0];
    toast({
      message: `Logged. ${current.pieces.length} pieces, ${ordinal(hero.wearCount)} wear for the ${colorOf(hero.color).name.toLowerCase()} ${hero.material}.`,
      undo,
    });
    setDrop(null);
  };

  // ---- empty / sparse states ----
  if (active.length < 5) {
    return (
      <View style={{ flex: 1, backgroundColor: c.paper, paddingTop: insets.top + 8 }}>
        <Header dateStr={dateStr} streak={streak} onOrb={() => toast({ message: 'Aura sheet opens here' })} />
        <EmptyState
          title={`Aura needs 5 items\nto style you.`}
          body={`You have ${active.length}. Add a few and today's look appears here.`}
          primary={{ label: 'Add clothes', onPress: () => toast({ message: 'Camera + add flow (next milestone)' }) }}
          secondary={{ label: 'Try a demo closet', onPress: () => { seedDemo(); toast({ message: 'Loaded a demo closet — 20 items' }); } }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.paper }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 64 + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Header dateStr={dateStr} streak={streak} onOrb={() => toast({ message: 'Aura sheet opens here' })} />

      {/* THE RAIL */}
      <SwatchStrip colors={palette} selected={railSel} onSelect={setRailSel} />
      <View style={{ height: 1, backgroundColor: c.mist, marginHorizontal: layout.gutter, marginTop: 12 }} />

      {/* context strip */}
      <View style={styles.ctx}>
        <Text style={{ ...type.label, color: c.graphite }}>31°C</Text>
        <Dot color={c.ash} />
        <Text style={{ ...type.label, color: c.slate }}>Humid</Text>
        <Dot color={c.ash} />
        <Text style={{ ...type.label, color: c.slate }}>Standup </Text>
        <Text style={{ ...type.label, color: c.graphite }}>10:00</Text>
      </View>

      {/* DROP CARD */}
      <View style={{ marginHorizontal: layout.gutter, position: 'relative' }}>
        {current && <OutfitComposite pieces={current.pieces} height={466} />}
        {current && (
          <View style={{ position: 'absolute', left: 14, right: 20, bottom: 14 }}>
            <ReasonPill text={current.reason} />
          </View>
        )}
      </View>

      {/* piece dots */}
      <View style={styles.pieces}>
        {current?.pieces.map((p: Garment) => (
          <View key={p.id} style={{ width: 7, height: 7, borderRadius: 9, backgroundColor: c.ink, opacity: 0.85 }} />
        ))}
        <Text style={{ ...type.micro, color: c.slate, marginLeft: 4 }}>{current?.pieces.length} PIECES</Text>
      </View>

      {/* action row — anchored in the thumb zone */}
      <View style={[styles.actions, { paddingHorizontal: layout.gutter }]}>
        <Button label="Wearing this" variant="signal" onPress={onWear} fill />
        <Button label="Swap a piece" variant="secondary" onPress={() => toast({ message: 'Generator sheet opens here' })} />
        <Pressable
          onPress={() => toast({ message: 'Saved to “July”. Outfits stay in your closet.' })}
          style={[styles.iconBtn, { backgroundColor: c.chalk, borderRadius: radius.control }]}
        >
          <Text style={{ fontSize: 20, color: c.ink }}>⋯</Text>
        </Pressable>
      </View>

      {/* more looks rail */}
      <View style={{ marginTop: space.s7 }}>
        <Text style={{ ...type.heading, color: c.ink, paddingHorizontal: layout.gutter, marginBottom: 12 }}>
          More looks for today
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: layout.gutter }}>
          {looks.map((o: GeneratedOutfit, i: number) => (
            <Pressable key={i} onPress={() => { setDrop(o); Haptics.selectionAsync(); }} style={{ width: 140, height: 187, borderRadius: radius.content, backgroundColor: c.chalk, overflow: 'hidden' }}>
              <OutfitComposite pieces={o.pieces} height={187} />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* gap nudge — the only shopping on Today */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingHorizontal: layout.gutter, marginTop: space.s7 }}>
        <Text style={{ ...type.body, color: c.graphite, flex: 1 }}>
          One pair of white sneakers would unlock 11 new outfits.
        </Text>
        <Pressable onPress={() => toast({ message: 'Discover: gap fillers' })}>
          <Text style={{ ...type.body, color: c.signal, fontWeight: '600' }}>See ›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Header({ dateStr, streak, onOrb }: { dateStr: string; streak: number; onOrb: () => void }) {
  const { c, type, layout } = useTheme();
  return (
    <View style={[styles.hdr, { paddingHorizontal: layout.gutter }]}>
      <Text style={{ ...type.micro, color: c.slate }}>{dateStr.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ ...type.label, color: c.ink }}>{streak} 🔥</Text>
        <AuraOrb size={36} onPress={onOrb} />
      </View>
    </View>
  );
}

const Dot = ({ color }: { color: string }) => <View style={{ width: 3, height: 3, borderRadius: 9, backgroundColor: color }} />;

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const styles = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  ctx: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  pieces: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingTop: 12 },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 16 },
  iconBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
});
