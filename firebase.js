import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    push,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyALE0Ozw5p90SlU2nG3yhE071T1_ZD_rhA",
    authDomain: "pizzakasa-26b85.firebaseapp.com",
    databaseURL: "https://pizzakasa-26b85-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pizzakasa-26b85",
    storageBucket: "pizzakasa-26b85.firebasestorage.app",
    messagingSenderId: "555721990697",
    appId: "1:555721990697:web:d45bb4fc7a2082132d3238",
    measurementId: "G-WFRFC7F73Y"
};


const app = initializeApp(firebaseConfig);


// DATABASE

const db = getDatabase(app);


// AUTH

const auth = getAuth(app);


export {
    db,
    auth,
    ref,
    set,
    push,
    onValue,
    remove,
    update
};