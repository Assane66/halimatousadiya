export const SITE_NAME = "Nur Guidance";
export const SITE_TAGLINE = "Éclairer les esprits, nourrir les âmes.";
export const SITE_DESCRIPTION =
  "Site web de l'Institut Islamique Yaye Halimatou Saadiya à Tivaouane Peulh. Nous offrons une éducation islamique et académique de qualité.";
export const CONTACT_INFO = {
  phone1: "77 446 94 15",
  phone2: "70 841 22 46",
  email: "yayehalimatousaadiya@gmail.com",
  address: "Tivaouane Peulh, Apix Îlot 1.",
  fullAddress: "Tivaouane Peulh, Apix Îlot 1, Sénégal",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3857.392021674257!2d-17.30230802489063!3d14.746919273573216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec1a3a6e3b5f0f3%3A0x8544062e5198083a!2sTivaouane%20peulh!5e0!3m2!1sfr!2sfr!4v1716472935519!5m2!1sfr!2sfr",
};

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/programmes", label: "Programmes" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
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
    slug: "journee-portes-ouvertes-2024",
    title: "Journée Portes Ouvertes 2024 : Un Grand Succès !",
    date: "15 Mai 2024",
    imageUrlId: "blog-1",
    excerpt:
      "Retour en images sur notre journée portes ouvertes qui a rassemblé parents, élèves et futurs membres de notre communauté.",
    content: `
      <p>La journée portes ouvertes de cette année a été une magnifique occasion de rencontre et de partage. Nous avons eu le plaisir d'accueillir de nombreuses familles venues découvrir notre institut, nos programmes et notre équipe pédagogique.</p>
      <p>Les visiteurs ont pu assister à des présentations de nos différentes formations, participer à des ateliers interactifs et échanger avec nos enseignants dans une atmosphère conviviale. Les sourires sur les visages des enfants et l'intérêt manifesté par les parents ont été notre plus belle récompense.</p>
      <p>Nous remercions chaleureusement tous les participants, ainsi que nos élèves et notre personnel pour leur implication dans la réussite de cet événement. C'est ensemble que nous construisons une communauté éducative forte et solidaire.</p>
    `,
  },
  {
    slug: "remise-des-prix-excellence",
    title: "Cérémonie de Remise des Prix d'Excellence",
    date: "28 Avril 2024",
    imageUrlId: "blog-2",
    excerpt:
      "L'institut a célébré ses élèves les plus méritants lors d'une cérémonie riche en émotions et en fierté.",
    content: `
      <p>La traditionnelle cérémonie de remise des prix a mis à l'honneur les efforts et l'excellence académique de nos élèves tout au long de l'année. Des prix ont été décernés dans chaque matière et pour chaque niveau, récompensant le travail assidu et la persévérance.</p>
      <p>Ce fut un moment de grande fierté pour les élèves, leurs parents et toute l'équipe enseignante. Le directeur, dans son discours, a rappelé l'importance de viser l'excellence non seulement dans les études, mais aussi dans le comportement et le caractère, conformément à nos valeurs islamiques.</p>
      <p>Félicitations à tous nos lauréats !</p>
    `,
  },
  {
    slug: "concours-recitation-coran",
    title: "Concours Annuel de Récitation du Coran",
    date: "10 Avril 2024",
    imageUrlId: "blog-3",
    excerpt:
      "Nos jeunes talents ont brillé lors du concours annuel de mémorisation et de récitation du Saint Coran.",
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
      "Un programme complet qui consolide les bases académiques et religieuses, formant des élèves équilibrés et prêts pour les défis du collège.",
    objectives: [
      "Maîtriser la lecture, l'écriture et le calcul.",
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
  {
    slug: "college",
    name: "Collège (à venir)",
    imageUrlId: "program-college",
    description:
      "Notre programme de collège est en cours d'élaboration pour offrir une continuité éducative à nos élèves, avec un accent sur l'excellence académique et la maturité spirituelle.",
    objectives: [],
    subjects: [],
    admission: "Informations à venir.",
  },
];

export const GALLERY_EVENTS = {
  "journee-portes-ouvertes-2023": {
    name: "Journée Portes Ouvertes",
    images: [
      {
        id: "1",
        imageUrlId: "gallery-event1-1",
        description: "Vue d'ensemble de la cour pendant l'événement.",
      },
      {
        id: "2",
        imageUrlId: "gallery-event1-2",
        description: "Le directeur s'adressant aux parents.",
      },
      {
        id: "3",
        imageUrlId: "gallery-event1-3",
        description: "Échanges entre enseignants et familles.",
      },
    ],
  },
  "fete-de-fin-d-annee": {
    name: "Fête de fin d'année",
    images: [
      {
        id: "4",
        imageUrlId: "gallery-event2-1",
        description: "Spectacle des enfants de la maternelle.",
      },
      {
        id: "5",
        imageUrlId: "gallery-event2-2",
        description: "Remise de diplôme à un élève méritant.",
      },
      {
        id: "6",
        imageUrlId: "gallery-event2-3",
        description: "Photo de groupe des lauréats.",
      },
    ],
  },
};
