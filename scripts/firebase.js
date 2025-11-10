import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: replace the placeholder values below with your real Firebase project config.
// You can find it in the Firebase Console > Project settings > General > Your apps.
const firebaseConfig = {
  apiKey: "AIzaSyDckrN3vYs5weDlmmFHq-jZ8maSkvcxWsY",
  authDomain: "nextly-789d3.firebaseapp.com",
  projectId: "nextly-789d3",
  storageBucket: "nextly-789d3.firebasestorage.app",
  messagingSenderId: "318684626969",
  appId: "1:318684626969:web:c48d4c7ec27e6aa2742a88",
  measurementId: "G-V8L564RMJX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
