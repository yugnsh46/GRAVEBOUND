import { createStore } from './persist';
import { ITEMS, STRUCT_DEFAULT_SLOTS, STRUCT_ORDER } from './shopData';

export interface Look { outfit: string; skin: string; hair: string; hairStyle: 'short' | 'long'; beard: boolean }
export interface PlacedStruct { key: string; x: number; y: number }
export interface ShopState {
  coins: number; owned: string[]; look: Look;
  hat: string | null; face: string | null; back: string | null; pet: string | null; placed: PlacedStruct[];
}
export const START_COINS = 300; // everyone starts with 300 coins (testing)

const init: ShopState = {
  coins: START_COINS, owned: ['outfit:default'],
  look: { outfit: 'default', skin: 'light', hair: 'brown', hairStyle: 'short', beard: true },
  hat: null, face: null, back: null, pet: null, placed: [],
};
const s = createStore<ShopState>('gravebound-shop-v1', init);
/** Old saves stored `placed` as a list of keys on fixed plaza slots. Turn those into real positions. */
const fixPlaced = (st: ShopState): ShopState => {
  const raw = (Array.isArray(st.placed) ? st.placed : []) as unknown[];
  const seen = new Set<string>();
  const placed: PlacedStruct[] = [];
  raw.forEach((e) => {
    let p: PlacedStruct | null = null;
    if (typeof e === 'string') {
      const slot = STRUCT_DEFAULT_SLOTS[STRUCT_ORDER.indexOf(e)];
      if (slot) p = { key: e, x: slot.x, y: slot.y };
    } else if (e && typeof e === 'object') {
      const o = e as Partial<PlacedStruct>;
      if (typeof o.key === 'string' && Number.isFinite(o.x) && Number.isFinite(o.y)) p = { key: o.key, x: o.x as number, y: o.y as number };
    }
    if (p && !seen.has(p.key) && STRUCT_ORDER.includes(p.key)) { seen.add(p.key); placed.push(p); }
  });
  return { ...st, placed };
};
s.set(fixPlaced);
export const useShop = s.useValue;
export const getShop = s.get;

export const addCoins = (n: number) => s.set((st) => ({ ...st, coins: st.coins + n }));
export const resetTestCoins = () => s.set((st) => ({ ...st, coins: Math.max(st.coins, START_COINS) }));
export const setLook = (patch: Partial<Look>) => s.set((st) => ({ ...st, look: { ...st.look, ...patch } }));

/** Equip (or toggle off) an owned item. */
export function toggleItem(id: string) {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return;
  s.set((st) => {
    switch (item.kind) {
      case 'outfit': return { ...st, look: { ...st.look, outfit: item.key } };
      case 'hat': return { ...st, hat: st.hat === item.key ? null : item.key };
      case 'face': return { ...st, face: st.face === item.key ? null : item.key };
      case 'back': return { ...st, back: st.back === item.key ? null : item.key };
      case 'pet': return { ...st, pet: st.pet === item.key ? null : item.key };
      case 'struct': return st; // structures are put on the map with placeStruct (see placement.ts)
    }
  });
}

/** Put (or move) a structure at an exact spot on the map. */
export const placeStruct = (key: string, x: number, y: number) =>
  s.set((st) => ({ ...st, placed: [...st.placed.filter((p) => p.key !== key), { key, x: Math.round(x), y: Math.round(y) }] }));
/** Pick a structure back up (you keep owning it). */
export const removeStruct = (key: string) => s.set((st) => ({ ...st, placed: st.placed.filter((p) => p.key !== key) }));

export function isEquipped(st: ShopState, id: string) {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return false;
  switch (item.kind) {
    case 'outfit': return st.look.outfit === item.key;
    case 'hat': return st.hat === item.key;
    case 'face': return st.face === item.key;
    case 'back': return st.back === item.key;
    case 'pet': return st.pet === item.key;
    case 'struct': return st.placed.some((p) => p.key === item.key);
  }
}

/** Returns an error message, or null on success. Buying equips wearable items immediately; structures are placed by the player. */
export function buy(id: string): string | null {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return 'Unknown item.';
  const st = s.get();
  if (st.owned.includes(id)) return 'You already own this.';
  if (st.coins < item.price) return `Not enough coins. You need ${item.price - st.coins} more.`;
  s.set((x) => ({ ...x, coins: x.coins - item.price, owned: [...x.owned, id] }));
  if (item.kind !== 'struct') toggleItem(id);
  return null;
}
