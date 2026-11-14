import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Check, Gift, Shield, Shirt, PawPrint, Sparkles, Landmark } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CoinIcon } from '../components/CoinIcon';
import { Avatar } from '../world/Avatar';
import { buildSkin } from '../world/textures';
import { buy, isEquipped, removeStruct, resetTestCoins, setLook, START_COINS, toggleItem, useShop } from '../shop';
import { startPlacing } from '../placement';
import type { ShopState } from '../shop';
import { BACKS, FACES, HAIRS, HATS, OUTFITS, PETS, SKINS, STRUCTURES } from '../shopData';
import type { Item } from '../shopData';

type Tab = 'outfits' | 'cosmetics' | 'pets' | 'structures';

function Preview({ st }: { st: ShopState }) {
  const refs = { root: useRef(null), ub: useRef(null), hd: useRef(null), ll: useRef(null), rl: useRef(null), la: useRef(null), ra: useRef(null) };
  const skin = useMemo(() => buildSkin(st.look), [st.look]);
  const cos = useMemo(() => ({ hat: st.hat, face: st.face, back: st.back }), [st.hat, st.face, st.back]);
  const pet = PETS.find((p) => p.key === st.pet);
  return (
    <div className="shop-prev" aria-label="Character preview">
      <div className="prev-world"><div className="box" style={{ transform: 'rotateZ(90deg)' }}><Avatar refs={refs} skin={skin} cos={cos} /></div></div>
      <div className="prev-tags">{pet && <span>{pet.icon} {pet.name}</span>}<span>{OUTFITS.find((o) => o.key === st.look.outfit)?.name}</span></div>
    </div>
  );
}

