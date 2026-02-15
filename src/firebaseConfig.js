import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDSA9eYdtVzF-8OhVQ0kK2kP8oZLSOMNFs",
    authDomain: "digital-cards-38a1d.firebaseapp.com",
    databaseURL: "https://digital-cards-38a1d-default-rtdb.firebaseio.com",
    projectId: "digital-cards-38a1d",
    storageBucket: "digital-cards-38a1d.firebasestorage.app",
    messagingSenderId: "73437948325",
    appId: "1:73437948325:web:84399a6cb24614bda8604c",
    measurementId: "G-44VCXH55RZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
// Try getting storage without specifying bucket - it will use default
export const storage = getStorage(app);
export const analytics = getAnalytics(app); 