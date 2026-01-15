
export const SITE_NAME = "Institut Islamique Yaye Halimatou Saadiya";
export const SITE_TAGLINE = "Éclairer les esprits, nourrir les âmes.";
export const SITE_DESCRIPTION =
  "Site web de l'Institut Islamique Yaye Halimatou Saadiya à Tivaouane Peulh. Nous offrons une éducation islamique et académique de qualité.";
export const CONTACT_INFO = {
  phone1: "76 446 94 15",
  phone2: "70 841 21 46",
  phone3: "77 241 01 16",
  email: "instituthalimatousaadiya17@gmail.com",
  address: "Tivaouane Peulh, Apix Îlot 1.",
  fullAddress: "Tivaouane Peulh, Apix Îlot 1, Sénégal",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3858.07720336269!2d-17.292679!3d14.8026813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTTCsDQ4JzA5LjciTiAxN8KwMTcnMzMuNiJX!5e0!3m2!1sfr!2sfr!4v1718300262553!5m2!1sfr!2sfr",
};

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/programmes", label: "Programmes" },
  { href: "/actualites", label: "Évènements" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
  { href: "/admin/dashboard", label: "Admin"},
];

export const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Tableau de Bord" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/eleves", label: "Élèves" },
  { href: "/admin/paiements", label: "Paiements" },
  { href: "/admin/annees-scolaires", label: "Années Scolaires" },
];

export const TEAM_MEMBERS = [
  {
    id: "1",
    name: "Cheikh Tidiane Ndiaye",
    title: "Directeur & Enseignant Principal",
    photoUrlId: "teacher-1",
    bio: "Expert en sciences islamiques avec plus de 20 ans d'expérience dans l'enseignement et la gestion d'établissements éducatifs.",
  },
  {
    id: "2",
    name: "Fatima Diallo",
    title: "Coordinatrice Pédagogique",
    photoUrlId: "teacher-2",
    bio: "Spécialiste en pédagogie de l'enfant, elle veille à l'épanouissement académique et personnel de chaque élève de la maternelle au primaire.",
  },
  {
    id: "3",
    name: "Moussa Diop",
    title: "Enseignant de Langue Arabe",
    photoUrlId: "teacher-3",
    bio: "Passionné par la langue du Coran, il transmet son savoir avec une méthode interactive et engageante.",
  },
  {
    id: "4",
    name: "Aïcha Ba",
    title: "Enseignante de Français et d'Histoire",
    photoUrlId: "teacher-4",
    bio: "Dédiée à la réussite de ses élèves, elle combine rigueur académique et bienveillance pour stimuler leur curiosité.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "visite-musee-prophete",
    title: "Visite Inspirante au Musée du Prophète (PSL) à Dakar",
    date: "18 Juillet 2024",
    imageUrlId: "blog-1",
    excerpt:
      "Les élèves de l’Institut ont eu l’honneur de visiter le Musée du Prophète Mouhamed (PSL) au Parc de Dakar, une expérience unique qui a renforcé leur foi et enrichi leurs connaissances sur la vie et le message du Messager d’Allah (PSL).",
    content: `
      <p>Nos élèves ont eu l'immense privilège de visiter le nouveau musée dédié à la vie et à l'héritage du Prophète Mouhamed (PSL) à Dakar. Une journée riche en apprentissages et en émotions.</p>
      <p>À travers des expositions immersives et des reconstitutions détaillées, les enfants ont pu voyager dans le temps pour mieux comprendre l'histoire de l'Islam et la vie exemplaire de notre Prophète. Cette sortie éducative a renforcé leur foi et leur a offert une perspective unique sur les valeurs de paix, de savoir et de miséricorde qui sont au cœur de notre religion.</p>
      <p>Nous sommes convaincus que de telles expériences sont essentielles pour former des esprits éclairés et des cœurs attachés à leur identité spirituelle.</p>
    `,
  },
  {
    slug: "remise-des-prix-excellence",
    title: "Daara Vacances 15 Août - 15 Septembre",
    date: "25 JUILLET 2025",
    imageUrlId: "blog-2",
    excerpt:
      "Du 15 août au 15 septembre, l’Institut a organisé Daara Vacances, un mois d’apprentissage, de discipline et de spiritualité, renforçant le savoir et les valeurs islamiques de ses élèves",
    content: `
      <p>La traditionnelle cérémonie de remise des prix a mis à l'honneur les efforts et l'excellence académique de nos élèves tout au long de l'année. Des prix ont été décernés dans chaque matière et pour chaque niveau, récompensant le travail assidu et la persévérance.</p>
      <p>Ce fut un moment de grande fierté pour les élèves, leurs parents et toute l'équipe enseignante. Le directeur, dans son discours, a rappelé l'importance de viser l'excellence non seulement dans les études, mais aussi dans le comportement et le caractère, conformément à nos valeurs islamiques.</p>
      <p>Félicitations à tous nos lauréats !</p>
    `,
  },
  {
    slug: "concours-recitation-coran",
    title: "Conférence Annuel de Récitation du Coran",
    date: "20 Juin 2025",
    imageUrlId: "blog-3",
    excerpt:
      "L’Institut a tenu sa Conférence annuelle de récitation du Coran, un moment spirituel fort marqué par la beauté des voix, la ferveur des élèves et la fierté des parents. Une occasion de célébrer la mémorisation, la maîtrise et l’amour du Livre Saint.",
    content: `
      <p>Pendant le mois béni de Ramadan, l'institut a organisé son concours annuel de récitation du Coran. Des élèves de tous âges ont participé, démontrant une maîtrise et une dévotion impressionnantes.</p>
      <p>Le jury, composé d'enseignants et d'imams locaux, a eu la difficile tâche de départager les candidats. L'événement s'est clôturé par une cérémonie émouvante où les gagnants ont été récompensés, encourageant tous les élèves à poursuivre leur noble quête de mémorisation du Livre d'Allah.</p>
    `,
  },
];

