import { db } from "./app.js";
// Nota: Asegurate de importar getAuth, signInWithEmailAndPassword, etc. desde el SDK de auth de firebase
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Inicializar Auth (asumiendo que app.js exporta la app principal o inicializamos auth con la app)
// Si en app.js exportás `app`, podés hacer: import { app } from "./app.js"; const auth = getAuth(app);
const auth = getAuth(); 

export function inicializarAutenticacionBalance() {
    const tabBalance = document.querySelector('[data-bs-target="#balance"]');
    const contenidoBalance = document.getElementById("balance");
    if (!contenidoBalance) return;

    // Creamos un contenedor de Login dentro de la pestaña de Balance si no está logueado
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

    // Escuchar cambios de estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario logueado: Ocultamos el login y mostramos el contenido protegido del balance
            divLogin.style.display = "none";
            contenidoBalance.style.display = "block";
            
            // Opcional: Agregar botón de cerrar sesión en la solapa de balance
            if (!document.getElementById("btnLogoutAdmin")) {
                const btnLogout = document.createElement("button");
                btnLogout.id = "btnLogoutAdmin";
                btnLogout.className = "btn btn-sm btn-outline-danger mb-3";
                btnLogout.textContent = "🔒 Cerrar Sesión de Administrador";
                btnLogout.onclick = () => signOut(auth);
                contenidoBalance.prepend(btnLogout);
            }
        } else {
            // No logueado: Mostramos el login y ocultamos el balance
            divLogin.style.display = "flex";
            contenidoBalance.style.display = "none";
        }
    });

    // Manejar el formulario de inicio de sesión
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