const API_BASE = '';
const form = document.getElementById('userForm');
const userList = document.getElementById('userList');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');
const cancelEditBtn = document.getElementById('cancelEdit');

const state = {
  users: [],
  editingId: null
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || 'Ocurrió un error';
    throw new Error(message);
  }

  return payload;
}

function getStatusBadge(stateValue) {
  const isActive = Number(stateValue) === 1;
  return `
    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
      ${isActive ? 'Activo' : 'Inactivo'}
    </span>
  `;
}

function renderStats(users) {
  const total = users.length;
  const activos = users.filter((user) => Number(user.estado) === 1).length;
  const disponibles = Math.max(total - activos, 0);

  document.getElementById('totalUsuarios').textContent = total;
  document.getElementById('usuariosActivos').textContent = activos;
  document.getElementById('usuariosDisponibles').textContent = disponibles;
}

function renderUsers(users) {
  const filteredUsers = users.filter((user) => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return true;

    const text = `${user.nombre || ''} ${user.apellido || ''} ${user.correo || ''}`.toLowerCase();
    return text.includes(query);
  });

  if (!filteredUsers.length) {
    userList.innerHTML = `
      <div class="empty-state">
        <h4>No hay invitados registrados</h4>
        <p>Intenta buscar otro nombre o agrega un nuevo invitado a la fiesta.</p>
      </div>
    `;
    return;
  }

  userList.innerHTML = filteredUsers.map((user) => `
    <article class="user-card" data-id="${user.id ?? user.id_usuario ?? ''}">
      <div class="user-header">
        <div>
          <div class="user-name">${user.nombre || 'Sin nombre'} ${user.apellido || ''}</div>
          <div class="user-meta">
            <span>${user.correo || 'Sin correo'}</span>
            <span>ID: ${user.id ?? user.id_usuario ?? 'N/A'}</span>
          </div>
        </div>
        ${getStatusBadge(user.estado)}
      </div>

      <div class="card-actions">
        <button class="action-btn edit" type="button" data-action="edit" data-id="${user.id ?? user.id_usuario ?? ''}">Editar</button>
        <button class="action-btn delete" type="button" data-action="delete" data-id="${user.id ?? user.id_usuario ?? ''}">Eliminar</button>
      </div>
    </article>
  `).join('');
}

async function loadUsers() {
  try {
    const data = await apiFetch('/Usuario/todos');
    state.users = Array.isArray(data) ? data : [];
    renderStats(state.users);
    renderUsers(state.users);
  } catch (error) {
    showToast(error.message || 'No se pudieron cargar los usuarios');
    userList.innerHTML = `
      <div class="empty-state">
        <h4>No se pudo cargar la lista</h4>
        <p>Verifica que el backend esté en ejecución en http://localhost:8080.</p>
      </div>
    `;
  }
}

async function createUser(payload) {
  return apiFetch('/Usuario/crear', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function updateUser(payload) {
  return apiFetch('/Usuario/actualizar', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

async function deleteUser(id) {
  return apiFetch(`/Usuario/eliminar?id=${id}`, {
    method: 'PUT'
  });
}

function resetForm() {
  form.reset();
  state.editingId = null;
  document.getElementById('userId').value = '';
  document.getElementById('estado').value = '1';
  form.querySelector('button[type="submit"]').textContent = 'Guardar invitado';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    apellido: document.getElementById('apellido').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    contrasena: document.getElementById('contrasena').value,
    estado: Number(document.getElementById('estado').value)
  };

  if (!payload.nombre || !payload.apellido || !payload.correo || !payload.contrasena) {
    showToast('Completa todos los campos antes de continuar');
    return;
  }

  try {
    if (state.editingId) {
      payload.id = Number(state.editingId);
      await updateUser(payload);
      showToast('Invitado actualizado correctamente');
    } else {
      await createUser(payload);
      showToast('Invitado registrado con éxito');
    }

    resetForm();
    await loadUsers();
  } catch (error) {
    showToast(error.message || 'No se pudo guardar el invitado');
  }
});

userList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === 'edit') {
    const user = state.users.find((item) => Number(item.id ?? item.id_usuario) === id);
    if (!user) return;

    state.editingId = id;
    document.getElementById('userId').value = id;
    document.getElementById('nombre').value = user.nombre || '';
    document.getElementById('apellido').value = user.apellido || '';
    document.getElementById('correo').value = user.correo || '';
    document.getElementById('contrasena').value = user.contrasena || '';
    document.getElementById('estado').value = String(user.estado ?? 1);
    form.querySelector('button[type="submit"]').textContent = 'Actualizar invitado';
    document.getElementById('registro').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (action === 'delete') {
    try {
      await deleteUser(id);
      showToast('Invitado eliminado');
      await loadUsers();
    } catch (error) {
      showToast(error.message || 'No se pudo eliminar al invitado');
    }
  }
});

searchInput.addEventListener('input', () => renderUsers(state.users));
cancelEditBtn.addEventListener('click', resetForm);

loadUsers();
