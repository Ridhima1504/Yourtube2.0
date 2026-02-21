// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIJMNxsxrlvRIS1wEfKlPqmYi0ndbomxg",
  authDomain: "newyourtube-56116.firebaseapp.com",
  projectId: "newyourtube-56116",
  storageBucket: "newyourtube-56116.firebasestorage.app",
  messagingSenderId: "579089767522",
  appId: "1:579089767522:web:1a117998d11c30d1bfc53b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth, provider};