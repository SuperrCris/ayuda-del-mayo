import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCp_0Y9Ct-kXRYPWBmnLT-8IWUqKYB6e2k',
  authDomain: 'ayuda-del-mayo.firebaseapp.com',
  projectId: 'ayuda-del-mayo',
  storageBucket: 'ayuda-del-mayo.firebasestorage.app',
  messagingSenderId: '354919196993',
  appId: '1:354919196993:web:83dfc3bad380c696e419c0',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
