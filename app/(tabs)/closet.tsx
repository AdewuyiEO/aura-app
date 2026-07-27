import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../src/data/store';
import { useTheme } from '../../src/design/theme';
import { useToast } from '../../src/ui/toast';
import { Chip } from '../../src/design/components/Chip';
import { EmptyState } from '../../src/design/components/EmptyState';
import { GarmentArt } from '../../src/design/art/garments';
import { slotOf } from '../../src/domain/garments';
import type { Garment, Slot } from '../../src/domain/types';

const FILTERS: { id: 'all' | Slot; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'top', label: 'Tops' },
  { id: 'bottom', label: 'Bottoms' },
  { id: 'outer', label: 'Outerwear' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'dress', label: 'Dresses' },
];

export default function ClosetScreen() {
  const { c, type, layout, radius, space } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const items = useStore((s) => s.items);
  const seedDemo = useStore((s) => s.seedDemo);
  const [filter, setFilter] = useState<'all' | Slot>('all');

  const active = useMemo(() => items.filter((i) => i.status !== 'archived'), [items]);
  const shown = useMemo(
    () => (filter === 'all' ? active : active.filter((i) => slotOf(i.type) === filter)),
    [active, filter],
  );
  const needTags = active.filter((i) => !i.confirmed).length;

  if (active.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: c.paper, paddingTop: insets.top + 8 }}>
        <View style={[styles.hdr, { paddingHorizontal: layout.gutter }]}>
          <Text style={{ ...type.title, color: c.ink }}>Closet</Text>
        </View>
        <EmptyState
          title="Your closet's empty."
          body="Add 5 things and Aura can style you."
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
      <View style={[styles.hdr, { paddingHorizontal: layout.gutter }]}>
        <Text style={{ ...type.title, color: c.ink }}>Closet</Text>
        <Pressable onPress={() => toast({ message: 'Add flow — next milestone' })} hitSlop={8}>
          <Text style={{ fontSize: 24, color: c.ink }}>＋</Text>
        </Pressable>
      </View>

      {/* segmented (Items active) */}
      <View style={[styles.seg, { backgroundColor: c.chalk, borderRadius: radius.control, marginHorizontal: layout.gutter }]}>
        <View style={[styles.segItem, { backgroundColor: c.paper, borderRadius: 6 }]}>
          <Text style={{ ...type.caption, color: c.ink, fontWeight: '600' }}>Items {active.length}</Text>
        </View>
        <Pressable style={styles.segItem} onPress={() => toast({ message: 'Outfits view — beta' })}>
          <Text style={{ ...type.caption, color: c.slate, fontWeight: '600' }}>Outfits</Text>
        </Pressable>
        <Pressable style={styles.segItem} onPress={() => toast({ message: 'Sets — beta' })}>
          <Text style={{ ...type.caption, color: c.slate, fontWeight: '600' }}>Sets</Text>
        </Pressable>
      </View>

      {/* filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: layout.gutter, paddingTop: 14 }}>
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />
        ))}
      </ScrollView>

      {/* sort + tagging queue */}
      <View style={[styles.sortRow, { paddingHorizontal: layout.gutter }]}>
        <Text style={{ ...type.label, color: c.slate }}>Sort: Recent ▾</Text>
        {needTags > 0 && (
          <Pressable onPress={() => toast({ message: `${needTags} items awaiting tag confirmation` })}>
            <Text style={{ ...type.label, color: c.signal }}>{needTags} need tags ▸</Text>
          </Pressable>
        )}
      </View>

      {/* grid */}
      <View style={[styles.grid, { paddingHorizontal: layout.gutter }]}>
        {shown.map((g: Garment) => (
          <Pressable
            key={g.id}
            onPress={() => toast({ message: 'Item detail — next milestone' })}
            style={[styles.tile, { backgroundColor: c.chalk, borderRadius: radius.content }]}
          >
            <GarmentArt type={g.type} color={g.color} size={80} />
            {!g.confirmed && <View style={[styles.dot, { backgroundColor: c.signal }]} />}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 12 },
  seg: { flexDirection: 'row', padding: 3 },
  segItem: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    position: 'relative',
  },
  dot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 9 },
});
