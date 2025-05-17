import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCciGRu81K4rej6Ev0s2KZBDQp-oz0CoDU",
  authDomain: "crossplatcheat.firebaseapp.com",
  projectId: "crossplatcheat",
  storageBucket: "crossplatcheat.appspot.com",
  messagingSenderId: "857432090968",
  appId: "1:857432090968:web:56f9e7bc924be78dbbdd2d",
  measurementId: "G-1YSHGXPYVN"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


export { db };
export default app;