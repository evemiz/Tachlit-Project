import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDsSDzid-Kt_HmqMZTokvBbOYjPyNvTMRc",
  authDomain: "tachlit-association.firebaseapp.com",
  projectId: "tachlit-association",
  storageBucket: "tachlit-association.appspot.com",
  messagingSenderId: "329042195364",
  appId: "1:329042195364:web:4860e7a8ab388209fa8731",
  measurementId: "G-WWCSGWFE78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);

export { db , auth };