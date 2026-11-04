export interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  prompt: string;
  mediaType: 'image' | 'video';
  style: string;
  aspectRatio: string;
  description: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 't-1',
    category: 'Portre & Karakter',
    title: 'Siberpunk Yağmur Altı Portresi',
    prompt: 'Tokyo sokaklarında neon ışıkları altında duran, şeffaf yağmurluk giymiş genç bir kadının sinematik yakın çekim portresi, yüzünde gerçekçi yağmur damlaları, arka planda buğulu mor ve turkuaz neon tabelalar, 85mm f/1.4 lens derinliği.',
    mediaType: 'image',
    style: 'cinematic',
    aspectRatio: '3:4',
    description: 'Keskin yüz detayları, kusursuz ışık yansımaları ve sıfır bozulma.',
  },
  {
    id: 't-2',
    category: 'Doğa & Vahşi Yaşam',
    title: 'Sisli Ormanda Kar Parsı',
    prompt: 'Karlı çam ağaçlarıyla kaplı Himalayalar zirvesinde bir kayanın üzerinde sessizce duran asil bir kar parsı, sabahın ilk altın rengi güneş ışıkları tüylerini aydınlatıyor, National Geographic belgesel kalitesi, ultra gerçekçi doku.',
    mediaType: 'image',
    style: 'realistic',
    aspectRatio: '16:9',
    description: 'Biyolojik anatomiye sadık, net kürk detayları.',
  },
  {
    id: 't-3',
    category: 'Ürün & Reklam',
    title: 'Minimalist Lüks Parfüm Şişesi',
    prompt: 'Siyah mermer kaide üzerinde duran zarif kristal parfüm şişesi, etrafında su damlacıkları ve altın tozu zerrecikleri asılı, stüdyo yumuşak softbox ışıklandırması, ticari ürün fotoğrafçılığı, temiz keskin yansımalar.',
    mediaType: 'image',
    style: 'realistic',
    aspectRatio: '1:1',
    description: 'Reklam standartlarında pürüzsüz cam ve mermer yansıması.',
  },
  {
    id: 't-4',
    category: 'Sinematik Video',
    title: 'Okyanus Kıyısında Gün Batımı Drone Çekimi',
    prompt: 'Turkuaz dalgaların altın rengi kumlu sahillere nazikçe vurduğu dramatik bir tropik ada sahilinde gün batımı, hafif puslu gökyüzü, yavaşça ilerleyen pürüzsüz drone kamera hareketi.',
    mediaType: 'video',
    style: 'cinematic',
    aspectRatio: '16:9',
    description: 'Akıcı dalga dinamikleri, pürüzsüz kamera salınımı.',
  },
  {
    id: 't-5',
    category: 'Anime & Çizim',
    title: 'Gökdelen Tepesinde Yıldızları İzleyen Çocuk',
    prompt: 'Geleceğin fütüristik Tokyo şehrinde bir gökdelenin helikopter pistinde oturup meteor yağmurunu izleyen anime tarzı genç bir karakter, Makoto Shinkai tarzı canlı gökyüzü renkleri ve bulut katmanları.',
    mediaType: 'image',
    style: 'anime',
    aspectRatio: '16:9',
    description: 'Ghibli / Shinkai estetiğinde büyüleyici gökyüzü ve ışıklandırma.',
  },
  {
    id: 't-6',
    category: 'Fütüristik Video',
    title: 'Uçan Araçların Şehir Trafiği',
    prompt: 'Gökdelenlerin arasından süzülen fütüristik parlak uçan araçların akıcı şehir trafiği, hologram reklam panoları, pürüzsüz sinematik takip kamerası, 4k netlik.',
    mediaType: 'video',
    style: 'cinematic',
    aspectRatio: '16:9',
    description: 'Karmaşık 3D derinlik ve stabil hareket akışı.',
  },
];
