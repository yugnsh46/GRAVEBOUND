import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Keyboard, Lightbulb, X } from 'lucide-react';
import { GUIDE, GUIDE_SEEN_KEY, LANGS, getLang, saveLang } from '../i18n';
import type { Lang } from '../i18n';

/** Welcome guide shown on first visit (and from the ? button). Content is available in 6 languages. */
export default function Guide({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState<Lang>(getLang);
  const t = GUIDE[lang];

  const finish = () => { try { localStorage.setItem(GUIDE_SEEN_KEY, '1'); } catch { /* ignore */ } onClose(); };
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const pick = (l: Lang) => { setLang(l); saveLang(l); };

  const keys: [string, string][] = [['WASD / ARROWS', t.c1], ['DRAG / SCROLL', t.c2], ['CLICK', t.c3], ['F / ENTER', t.c4]];
  const tips = [t.t1, t.t2, t.t3, t.t4];

  return (
    <motion.div className="overlay" onMouseDown={finish} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <motion.div role="dialog" aria-modal="true" aria-label={t.welcome} lang={lang} className="modal lg guide"
        onMouseDown={(e) => e.stopPropagation()} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.2 }}>
        <header className="guide-top">
          <span className="lang-label"><Globe size={16} /> {t.language}</span>
          <div className="langs" role="group" aria-label={t.language}>
            {LANGS.map((l) => <button key={l.id} className={lang === l.id ? 'on' : ''} aria-pressed={lang === l.id} onClick={() => pick(l.id)}>{l.label}</button>)}
          </div>
          <button className="guide-x" onClick={finish} aria-label="Close"><X size={16} /></button>
        </header>

        <div className="guide-body">
          <span className="g-dia" aria-hidden="true" />
          <h2>{t.welcome}</h2>
          <p className="g-sub">{t.subtitle}</p>
          <p className="g-intro">{t.intro}</p>

          <section className="g-box">
            <h3><Keyboard size={16} /> {t.controlsTitle}</h3>
            {keys.map(([k, d]) => <div key={k} className="g-row"><kbd>{k}</kbd><span>{d}</span></div>)}
          </section>

          <section className="g-box g-tips">
            <h3><Lightbulb size={16} /> {t.tipsTitle}</h3>
            <ol>{tips.map((x, i) => <li key={i}>{x}</li>)}</ol>
          </section>

          <div className="g-go"><button className="btn go" onClick={finish} autoFocus>{t.enter} <ArrowRight size={18} /></button></div>
          <p className="muted small g-hint">{t.hint}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
