
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
        console.warn("Initialisation de l'admin Firebase sans credentials. Les opérations authentifiées échoueront.");
        admin.initializeApp();
    }
}

export const firestore = admin.firestore();
export const auth = admin.auth();
