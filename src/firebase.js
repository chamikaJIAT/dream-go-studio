import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCHBfRFnHgbMWTSiyjT6sOdRrQ3hHTnNzU",
    authDomain: "dream-go-studio.firebaseapp.com",
    projectId: "dream-go-studio",
    storageBucket: "dream-go-studio.firebasestorage.app",
    messagingSenderId: "971976664859",
    appId: "1:971976664859:web:e79d7a837d957219d855be",
    measurementId: "G-XXYGE14R3X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);
