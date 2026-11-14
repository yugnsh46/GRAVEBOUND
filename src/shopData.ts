export type ItemKind = 'outfit' | 'hat' | 'face' | 'back' | 'pet' | 'struct';
export interface Item { id: string; kind: ItemKind; key: string; name: string; price: number; desc: string; icon: string }

const it = (kind: ItemKind, key: string, name: string, price: number, desc: string, icon: string): Item => ({ id: `${kind}:${key}`, kind, key, name, price, desc, icon });

export const OUTFITS: Item[] = [
  it('outfit', 'default', 'Builder\u2019s Tee', 0, 'The classic spotted tee and green shorts.', '👕'),
  it('outfit', 'hivis', 'Hi-Vis Builder', 60, 'Yellow safety vest with reflective stripes.', '🦺'),
  it('outfit', 'lab', 'Lab Researcher', 80, 'Crisp white coat and slate trousers.', '🥼'),
  it('outfit', 'hoodie', 'Midnight Hoodie', 90, 'Cozy navy hoodie for late-night shipping.', '🧥'),
  it('outfit', 'neon', 'Neon Cyber', 120, 'Black techwear with cyan and magenta trim.', '🕶️'),
  it('outfit', 'royal', 'Royal Architect', 150, 'Purple robe with gold trim for the city founder.', '👑'),
];
export const HATS: Item[] = [
  it('hat', 'cap', 'Red Cap', 30, 'A casual cap with a stiff visor.', '🧢'),
  it('hat', 'hardhat', 'Hard Hat', 40, 'Safety first on every construction plot.', '⛑️'),
  it('hat', 'tophat', 'Top Hat', 90, 'Formal. Mysterious. Slightly too tall.', '🎩'),
  it('hat', 'crown', 'Golden Crown', 140, 'For the sovereign of the graveyard.', '👑'),
];
export const FACES: Item[] = [
  it('face', 'shades', 'Sunglasses', 50, 'Dark lenses for bright ideas.', '🕶️'),
  it('face', 'goggles', 'Engineer Goggles', 60, 'Blue-tinted lab goggles.', '🥽'),
];
export const BACKS: Item[] = [
  it('back', 'backpack', 'Explorer Backpack', 60, 'Room for scrap, snacks and blueprints.', '🎒'),
  it('back', 'cape', 'Hero Cape', 100, 'Billows heroically. Does not fly.', '🦸'),
  it('back', 'wings', 'Angel Wings', 160, 'For projects brought back from the dead.', '🪽'),
];
export const COSMETICS: Item[] = [...HATS, ...FACES, ...BACKS];
export const PETS: Item[] = [
  it('pet', 'bunny', 'Pocket Bunny', 70, 'Hops along behind you.', '🐰'),
  it('pet', 'cat', 'Grave Cat', 80, 'Silent, grey, and always watching.', '🐱'),
  it('pet', 'dog', 'Plot Pup', 90, 'Loyal. Follows you from plot to plot.', '🐶'),
  it('pet', 'robot', 'Helper Drone', 150, 'A hovering bot with a glowing eye.', '🤖'),
  it('pet', 'dragon', 'Baby Dragon', 220, 'Small, green, and very proud.', '🐲'),
];
export const STRUCTURES: Item[] = [
  it('struct', 'flowers', 'Flower Bed', 40, 'A splash of colour in the plaza.', '🌷'),
  it('struct', 'bench', 'Park Bench', 50, 'A quiet place to rest between builds.', '🪑'),
  it('struct', 'fountain', 'Plaza Fountain', 100, 'Glowing water at the heart of the city.', '⛲'),
  it('struct', 'statue', 'Builder Statue', 130, 'A golden monument to the one who builds.', '🗿'),
  it('struct', 'gazebo', 'Garden Gazebo', 120, 'Pillars, a red roof and shade.', '🏛️'),
  it('struct', 'clock', 'Clock Tower', 180, 'Tall, glowing, and always on time.', '🕰️'),
];
export const ITEMS: Item[] = [...OUTFITS, ...COSMETICS, ...PETS, ...STRUCTURES];
export const STRUCT_ORDER = STRUCTURES.map((s) => s.key);

/** Half-width / half-depth of every structure, used to stop two things being placed on top of each other. */
export const STRUCT_FOOT: Record<string, [number, number]> = {
  flowers: [25, 14], bench: [20, 8], fountain: [29, 29], statue: [18, 18], gazebo: [35, 35], clock: [20, 20],
};
/** Where structures used to stand before they could be placed anywhere (old saves are migrated to these spots). */
export const STRUCT_DEFAULT_SLOTS = STRUCT_ORDER.map((_, k) => ({ x: 660 + 520 * k, y: 505 }));

export const SKINS: { id: string; name: string; c: string; shade: string }[] = [
  { id: 'light', name: 'Light', c: '#e3aa7c', shade: '#c98a5e' },
  { id: 'fair', name: 'Fair', c: '#f1c9a5', shade: '#d9a67e' },
  { id: 'tan', name: 'Tan', c: '#c68b5c', shade: '#a96e44' },
  { id: 'brown', name: 'Brown', c: '#8d5a3a', shade: '#734628' },
  { id: 'deep', name: 'Deep', c: '#5a3a26', shade: '#46291a' },
];
export const HAIRS: { id: string; name: string; main: string; hl: string; brow: string; beard: string }[] = [
  { id: 'brown', name: 'Brown', main: '#3b2616', hl: '#58381f', brow: '#9b4a2a', beard: '#8f9bb5' },
  { id: 'black', name: 'Black', main: '#15151a', hl: '#2a2a33', brow: '#3a3a44', beard: '#3a3a44' },
  { id: 'blonde', name: 'Blonde', main: '#c9a545', hl: '#e3c566', brow: '#a8842a', beard: '#d9bf6a' },
  { id: 'red', name: 'Red', main: '#9a3b1c', hl: '#b9502a', brow: '#7a2e14', beard: '#a8482a' },
  { id: 'silver', name: 'Silver', main: '#aeb6c4', hl: '#d0d6e0', brow: '#7b8394', beard: '#cfd5df' },
  { id: 'pink', name: 'Pink', main: '#d9608f', hl: '#e98ab0', brow: '#a8446c', beard: '#e48ab8' },
];
