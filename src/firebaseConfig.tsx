import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyADB8RwgO8PrbXxPVyKBq8LkMQlFn0y7-I",
    authDomain: "sfgl-270da.firebaseapp.com",
    databaseURL: "https://sfgl-270da-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sfgl-270da",
    storageBucket: "sfgl-270da.appspot.com",
    messagingSenderId: "565548247964",
    appId: "1:565548247964:web:5eb35a5738124898107659",
    measurementId: "G-WQHSHZK1M8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
console.log(database)
const auth = getAuth(app)
const storage = getStorage(app);

export { database, storage, auth };