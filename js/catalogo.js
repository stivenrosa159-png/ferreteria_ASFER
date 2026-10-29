/**
 * ============================================================================
 * FERRETERIA ASFER - MODULO DE CATALOGO Y CARRUSELES DESLIZABLES CON FLECHAS
 * Constanza, Republica Dominicana
 * Desplazamiento horizontal suave por categoria, navegacion con flechas SVG,
 * deteccion de limites de scroll y animaciones refinadas.
 * Sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    let categoriaSeleccionada = 'Todos';
    let terminoBusqueda = '';

    // Icono SVG para la flecha izquierda
    const SVG_FLECHA_IZQUIERDA = `
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `;

    // Icono SVG para la flecha derecha
    const SVG_FLECHA_DERECHA = `
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    `;

    // Icono SVG para agregar al carrito
    const SVG_AGREGAR_CARRITO = `
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    `;

    /**
     * Genera los botones de filtro de categorias
     */
    function renderizarFiltrosCategoria() {
        const contenedorFiltros = document.getElementById('filtrosCategoria');
        if (!contenedorFiltros) return;

        contenedorFiltros.innerHTML = '';
        const listaCategorias = ['Todos', ...window.DatosASFER.categorias];

        listaCategorias.forEach(function (cat) {
            const btn = document.createElement('button');
            btn.className = 'boton-filtro' + (cat === categoriaSeleccionada ? ' activo' : '');
            btn.setAttribute('type', 'button');
            btn.textContent = cat;

            btn.onclick = function () {
                categoriaSeleccionada = cat;
                renderizarFiltrosCategoria();
                renderizarCatalogo();
            };

            contenedorFiltros.appendChild(btn);
        });
    }

    /**
     * Desplaza horizontalmente la pista del carrusel con animacion suave
     * @param {string} idPista ID del contenedor con scroll
     * @param {string} direccion 'izquierda' o 'derecha'
     */
    function desplazarCarrusel(idPista, direccion) {
        const pista = document.getElementById(idPista);
        if (!pista) return;

        // Calcular desplazamiento proporcional al ancho visible (aprox 2 tarjetas)
        const distanciaDesplazamiento = Math.max(280, pista.clientWidth * 0.75);
        const cambio = direccion === 'derecha' ? distanciaDesplazamiento : -distanciaDesplazamiento;

        pista.scrollBy({
            left: cambio,
            behavior: 'smooth'
        });
    }

    /**
     * Actualiza el estado habilitado/deshabilitado de las flechas segun el scroll
     * @param {HTMLElement} pista
     * @param {HTMLButtonElement} btnIzq
     * @param {HTMLButtonElement} btnDer
     */
    function actualizarEstadoFlechas(pista, btnIzq, btnDer) {
        if (!pista || !btnIzq || !btnDer) return;

        const tolerancia = 5;
        const alInicio = pista.scrollLeft <= tolerancia;
        const alFinal = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - tolerancia;

        btnIzq.disabled = alInicio;
        btnDer.disabled = alFinal;
    }

    /**
     * Crea el elemento HTML de una tarjeta de producto
     * @param {object} producto
     * @returns {HTMLElement}
     */
    function crearTarjetaProducto(producto) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-producto';

        const sesion = window.SeguridadASFER.obtenerSesionActual();
        const esAdmin = sesion && sesion.rol === 'administrador';

        let botonAdminHtml = '';
        if (esAdmin) {
            botonAdminHtml = `
                <div style="position:absolute; top:10px; right:10px; z-index:5; display:flex; gap:6px;">
                    <button class="btn-accion-icono" onclick="eliminarProductoAdmin(${producto.id})" title="Eliminar producto" style="background:rgba(255,255,255,0.9); box-shadow:var(--sombra-sm);">
                        <svg viewBox="0 0 24 24" stroke="#E5191C" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
        }

        tarjeta.innerHTML = `
            ${botonAdminHtml}
            <div class="imagen-producto">
                <img src="${producto.imagen}" alt="${window.SeguridadASFER.sanitizarTexto(producto.nombre)}" loading="lazy"
                    onerror="this.parentElement.innerHTML='<span class=&quot;imagen-no-disponible&quot;>Ferretería ASFER</span>'">
            </div>
            <div class="info-producto">
                <span class="categoria-etiqueta">${producto.categoria}</span>
                <h3 class="nombre-producto">${window.SeguridadASFER.sanitizarTexto(producto.nombre)}</h3>
                <div class="precio-producto">RD$${producto.precio.toLocaleString('es-DO')}</div>
                <div class="precio-nota">Stock ref: ${producto.stock} uds.</div>
                <button class="boton-agregar" type="button" onclick="window.CarritoASFER.agregarProducto(${producto.id})">
                    ${SVG_AGREGAR_CARRITO}
                    <span>Agregar al pedido</span>
                </button>
            </div>
        `;

        return tarjeta;
    }

    /**
     * Renderiza el catalogo completo dividido por categorias con desplazamiento horizontal y flechas
     */
    function renderizarCatalogo() {
        const contenedor = document.getElementById('cuadriculaProductos');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        const todosLosProductos = window.DatosASFER.obtenerProductos();

        // Filtrado por buscador
        const busquedaLimpia = terminoBusqueda.toLowerCase().trim();
        const productosFiltrados = todosLosProductos.filter(function (prod) {
            const coincideTexto = prod.nombre.toLowerCase().includes(busquedaLimpia) ||
                                  prod.categoria.toLowerCase().includes(busquedaLimpia) ||
                                  (prod.descripcion && prod.descripcion.toLowerCase().includes(busquedaLimpia));
            const coincideCategoria = (categoriaSeleccionada === 'Todos' || prod.categoria === categoriaSeleccionada);
            return coincideTexto && coincideCategoria;
        });

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="sin-resultados">
                    <p>No se encontraron productos coincidentes con su criterio de búsqueda.</p>
                </div>
            `;
            return;
        }

        // Si se selecciono una categoria especifica, se muestra esa categoria; si no, todas las que tengan productos
        const categoriasAMostrar = (categoriaSeleccionada === 'Todos')
            ? window.DatosASFER.categorias
            : [categoriaSeleccionada];

        categoriasAMostrar.forEach(function (catNombre, index) {
            const productosDeCategoria = productosFiltrados.filter(p => p.categoria === catNombre);
            if (productosDeCategoria.length === 0) return;

            const idPista = 'pista-carrusel-' + index;

            const seccion = document.createElement('div');
            seccion.className = 'seccion-categoria-carrusel animar-entrada visible';

            // Cabecera de la seccion de categoria con titulo y flechas de navegacion
            const cabecera = document.createElement('div');
            cabecera.className = 'cabecera-carrusel';
            cabecera.innerHTML = `
                <div class="titulo-carrusel-grupo">
                    <h3 class="titulo-carrusel">${catNombre}</h3>
                    <span class="conteo-categoria">${productosDeCategoria.length} productos</span>
                </div>
                <div class="controles-flechas-carrusel">
                    <button class="btn-flecha-carrusel flecha-izq" id="flecha-izq-${index}" type="button" aria-label="Desplazar a la izquierda" title="Ver anteriores">
                        ${SVG_FLECHA_IZQUIERDA}
                    </button>
                    <button class="btn-flecha-carrusel flecha-der" id="flecha-der-${index}" type="button" aria-label="Desplazar a la derecha" title="Ver siguientes">
                        ${SVG_FLECHA_DERECHA}
                    </button>
                </div>
            `;

            // Pista de productos deslizable
            const pista = document.createElement('div');
            pista.className = 'pista-deslizante-productos';
            pista.id = idPista;

            productosDeCategoria.forEach(function (prod) {
                pista.appendChild(crearTarjetaProducto(prod));
            });

            seccion.appendChild(cabecera);
            seccion.appendChild(pista);
            contenedor.appendChild(seccion);

            // Asignar listeners a las flechas de este carrusel
            const btnIzq = seccion.querySelector('#flecha-izq-' + index);
            const btnDer = seccion.querySelector('#flecha-der-' + index);

            btnIzq.onclick = function () {
                desplazarCarrusel(idPista, 'izquierda');
            };

            btnDer.onclick = function () {
                desplazarCarrusel(idPista, 'derecha');
            };

            // Escuchar scroll para actualizar estado de flechas activas/inactivas
            pista.addEventListener('scroll', function () {
                actualizarEstadoFlechas(pista, btnIzq, btnDer);
            });

            // Estado inicial de las flechas
            setTimeout(function () {
                actualizarEstadoFlechas(pista, btnIzq, btnDer);
            }, 60);
        });
    }

    /**
     * Manejador de busqueda en tiempo real
     */
    function actualizarBusqueda(texto) {
        terminoBusqueda = texto;
        renderizarCatalogo();
    }

    /**
     * Permite al Administrador eliminar un producto
     */
    window.eliminarProductoAdmin = function (idProducto) {
        if (!window.SeguridadASFER.tienePermiso('administrador')) {
            window.AppASFER.mostrarToast('Acceso denegado: solo administradores pueden eliminar productos.', 'error');
            return;
        }

        if (confirm('¿Está seguro de eliminar este producto del catálogo oficial?')) {
            let productos = window.DatosASFER.obtenerProductos();
            productos = productos.filter(p => p.id !== idProducto);
            window.DatosASFER.guardarProductos(productos);
            window.SeguridadASFER.registrarLogAuditoria('ELIMINAR_PRODUCTO', 'Producto ID ' + idProducto + ' eliminado');
            window.AppASFER.mostrarToast('Producto eliminado exitosamente del catálogo.', 'exito');
            renderizarCatalogo();
        }
    };

    // Exportacion publica del modulo de catalogo
    window.CatalogoASFER = {
        renderizarFiltrosCategoria: renderizarFiltrosCategoria,
        renderizarCatalogo: renderizarCatalogo,
        actualizarBusqueda: actualizarBusqueda,
        desplazarCarrusel: desplazarCarrusel
    };
})();
