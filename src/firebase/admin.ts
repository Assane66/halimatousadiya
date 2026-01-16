
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn(
      "SDK Admin Firebase non initialisé : La variable d'environnement `FIREBASE_SERVICE_ACCOUNT` n'est pas définie. " +
      "Les fonctionnalités côté serveur ne seront pas disponibles en développement local."
    );
  }
}

let firestore: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (admin.apps.length === 0) {
  // Si l'application n'a pas été initialisée (ex: en local sans compte de service),
  // nous créons un proxy qui lancera une erreur claire si on essaie de l'utiliser.
  const serviceProxy = new Proxy({}, {
    get(target, prop) {
      throw new Error(
        `Le SDK Admin Firebase n'est pas initialisé. Impossible d'accéder à '${String(prop)}'. ` +
        `Assurez-vous que la variable d'environnement FIREBASE_SERVICE_ACCOUNT est configurée pour le développement local.`
      );
    },
  });
  firestore = serviceProxy as admin.firestore.Firestore;
  auth = serviceProxy as admin.auth.Auth;
} else {
  // Si l'application est initialisée, on exporte les services normalement.
  firestore = admin.firestore();
  auth = admin.auth();
}

export { firestore, auth };
