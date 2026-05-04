import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");
  const btn = document.getElementById("loginBtn");

  // reset error
  errorEl.innerText = "";

  // loading state
  btn.innerText = "Loading...";
  btn.disabled = true;

  try {
    // LOGIN FIREBASE KAMU
    await signInWithEmailAndPassword(auth, email, password);

    // kalau sukses → redirect
    window.location.href = "admin.html";

  } catch (error) {
    errorEl.innerText = "Email atau password salah";
  }

  // balik normal
  btn.innerText = "Login";
  btn.disabled = false;
};