import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDa4nqcc3-ZWBk51cZPxJeegvyHEYMT_hg",
    authDomain: "sistema-celi.firebaseapp.com",
    projectId: "sistema-celi",
    storageBucket: "sistema-celi.firebasestorage.app",
    messagingSenderId: "167240526122",
    appId: "1:167240526122:web:b160382d6c4087a6435653",
    measurementId: "G-39YYQK8QV"
};

const appAuth = initializeApp(firebaseConfig, "authAppName");
const auth = getAuth(appAuth);

export function inicializarAutenticacionBalance() {
    const contenidoBalance = document.getElementById("balance");
    if (!contenidoBalance) return;

    // 1. Envolveremos el contenido financiero real (tarjetas y tablas) en un div interno si no existe
    let panelContenido = document.getElementById("panelFinancieroContenido");
    if (!panelContenido) {
        panelContenido = document.createElement("div");
        panelContenido.id = "panelFinancieroContenido";
        
        // Movemos todos los hijos actuales de #balance (excepto el título y el botón superior si los recuenta) dentro de este wrapper
        // O mejor aún: movemos todo el contenido que viene después del título/botón superior
        const hijos = Array.from(contenidoBalance.children);
        
        // Creamos el contenedor del login
        const divLogin = document.createElement("div");
        divLogin.id = "loginBalanceContainer";
        divLogin.className = "row justify-content-center my-4";
        divLogin.innerHTML = `
            <div class="col-md-6">
                <div class="card custom-card p-4 shadow-sm text-center">
                    <h4 class="mb-3">🔒 Sección Restringida</h4>
                    <p class="text-muted small">Ingresá la contraseña de administración para ver los costos y ganancias del negocio.</p>
                    <form id="formLoginAdmin">
                        <div class="mb-3 text-start">
                            <label class="form-label">Correo electrónico</label>
                            <input type="email" id="adminEmail" class="form-control" required placeholder="admin@celicitas.com">
                        </div>
                        <div class="mb-3 text-start">
                            <label class="form-label">Contraseña</label>
                            <input type="password" id="adminPassword" class="form-control" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-dark w-100">Desbloquear Balance</button>
                    </form>
                </div>
            </div>
        `;
        
        // Insertamos el login justo debajo del encabezado principal (el d-flex con el título y el botón de nuevo gasto)
        const headerSeccion = contenidoBalance.querySelector(".d-flex");
        if (headerSeccion) {
            headerSeccion.after(divLogin);
        } else {
            contenidoBalance.prepend(divLogin);
        }

        // Movemos las tarjetas de resumen y la tabla dentro de panelFinancieroContenido
        // (Dejamos fuera de este contenedor al header y al login)
        const elementosAMover = hijos.filter(el => !el.classList.contains("d-flex") && el.id !== "loginBalanceContainer");
        
        // Insertamos el panel contenedor después del login
        divLogin.after(panelContenido);
        elementosAMover.forEach(el => panelContenido.appendChild(el));
    }

    const divLogin = document.getElementById("loginBalanceContainer");
    const panelFinancieroContenido = document.getElementById("panelFinancieroContenido");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Si está logueado: ocultamos el login y mostramos las tarjetas/tablas financieras
            if (divLogin) divLogin.style.display = "none";
            if (panelFinancieroContenido) panelFinancieroContenido.style.display = "block";
            
            // Botón para volver a bloquear (cerrar sesión) ubicado arriba junto al título
            const headerSeccion = contenidoBalance.querySelector(".d-flex");
            if (headerSeccion && !document.getElementById("btnLogoutAdmin")) {
                const btnLogout = document.createElement("button");
                btnLogout.id = "btnLogoutAdmin";
                btnLogout.className = "btn btn-sm btn-outline-danger ms-2";
                btnLogout.textContent = "🔒 Bloquear";
                btnLogout.onclick = () => signOut(auth);
                // Lo sumamos al lado del botón de registrar gasto
                headerSeccion.querySelector("div")?.appendChild(btnLogout) || headerSeccion.appendChild(btnLogout);
            }
        } else {
            // Si NO está logueado: mostramos el login y ocultamos el balance
            if (divLogin) divLogin.style.display = "block";
            if (panelFinancieroContenido) panelFinancieroContenido.style.display = "none";
            
            const btnLogout = document.getElementById("btnLogoutAdmin");
            if (btnLogout) btnLogout.remove();
        }
    });

    // Manejar el submit del login
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