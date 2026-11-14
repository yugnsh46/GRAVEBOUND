export type Lang = 'en' | 'es' | 'fr' | 'ja' | 'hi' | 'de';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' }, { id: 'es', label: 'Español' }, { id: 'fr', label: 'Français' },
  { id: 'ja', label: '日本語' }, { id: 'hi', label: 'हिन्दी' }, { id: 'de', label: 'Deutsch' },
];

export interface GuideText {
  language: string; welcome: string; subtitle: string; intro: string; controlsTitle: string;
  c1: string; c2: string; c3: string; c4: string; tipsTitle: string; t1: string; t2: string; t3: string; t4: string; enter: string; hint: string;
}

export const GUIDE: Record<Lang, GuideText> = {
  en: {
    language: 'Language', welcome: 'Welcome to GRAVEBOUND', subtitle: 'Interactive 3D sanctuary for unfinished projects',
    intro: 'Every software project you start deserves a second chance. Here, abandoned code begins as a neglected junkyard and progressively evolves into foundations, construction sites, and towering commercial skyscrapers as you revive it.',
    controlsTitle: 'Navigation & controls',
    c1: 'Move your builder through the city', c2: 'Left-click & drag to orbit the camera; scroll to zoom',
    c3: 'Click any building to open its project dossier', c4: 'Interact with the building or landmark you are standing next to',
    tipsTitle: 'Quick start',
    t1: 'Every building is one of your unfinished projects. Its stage grows with progress.',
    t2: 'Use New Project to found one, or import a public GitHub repo.',
    t3: 'Open a dossier to pick a revival path: restart, continue, change, repurpose or archive.',
    t4: 'Earn coins by finishing tasks and spend them in the Shop on outfits, pets and structures.',
    enter: 'Enter the City', hint: 'You can reopen this guide any time with the ? button.',
  },
  es: {
    language: 'Idioma', welcome: 'Bienvenido a GRAVEBOUND', subtitle: 'Santuario 3D interactivo para proyectos sin terminar',
    intro: 'Todo proyecto de software que empiezas merece una segunda oportunidad. Aquí, el código abandonado empieza como un solar descuidado y evoluciona poco a poco en cimientos, obras en construcción y rascacielos comerciales a medida que lo revives.',
    controlsTitle: 'Navegación y controles',
    c1: 'Mueve a tu constructor por la ciudad', c2: 'Haz clic izquierdo y arrastra para orbitar la cámara; usa la rueda para hacer zoom',
    c3: 'Haz clic en cualquier edificio para abrir el expediente de su proyecto', c4: 'Interactúa con el edificio o monumento junto al que estás',
    tipsTitle: 'Inicio rápido',
    t1: 'Cada edificio es uno de tus proyectos sin terminar. Su etapa crece con el progreso.',
    t2: 'Usa Nuevo proyecto para fundar uno, o importa un repositorio público de GitHub.',
    t3: 'Abre un expediente para elegir un camino de revivir: reiniciar, continuar, cambiar, reutilizar o archivar.',
    t4: 'Gana monedas completando tareas y gástalas en la Tienda en atuendos, mascotas y estructuras.',
    enter: 'Entrar a la ciudad', hint: 'Puedes volver a abrir esta guía cuando quieras con el botón ?.',
  },
  fr: {
    language: 'Langue', welcome: 'Bienvenue dans GRAVEBOUND', subtitle: 'Sanctuaire 3D interactif pour projets inachevés',
    intro: 'Chaque projet logiciel que vous commencez mérite une seconde chance. Ici, le code abandonné commence comme une décharge négligée, puis devient peu à peu des fondations, des chantiers et de grands gratte-ciel à mesure que vous le faites revivre.',
    controlsTitle: 'Navigation et commandes',
    c1: 'Déplacez votre bâtisseur dans la ville', c2: 'Clic gauche et glisser pour orbiter la caméra ; molette pour zoomer',
    c3: 'Cliquez sur un bâtiment pour ouvrir le dossier de son projet', c4: 'Interagissez avec le bâtiment ou le monument près duquel vous vous trouvez',
    tipsTitle: 'Démarrage rapide',
    t1: 'Chaque bâtiment est l’un de vos projets inachevés. Son stade progresse avec l’avancement.',
    t2: 'Utilisez Nouveau projet pour en fonder un, ou importez un dépôt GitHub public.',
    t3: 'Ouvrez un dossier pour choisir une voie de renaissance : recommencer, continuer, changer, réutiliser ou archiver.',
    t4: 'Gagnez des pièces en terminant des tâches et dépensez-les dans la Boutique en tenues, animaux et structures.',
    enter: 'Entrer dans la ville', hint: 'Vous pouvez rouvrir ce guide à tout moment avec le bouton ?.',
  },
  ja: {
    language: '言語', welcome: 'GRAVEBOUNDへようこそ', subtitle: '未完成プロジェクトのためのインタラクティブ3Dサンクチュアリ',
    intro: 'あなたが始めたすべてのソフトウェアプロジェクトには、もう一度チャンスがあります。ここでは、放置されたコードはさびれたガラクタ置き場から始まり、復活させるにつれて基礎、建設現場、そしてそびえ立つ高層ビルへと成長していきます。',
    controlsTitle: '操作方法',
    c1: 'ビルダーを街の中で動かします', c2: '左クリックしてドラッグでカメラを回転、スクロールでズーム',
    c3: '建物をクリックするとプロジェクトの詳細を開きます', c4: '隣に立っている建物やランドマークを操作します',
    tipsTitle: 'クイックスタート',
    t1: 'すべての建物はあなたの未完成プロジェクトです。進捗に応じて段階が進みます。',
    t2: '「新規プロジェクト」で作成するか、公開GitHubリポジトリをインポートします。',
    t3: '詳細を開いて復活の道を選びます：やり直し、続行、変更、再利用、アーカイブ。',
    t4: 'タスクを終えてコインを稼ぎ、ショップで衣装・ペット・建造物に使いましょう。',
    enter: '街に入る', hint: '？ボタンでいつでもこのガイドをもう一度開けます。',
  },
  hi: {
    language: 'भाषा', welcome: 'GRAVEBOUND में आपका स्वागत है', subtitle: 'अधूरे प्रोजेक्ट्स के लिए इंटरैक्टिव 3D अभयारण्य',
    intro: 'आप जो भी सॉफ़्टवेयर प्रोजेक्ट शुरू करते हैं, वह दूसरे मौके का हक़दार है। यहाँ छोड़ा हुआ कोड एक उपेक्षित कबाड़खाने के रूप में शुरू होता है और जैसे-जैसे आप उसे फिर से ज़िंदा करते हैं, वह नींव, निर्माण स्थल और ऊँची व्यावसायिक गगनचुंबी इमारतों में बदलता जाता है।',
    controlsTitle: 'नेविगेशन और कंट्रोल',
    c1: 'अपने बिल्डर को शहर में चलाएँ', c2: 'कैमरा घुमाने के लिए लेफ़्ट-क्लिक करके खींचें; ज़ूम के लिए स्क्रॉल करें',
    c3: 'किसी भी इमारत पर क्लिक करके उसका प्रोजेक्ट डोज़ियर खोलें', c4: 'जिस इमारत या लैंडमार्क के पास खड़े हैं, उससे इंटरैक्ट करें',
    tipsTitle: 'जल्दी शुरुआत',
    t1: 'हर इमारत आपका एक अधूरा प्रोजेक्ट है। प्रगति के साथ उसका चरण बढ़ता है।',
    t2: 'नया प्रोजेक्ट से एक शुरू करें, या कोई पब्लिक GitHub रेपो इम्पोर्ट करें।',
    t3: 'डोज़ियर खोलकर पुनर्जीवन का रास्ता चुनें: फिर से शुरू, जारी रखें, बदलें, दोबारा उपयोग या आर्काइव।',
    t4: 'टास्क पूरे करके सिक्के कमाएँ और शॉप में आउटफ़िट, पेट और स्ट्रक्चर पर खर्च करें।',
    enter: 'शहर में प्रवेश करें', hint: 'आप ? बटन से जब चाहें यह गाइड फिर खोल सकते हैं।',
  },
  de: {
    language: 'Sprache', welcome: 'Willkommen bei GRAVEBOUND', subtitle: 'Interaktives 3D-Refugium für unfertige Projekte',
    intro: 'Jedes Softwareprojekt, das du beginnst, verdient eine zweite Chance. Hier beginnt verlassener Code als vernachlässigter Schrottplatz und entwickelt sich Schritt für Schritt zu Fundamenten, Baustellen und hoch aufragenden Wolkenkratzern, während du ihn wiederbelebst.',
    controlsTitle: 'Navigation und Steuerung',
    c1: 'Bewege deinen Baumeister durch die Stadt', c2: 'Linksklick und ziehen, um die Kamera zu drehen; scrollen zum Zoomen',
    c3: 'Klicke auf ein Gebäude, um die Projektakte zu öffnen', c4: 'Interagiere mit dem Gebäude oder Wahrzeichen, neben dem du stehst',
    tipsTitle: 'Schnellstart',
    t1: 'Jedes Gebäude ist eines deiner unfertigen Projekte. Seine Stufe wächst mit dem Fortschritt.',
    t2: 'Gründe mit Neues Projekt eines oder importiere ein öffentliches GitHub-Repo.',
    t3: 'Öffne eine Akte und wähle einen Wiederbelebungsweg: neu starten, fortsetzen, ändern, umwidmen oder archivieren.',
    t4: 'Verdiene Münzen durch erledigte Aufgaben und gib sie im Shop für Outfits, Haustiere und Bauwerke aus.',
    enter: 'Die Stadt betreten', hint: 'Du kannst diese Anleitung jederzeit mit dem ?-Button erneut öffnen.',
  },
};

const KEY = 'gravebound-lang';
export function getLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && saved in GUIDE) return saved;
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (nav in GUIDE) return nav as Lang;
  } catch { /* ignore */ }
  return 'en';
}
export const saveLang = (l: Lang) => { try { localStorage.setItem(KEY, l); } catch { /* ignore */ } };
export const GUIDE_SEEN_KEY = 'gravebound-guide-seen';
