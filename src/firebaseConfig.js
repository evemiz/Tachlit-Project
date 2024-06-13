import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDsSDzid-Kt_HmqMZTokvBbOYjPyNvTMRc",
    authDomain: "tachlit-association.firebaseapp.com",
    projectId: "tachlit-association",
    storageBucket: "tachlit-association.appspot.com",
    messagingSenderId: "329042195364",
    appId: "1:329042195364:web:62380f403e4f9d78fa8731",
    measurementId: "G-9SK8TXRSKN"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