export const PROGRAMS = [
  {
    slug: "maternelle",
    name: "Maternelle",
    imageUrlId: "program-maternelle",
    description:
      "Un environnement ludique et bienveillant pour les premiers pas de vos enfants dans l'apprentissage, alliant éveil islamique et activités préscolaires.",
    objectives: [
      "Initier aux bases de la foi et des bonnes manières islamiques.",
      "Développer la socialisation et le langage.",
      "Stimuler la motricité fine et la créativité.",
      "Préparer en douceur à l'entrée au primaire.",
    ],
    subjects: [
      "Apprentissage de l'alphabet arabe et français",
      "Mémorisation de courtes sourates et d'invocations",
      "Graphisme et écriture",
      "Calcul et logique",
      "Ateliers artistiques et jeux éducatifs",
    ],
    admission: "Ouvert aux enfants de 3 à 5 ans. Entretien avec les parents.",
  },
  {
    slug: "primaire",
    name: "Primaire",
    imageUrlId: "program-primaire",
    description:
      "Un programme franco-arabe complet qui consolide les bases académiques et religieuses. Nous accueillons les élèves dans les classes de CI, CP, CE1, CE2, CM1 et CM2, les formant à devenir équilibrés et prêts pour les défis du collège.",
    objectives: [
      "Maîtriser la lecture, l'écriture et le calcul en français et en arabe.",
      "Approfondir les connaissances en sciences islamiques (Coran, Hadith, Fiqh).",
      "Développer l'esprit critique et l'autonomie.",
      "Inculquer le sens des responsabilités et le respect.",
    ],
    subjects: [
      "Langue Arabe",
      "Langue Française",
      "Études Coraniques",
      "Mathématiques",
      "Sciences de la vie et de la terre",
      "Histoire et Géographie",
      "Éducation Islamique",
    ],
    admission:
      "Ouvert aux enfants à partir de 6 ans. Test de niveau requis pour les nouvelles admissions.",
  },
];

export const GALLERY_IMAGES = [
  {
    id: "1",
    imageUrlId: "gallery-1",
    description: "Élèves en classe.",
  },
  {
    id: "2",
    imageUrlId: "gallery-2",
    description: "Élèves dans la cour de l'école.",
  },
  {
    id: "3",
    imageUrlId: "gallery-3",
    description: "Élèves en uniforme.",
  },
  {
    id: "4",
    imageUrlId: "gallery-4",
    description: "Élèves pendant une activité.",
  },
  {
    id: "5",
    imageUrlId: "gallery-5",
    description: "Élèves en classe avec leur enseignant.",
  },
  {
    id: "6",
    imageUrlId: "gallery-6",
    description: "Élèves posant pour une photo.",
  },
  {
    id: "7",
    imageUrlId: "gallery-7",
    description: "Élèves jouant dehors.",
  },
];
