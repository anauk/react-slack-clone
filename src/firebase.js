import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyBVBXCuvBb5u-9Bv78Lg2NuckAUmcAms2g",
  authDomain: "react-slack-clone-528db.firebaseapp.com",
  databaseURL: "https://react-slack-clone-528db.firebaseio.com",
  projectId: "react-slack-clone-528db",
  storageBucket: "react-slack-clone-528db.appspot.com",
  messagingSenderId: "217058292043",
  appId: "1:217058292043:web:9a4f19414928e8ab2bf8ce",
  measurementId: "G-J06FPK6BMG"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
