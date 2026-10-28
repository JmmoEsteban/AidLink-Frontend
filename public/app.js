const apiURL = 'http://localhost:8080/Usuario';
let datos = [];

async function obtenerUsuarios() {
  try {
    const respuesta = await fetch(`${apiURL}/todos`);
    
    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    datos = await respuesta.json();
    console.log(datos);
  } catch (error) {
    console.error('Hubo un problema con la petición:', error);
  }
  if(datos){
    mostrarUsuarios();
  }
}

function mostrarUsuarios(){
const tabla = document.getElementById('tablaUsuarios');
    tabla.innerHTML = '';

    for (let i = 0; i < datos.length; i++) {
        const usuario = datos[i];
        const fila = document.createElement('tr');

        const columnaNombre = document.createElement('td');

        const avatar = document.createElement('span');
        avatar.classList.add('avatar');
        avatar.textContent =
            `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();

        const nombre = document.createElement('span');
        nombre.classList.add('person-name');
        nombre.textContent = `${usuario.nombre} ${usuario.apellido}`;

        columnaNombre.append(avatar, nombre);

        const columnaCorreo = document.createElement('td');
        columnaCorreo.textContent = usuario.correo;

        const columnaAcciones = document.createElement('td');
        columnaAcciones.classList.add('actions');

        const botonEditar = document.createElement('button');
        botonEditar.classList.add('btn-icon', 'edit');
        botonEditar.type = 'button';
        botonEditar.setAttribute('aria-label', 'Editar');
        botonEditar.onclick = () => editar(usuario.id);
        botonEditar.textContent = '✎';

        const botonEliminar = document.createElement('button');
        botonEliminar.classList.add('btn-icon', 'delete');
        botonEliminar.type = 'button';
        botonEliminar.setAttribute('aria-label', 'Eliminar');
        botonEliminar.onclick = () => eliminarUsuario(usuario.id);
        botonEliminar.textContent = '♲';

        columnaAcciones.append(botonEditar, botonEliminar);

        fila.append(
            columnaNombre,
            columnaCorreo,
            columnaAcciones
        );

        tabla.appendChild(fila);
    }
}

async function editar(id) {
    try {
        const respuesta = await fetch(`${apiURL}/id?id=${id}`);

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const usuario = await respuesta.json();

        const modalAnterior = document.getElementById('modalEditar');
        if (modalAnterior) {
            modalAnterior.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'modalEditar';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content">
                <h2>Editar usuario</h2>

                <form id="formEditarUsuario">
                    <label>
                        Nombre
                        <input type="text" id="editarNombre" required>
                    </label>

                    <label>
                        Apellido
                        <input type="text" id="editarApellido" required>
                    </label>

                    <label>
                        Correo electrónico
                        <input type="email" id="editarCorreo" required>
                    </label>

                    <div class="modal-actions">
                        <button class="btn btn-primary" type="submit">Guardar cambios</button>
                        <button class="btn btn-secundary" type="button" id="cerrarModal">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('editarNombre').value = usuario.nombre ?? '';
        document.getElementById('editarApellido').value = usuario.apellido ?? '';
        document.getElementById('editarCorreo').value = usuario.correo ?? '';

        document.getElementById('cerrarModal').onclick = () => {
            modal.remove();
        };

        document.getElementById('formEditarUsuario').onsubmit = async (evento) => {
            evento.preventDefault();

            const usuarioActualizado = {
                ...usuario,
                nombre: document.getElementById('editarNombre').value.trim(),
                apellido: document.getElementById('editarApellido').value.trim(),
                correo: document.getElementById('editarCorreo').value.trim()
            };

            await actualizarUsuario(usuarioActualizado);
            modal.remove();
        };

    } catch (error) {
        console.error('Error al obtener el usuario:', error);
    }
}

async function crearUsuario(usuario) {
    try {
        const respuesta = await fetch(`${apiURL}/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        if (!respuesta.ok) {
            throw new Error(`Error: ${respuesta.status}`);
        }

        console.log('Usuario creado correctamente');
        document.getElementById('formUsuario').reset();

        obtenerUsuarios();
    } catch (error) {
        console.error('Error al crear el usuario:', error);
    }
}

function registrarUsuario() {
    const usuario = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        estado: 1
    };

    if (!usuario.nombre || !usuario.apellido || !usuario.correo) {
        alert('Completa todos los campos');
        return;
    }

    crearUsuario(usuario);
}

async function actualizarUsuario(usuario) {
    try {
        const respuesta = await fetch(`${apiURL}/actualizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        if (!respuesta.ok) {
            throw new Error(`Error al actualizar: ${respuesta.status}`);
        }

        alert('Usuario actualizado correctamente');
        await obtenerUsuarios();

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        alert('No se pudo actualizar el usuario');
    }
}

async function obtenerUsuario(id){
  try {
    const respuesta = await fetch(`${apiURL}/id?id=${id}`);
    
    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    console.log(datos);
  } catch (error) {
    console.error('Hubo un problema con la petición:', error);
  }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }

    try {
        const respuesta = await fetch(`${apiURL}/eliminar?id=${id}`, {
            method: 'PUT'
        });

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        alert('Usuario eliminado correctamente');
        await obtenerUsuarios();

    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        alert('No se pudo eliminar el usuario');
    }
}

obtenerUsuarios();
obtenerUsuario(1);
