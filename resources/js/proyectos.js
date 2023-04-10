window.addEventListener("DOMContentLoaded", () => {
    cargarProyecto();
});

// Funcion asincrona para cargar el proyecto

/**
 *
 * @param page numero de paginacion
 */
async function cargarProyecto(page = "") {
    const response = await fetch(`allprojects?page=${page}`);
    const dataprojects = await response.json();
    const tbody = document.querySelector("#tbody");
    tbody.innerHTML = "";

    dataprojects.proyectos.data.forEach((proyecto) => {
        const estado = proyecto.status
            ? "<button class='active p-2 rounded-lg bg-slate-800' title='Inhabilitar'>Activo</button>"
            : "Inactivo";
        const cantidadTareas = proyecto.tareas.length;
        // Traemos la Fecha desde el servidor y le damos formato
        const fecha_creacion = new Date(proyecto.created_at)
            .toLocaleDateString("es-VE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
            .split("/")
            .reverse()
            .join("-");

        // Creamos cada una de las filas del datatable con su estructura
        const proyectoHTML = `
            <tr class="border-b border-gray-700" data-id="${proyecto.id}">
                <td class="py-3 px-2 font-bold">
                    <div class="inline-flex space-x-3 items-center">
                        <span class="indent-2">${proyecto.nombre}</span>
                    </div>
                </td>
                <td class="py-3 px-2">${proyecto.descripcion.substring(
                    0,
                    30
                )}...</td>
                <td class="py-3 px-2 text-center">${cantidadTareas}</td>
                <td class="py-3 px-2">${fecha_creacion}</td>
                <td class="py-3 px-2">${estado}</td>
                <td class="py-3 px-2">
                    <div class="grid grid-cols-2 justify-center gap-4">
                        <a href="" title="Editar proyecto" class="hover:text-white">
                            <i class="fas fa-pen-to-square"></i>
                        </a>
                        <button class="mostrar hover:text-white" title="Mostrar Detalles"><i class="fas fa-eye"></i></button>
                        <button class="eliminar hover:text-white" title="Eliminar proyecto"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        // Insertamos cada una de las filas con su estructura
        tbody.insertAdjacentHTML("beforeend", proyectoHTML);
    });

    // Modal de Mostrar Proyectos
    const Modal = document.querySelector("#modal-component-container");
    const btnMostrar = document.querySelectorAll(".mostrar");

    // Creamos el evento click a cada uno de los botones mostrar
    btnMostrar.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const proyecto_id = event.target.closest("tr").dataset.id;
            Modal.classList.remove("hidden");
            // Funcion que nos genera el modal
            proyectoshow(proyecto_id, Modal);
        });
    });

    // boton inabilitar, activar
    const btnactive = document.querySelectorAll(".active");
    // Creamos el evento para cada uno de los botones activo
    btnactive.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const proyecto_id = event.target.closest("tr").dataset.id;
            const data = {
                id: proyecto_id,
                status: 0,
            };

            // Usamos SweetAlert2
            Swal.fire({
                title: "Deseas Inhabilitar el Proyecto?",
                text: "¡No podrás revertir esto!",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, Inhabilitar!",
            }).then((result) => {
                if (result.isConfirmed) {
                    // Llamamos a la funcion actualizarproyecto para cambiar el status
                    actualizarproyecto(data);
                }
            });
        });
    });

    // Estructura de la Paginacion del Datatable
    const paginate = document.querySelector(".paginate");
    paginate.innerHTML = "";
    const lastPages = dataprojects.proyectos.last_page;
    const currentPage = dataprojects.proyectos.current_page;
    const Total = dataprojects.proyectos.total;
    const describe = document.querySelector(".describe");
    // Actualizar la descripción sin generarla de nuevo
    describe.innerHTML = `<p> Mostrando ${currentPage} a ${lastPages} de ${Total} Entradas</p>`;

    let btnPaginate = "";

    if (currentPage > 1) {
        btnPaginate += `<button id="prev" class="btn bg-black/60 rounded-lg py-2 px-8">Prev</button>`;
    }

    if (currentPage < lastPages) {
        btnPaginate += `<button id="next" class="btn bg-black/60 rounded-lg py-2 px-8">Next</button>`;
    }

    paginate.insertAdjacentHTML("beforeend", btnPaginate);

    const btnPrev = document.querySelector("#prev");
    const btnNext = document.querySelector("#next");

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            cargarProyecto(currentPage + 1);
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            cargarProyecto(currentPage - 1);
        });
    }
}

/**
 *
 * @param {object} data objeto de los datos a actualizar
 */
// Funcion para actualizar el estado del Proyecto
async function actualizarproyecto(data) {
    try {
        const token = document.querySelector('meta[name="csrf-token"]').content;
        const response = await fetch(`proyectos/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": token,
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            // Si la respuesta es exitosa, actualiza la lista de proyectos
            cargarProyecto();
        } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.log(error);
    }
}

// Funcion que nos mostrará el modal de manera Dinamica
async function proyectoshow(id_proyecto, Modal) {
    const response = await fetch(`proyectos/${id_proyecto}`);
    const proyectoshow = await response.json();
    const proyecto = proyectoshow.proyecto;
    const tareas = proyectoshow.proyecto.tareas;

    Modal.innerHTML = ` <div
            class="modal-flex-container flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="modal-bg-container fixed inset-0 bg-gray-700 bg-opacity-75"></div>
            <div class="modal-space-container hidden sm:inline-block sm:align-middle sm:h-screen"></div>
            <div
                class="modal-container inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div class="modal-wrapper bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="modal-wrapper-flex sm:flex sm:items-start">
                        <div
                            class="modal-icon mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <i class="fas fa-paste mx-auto text-xl"></i>
                        </div>
                        <div class="modal-content text-center mt-3 sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="font-bold text-gray-900 text-xl">${
                                proyecto.nombre
                            }</h3>
                            <div class="modal-text mt-2">
                                <p class="text-black font-semibold my-2">Descripción</p>
                                <p class="text-gray-800 text-left">
                                    ${proyecto.descripcion}
                                </p>
                                <h2 class="my-3 text-black font-semibold">Tareas</h2>
                                <div>
                                    <ul class="ml-4 text-left list-disc text-black">
                                        ${tareas
                                            .map(
                                                (tarea) =>
                                                    `<li>${tarea.nombre}</li>`
                                            )
                                            .join("")}
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button id="exit" 
                        class="w-full inline-flex justify-center rounded-md border-transparent shadow-md px-4 py-2 bg-slate-800 font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-200 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Salir</button>
                </div>
            </div>
        </div>`;

    // Boton para salir del Modal
    const btnExit = document.querySelector("#exit");
    btnExit.addEventListener("click", () => {
        Modal.classList.add("hidden");
        Modal.innerHTML = "";
    });
}