export default function Shop({ onClose }: { onClose: () => void }) {
  const st = useShop();
  const [tab, setTab] = useState<Tab>('outfits');
  const [msg, setMsg] = useState('');

  const act = (item: Item) => {
    if (!st.owned.includes(item.id)) {
      const err = buy(item.id);
      setMsg(err ?? (item.kind === 'struct' ? `Bought ${item.name}! Press "Place on map" to choose where it goes.` : `Bought ${item.name}! It is equipped.`));
    } else toggleItem(item.id);
  };

  const place = (item: Item) => { startPlacing(item.key); onClose(); };

  const card = (item: Item) => {
    const owned = st.owned.includes(item.id);
    const on = isEquipped(st, item.id);
    const short = !owned && st.coins < item.price;
    const verb = { on: 'Equipped', off: 'Equip' };
    if (item.kind === 'struct') {
      return (
        <article key={item.id} className={`item ${on ? 'on' : ''}`}>
          <div className="item-ico">{item.icon}</div>
          <div className="item-body"><h4>{item.name}</h4><p>{item.desc}</p></div>
          <div className="item-foot struct">
            <span className="price"><CoinIcon size={15} /> {item.price}</span>
            {!owned ? <button className="btn tiny primary" disabled={short} onClick={() => act(item)}>{short ? `Need ${item.price - st.coins}` : 'Buy'}</button>
              : !on ? <button className="btn tiny primary" onClick={() => place(item)}><Landmark size={13} /> Place on map</button>
              : <span className="acts"><button className="btn tiny" onClick={() => place(item)}>Move</button><button className="btn tiny" onClick={() => { removeStruct(item.key); setMsg(`${item.name} picked up. You still own it.`); }}>Pick up</button></span>}
          </div>
        </article>
      );
    }
    return (
      <article key={item.id} className={`item ${on ? 'on' : ''}`}>
        <div className="item-ico">{item.icon}</div>
        <div className="item-body"><h4>{item.name}</h4><p>{item.desc}</p></div>
        <div className="item-foot">
          <span className={`price ${item.price === 0 ? 'free' : ''}`}>{item.price === 0 ? 'Free' : <><CoinIcon size={15} /> {item.price}</>}</span>
          <button className={`btn tiny ${on ? 'ok-btn' : owned ? '' : 'primary'}`} disabled={short} onClick={() => act(item)}>
            {!owned ? (short ? `Need ${item.price - st.coins}` : 'Buy') : on ? <><Check size={13} /> {verb.on}</> : verb.off}
          </button>
        </div>
      </article>
    );
  };

  const tabs = (
    <>
      <button className={`tab ${tab === 'outfits' ? 'on' : ''}`} onClick={() => setTab('outfits')}><Shirt size={16} /> Outfits</button>
      <button className={`tab ${tab === 'cosmetics' ? 'on' : ''}`} onClick={() => setTab('cosmetics')}><Sparkles size={16} /> Cosmetics</button>
      <button className={`tab ${tab === 'pets' ? 'on' : ''}`} onClick={() => setTab('pets')}><PawPrint size={16} /> Pets</button>
      <button className={`tab ${tab === 'structures' ? 'on' : ''}`} onClick={() => setTab('structures')}><Landmark size={16} /> Structures</button>
      <span className="coin-pill" title="Your coins"><CoinIcon size={20} /> {st.coins}</span>
    </>
  );

  return (
    <Modal eyebrow="Sanctuary market" title="Shop: outfits, pets & structures" onClose={onClose} size="xl" tabs={tabs}
      footer={<>
        <div className="foot-left"><span className="muted small">{msg || `Everyone starts with ${START_COINS} coins for testing. Earn more by finishing tasks, founding projects and resurrecting them.`}</span>
          <button className="btn tiny" onClick={() => { resetTestCoins(); setMsg(`Coins topped up to at least ${START_COINS}.`); }}><Gift size={13} /> Refill test coins</button></div>
        <button className="btn primary" onClick={onClose}><Shield size={16} /> Return to sanctuary</button>
      </>}>
      <div className="shop-grid">
        <aside className="shop-side"><Preview st={st} />
          <p className="muted small">Your character in the world wears exactly this. Pets follow you. Structures can be placed anywhere on the map.</p></aside>

        <div className="shop-main">
          {tab === 'outfits' && (
            <>
              <h3 className="sec-title">Outfits</h3>
              <div className="items">{OUTFITS.map(card)}</div>
              <section className="panel appearance">
                <h3>Appearance <span className="free-tag">free</span></h3>
                <div className="app-row"><b>Skin tone</b><div className="swatches">{SKINS.map((s) => <button key={s.id} title={s.name} aria-label={s.name} className={`sw ${st.look.skin === s.id ? 'on' : ''}`} style={{ '--c': s.c } as CSSProperties} onClick={() => setLook({ skin: s.id })} />)}</div></div>
                <div className="app-row"><b>Hair colour</b><div className="swatches">{HAIRS.map((h) => <button key={h.id} title={h.name} aria-label={h.name} className={`sw ${st.look.hair === h.id ? 'on' : ''}`} style={{ '--c': h.main } as CSSProperties} onClick={() => setLook({ hair: h.id })} />)}</div></div>
                <div className="app-row"><b>Hair style</b><div className="seg2">
                  <button className={st.look.hairStyle === 'short' ? 'on' : ''} onClick={() => setLook({ hairStyle: 'short' })}>Short</button>
                  <button className={st.look.hairStyle === 'long' ? 'on' : ''} onClick={() => setLook({ hairStyle: 'long' })}>Long</button></div></div>
                <div className="app-row"><b>Beard</b><div className="seg2">
                  <button className={st.look.beard ? 'on' : ''} onClick={() => setLook({ beard: true })}>Beard</button>
                  <button className={!st.look.beard ? 'on' : ''} onClick={() => setLook({ beard: false })}>Clean-shaven</button></div></div>
              </section>
            </>
          )}
          {tab === 'cosmetics' && (
            <>
              <h3 className="sec-title">Hats</h3><div className="items">{HATS.map(card)}</div>
              <h3 className="sec-title">Face</h3><div className="items">{FACES.map(card)}</div>
              <h3 className="sec-title">Back</h3><div className="items">{BACKS.map(card)}</div>
            </>
          )}
          {tab === 'pets' && (<><h3 className="sec-title">Pets (one follows you at a time)</h3><div className="items">{PETS.map(card)}</div></>)}
          {tab === 'structures' && (<><h3 className="sec-title">City structures (place them anywhere on the map)</h3><div className="items">{STRUCTURES.map(card)}</div></>)}
        </div>
      </div>
    </Modal>
  );
}
