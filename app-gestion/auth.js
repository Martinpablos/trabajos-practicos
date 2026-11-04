import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Tus mismas credenciales de Firebase para que Auth trabaje de forma independiente y segura
const firebaseConfig = {
    apiKey: "AIzaSyDa4nqc3-ZWbK51cZPXJeegvyHEYMT_hg",
    authDomain: "sistema-celi.firebaseapp.com",
    projectId: "sistema-celi",
    storageBucket: "sistema-celi.firebasestorage.app",
    messagingSenderId: "167240526122",
    appId: "1:167240526122:web:b160382d6c4087a6435653",
    measurementId: "G-39YYQK8QV"
};

// Inicializar la app exclusiva para Auth
const appAuth = initializeApp(firebaseConfig, "authAppName");
const auth = getAuth(appAuth);

export function inicializarAutenticacionBalance() {
    const contenidoBalance = document.getElementById("balance");
    if (!contenidoBalance) return;

    if (!document.getElementById("loginBalanceContainer")) {
        const divLogin = document.createElement("div");
        divLogin.id = "loginBalanceContainer";
        divLogin.className = "row justify-content-center mt-5";
        divLogin.innerHTML = `
            <div class="col-md-5">
                <div class="card custom-card p-4 shadow-sm text-center">
                    <h4 class="mb-3">🔒 Área Restringida</h4>
                    <p class="text-muted small">Ingresá la contraseña de administración para ver los costos y ganancias.</p>
                    <form id="formLoginAdmin">
                        <div class="mb-3 text-start">
                            <label class="form-label">Correo electrónico</label>
                            <input type="email" id="adminEmail" class="form-control" required placeholder="admin@celicitas.com">
                        </div>
                        <div class="mb-3 text-start">
                            <label class="form-label">Contraseña</label>
                            <input type="password" id="adminPassword" class="form-control" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-dark w-100">Ingresar al Balance</button>
                    </form>
                </div>
            </div>
        `;
        contenidoBalance.parentNode.insertBefore(divLogin, contenidoBalance);
    }

    const divLogin = document.getElementById("loginBalanceContainer");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            divLogin.style.display = "none";
            contenidoBalance.style.display = "block";
            
            if (!document.getElementById("btnLogoutAdmin")) {
                const btnLogout = document.createElement("button");
                btnLogout.id = "btnLogoutAdmin";
                btnLogout.className = "btn btn-sm btn-outline-danger mb-3";
                btnLogout.textContent = "🔒 Cerrar Sesión de Administrador";
                btnLogout.onclick = () => signOut(auth);
                contenidoBalance.prepend(btnLogout);
            }
        } else {
            divLogin.style.display = "flex";
            contenidoBalance.style.display = "none";
        }
    });

    const formLogin = document.getElementById("formLoginAdmin");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("adminEmail").value;
            const password = document.getElementById("adminPassword").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                formLogin.reset();
            } catch (error) {
                console.error("Error de autenticación: ", error);
                alert("Correo o contraseña incorrectos.");
            }
        });
    }
}