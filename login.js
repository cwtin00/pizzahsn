import {
    auth
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ELEMENTLER

const emailInput =
document.getElementById("email");

const passwordInput =
document.getElementById("password");

const loginBtn =
document.getElementById("login-btn");

const errorText =
document.getElementById("error-text");




// ZATEN GİRİŞ YAPILDIYSA

onAuthStateChanged(auth,(user)=>{

    if(user){

        window.location.href =
        "admin.html";

    }

});




// GİRİŞ YAP

loginBtn.addEventListener("click",()=>{

    const email =
    emailInput.value;

    const password =
    passwordInput.value;


    signInWithEmailAndPassword(
        auth,
        email,
        password
    )

    .then(()=>{

        window.location.href =
        "admin.html";

    })

    .catch(()=>{

        errorText.innerText =
        "E-Posta veya şifre hatalı";

    });

});