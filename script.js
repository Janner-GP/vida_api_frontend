import ENV from './config.js';

const API_URL = ENV.API_URL;

// Estado
let editMode = false;

// Referencias al DOM
const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');
const userIdInput = document.getElementById('userId');
const userNameInput = document.getElementById('userName');
const birthDateInput = document.getElementById('birthDate');

/**
 * READ: Obtener usuarios de la API
 */
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        const users = await response.json();
        renderTable(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

/**
 * RENDER: Dibujar la tabla
 */
function renderTable(users) {
    userTableBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        const dateFormatted = new Date(user.birth_date).toLocaleDateString('es-ES');

        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-mono text-gray-400">${user.id.substring(0, 8)}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${user.name}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${dateFormatted}</td>
            <td class="px-6 py-4 text-sm font-medium">
                <button onclick="prepareEdit('${user.id}', '${user.name}', '${user.birth_date}')" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                <button onclick="deleteUser('${user.id}')" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

/**
 * CREATE / UPDATE: Manejador del formulario
 */
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        name: userNameInput.value,
        birth_date: new Date(birthDateInput.value).toISOString()
    };

    try {
        if (editMode) {
            // UPDATE (PUT)
            const id = userIdInput.value;
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            resetForm();
        } else {
            // CREATE (POST)
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...userData,
                    created_at: new Date().toISOString()
                })
            });
        }

        userForm.reset();
        fetchUsers(); // Recargar tabla
    } catch (error) {
        alert("Error al guardar los datos");
    }
});

/**
 * DELETE: Eliminar de la API
 */
window.deleteUser = async (id) => {
    if (!confirm('¿Eliminar registro?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchUsers();
    } catch (error) {
        console.error("Error al borrar:", error);
    }
};

/**
 * Preparar edición (Cargar datos al form)
 */
window.prepareEdit = (id, name, birth_date) => {
    userIdInput.value = id;
    userNameInput.value = name;
    birthDateInput.value = birth_date.split('T')[0];

    editMode = true;
    submitBtn.innerText = 'Actualizar Usuario';
    submitBtn.classList.replace('bg-indigo-600', 'bg-green-600');
    formTitle.innerText = `Editando a ${name}`;
};

function resetForm() {
    editMode = false;
    userIdInput.value = '';
    submitBtn.innerText = 'Guardar Usuario';
    submitBtn.classList.replace('bg-green-600', 'bg-indigo-600');
    formTitle.innerText = 'Agregar Nuevo Usuario';
}

// Inicializar
await fetchUsers();