
import * as admin from 'firebase-admin';

// Attempt to parse the service account credentials from the environment variable.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

// Initialize the Firebase Admin SDK only if it hasn't been already.
if (!admin.apps.length) {
  if (serviceAccount) {
    // If service account credentials are available, use them.
    // This is the standard and most reliable method.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback for environments like Firebase App Hosting where credentials might be auto-discovered.
    // This will only work in specific, configured Google Cloud environments.
    // A warning is logged if serviceAccount is missing, as this is often a misconfiguration.
    console.warn(
      "Firebase Admin SDK initialisé sans `serviceAccount` explicite. " +
      "Tentative d'utilisation des identifiants par défaut de l'application (ADC). " +
      "Cela ne fonctionnera que dans un environnement Google Cloud configuré."
    );
    admin.initializeApp();
  }
}

// Export the initialized services.
export const firestore = admin.firestore();
export const auth = admin.auth();
