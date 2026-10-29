/**
 * ============================================================================
 * FERRETERIA ASFER - CONTROLADOR PRINCIPAL DE LA APLICACION (APP.JS)
 * Constanza, Republica Dominicana
 * Orquestacion de inicializacion, control de temas, modales de autenticacion,
 * paneles de administracion y empleado segun rol, horarios y toasts.
 * Sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    let pestanaAuthActual = 'login';
    let temporizadorBloqueo = null;

    /**
     * Muestra un mensaje flotante (Toast) en pantalla
     * @param {string} mensaje
     * @param {string} tipo 'exito', 'alerta', 'error'
     */
    function mostrarToast(mensaje, tipo = 'exito') {
        const contenedor = document.getElementById('contenedorToasts');
        if (!contenedor) return;

        const toast = document.createElement('div');
        toast.className = 'toast-mensaje ' + tipo;

        let svgIcono = '';
        if (tipo === 'exito') {
            svgIcono = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else if (tipo === 'alerta') {
            svgIcono = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        } else {
            svgIcono = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        }

        toast.innerHTML = svgIcono + '<span>' + window.SeguridadASFER.sanitizarTexto(mensaje) + '</span>';
        contenedor.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Aplica el tema de interfaz (claro u oscuro)
     */
    function aplicarTema(tema) {
        document.documentElement.setAttribute('data-tema', tema);
        localStorage.setItem('asfer_tema', tema);
        const interruptor = document.getElementById('interruptorTema');
        if (interruptor) {
            interruptor.classList.toggle('activo', tema === 'oscuro');
        }
    }

    /**
     * Alterna entre modo claro y oscuro
     */
    function alternarTema() {
        const temaActual = document.documentElement.getAttribute('data-tema') || 'claro';
        aplicarTema(temaActual === 'oscuro' ? 'claro' : 'oscuro');
    }

    /**
     * Alterna la visibilidad del menu de configuracion
     */
    function alternarConfig() {
        const panel = document.getElementById('panelConfig');
        if (panel) panel.classList.toggle('abierto');
    }

    /**
     * Alterna la visibilidad del menu en movil
     */
    function alternarMenuMovil() {
        const menu = document.getElementById('menuNavegacion');
        if (menu) menu.classList.toggle('mostrar');
    }

    /**
     * Cierra paneles flotantes al hacer clic afuera
     */
    document.addEventListener('click', function (e) {
        const wrapConfig = document.querySelector('.config-envoltorio');
        const panelConfig = document.getElementById('panelConfig');
        if (wrapConfig && !wrapConfig.contains(e.target) && panelConfig) {
            panelConfig.classList.remove('abierto');
        }
    });

    /**
     * Actualiza los elementos del encabezado segun el rol del usuario autenticado
     */
    function actualizarInterfazUsuario() {
        const sesion = window.SeguridadASFER.obtenerSesionActual();
        const contenedorBoton = document.getElementById('contenedorBotonSesion');
        const barraAviso = document.getElementById('barraSeguridadAviso');

        if (!contenedorBoton) return;

        if (sesion) {
            const rolTexto = sesion.rol.toUpperCase();
            let claseRol = 'rol-' + sesion.rol;

            contenedorBoton.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="insignia-rol ${claseRol}">
                        <svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"></path></svg>
                        ${rolTexto}
                    </span>
                    ${(sesion.rol === 'administrador' || sesion.rol === 'empleado') ? `
                        <button class="btn-rol-panel" type="button" onclick="window.AppASFER.abrirPanelGestion()">
                            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            <span>Panel</span>
                        </button>
                    ` : ''}
                    <button class="btn-rol-panel" type="button" onclick="window.AppASFER.cerrarSesionUsuario()" title="Cerrar sesión">
                        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span>Salir</span>
                    </button>
                </div>
            `;

            if (barraAviso) {
                barraAviso.style.display = 'flex';
                barraAviso.innerHTML = `
                    <span>
                        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Sesión Segura Activa: <strong>${window.SeguridadASFER.sanitizarTexto(sesion.nombre)}</strong> (${rolTexto})
                    </span>
                    <span style="color:#94A3B8;">Acceso validado por tokens criptográficos</span>
                `;
            }
        } else {
            contenedorBoton.innerHTML = `
                <button class="btn-rol-panel" type="button" onclick="window.AppASFER.abrirModalAuth()">
                    <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>Acceso / Roles</span>
                </button>
            `;

            if (barraAviso) {
                barraAviso.style.display = 'none';
            }
        }

        // Re-renderizar catalogo por si hay controles de administrador visibles
        if (window.CatalogoASFER && typeof window.CatalogoASFER.renderizarCatalogo === 'function') {
            window.CatalogoASFER.renderizarCatalogo();
        }
    }

    /**
     * Abre el modal de autenticacion
     */
    function abrirModalAuth() {
        const modal = document.getElementById('modalAutenticacion');
        const fondo = document.getElementById('fondoOscuroAuth');
        if (modal) modal.classList.add('abierto');
        if (fondo) fondo.classList.add('mostrar');

        verificarBloqueoUI();
    }

    /**
     * Cierra el modal de autenticacion
     */
    function cerrarModalAuth() {
        const modal = document.getElementById('modalAutenticacion');
        const fondo = document.getElementById('fondoOscuroAuth');
        if (modal) modal.classList.remove('abierto');
        if (fondo) fondo.classList.remove('mostrar');
    }

    /**
     * Alterna pestanas entre 'login' y 'registro'
     */
    function cambiarPestanaAuth(pestana) {
        pestanaAuthActual = pestana;
        const btnLogin = document.getElementById('pestanaBtnLogin');
        const btnReg = document.getElementById('pestanaBtnRegistro');
        const formLogin = document.getElementById('formularioLogin');
        const formReg = document.getElementById('formularioRegistro');

        if (pestana === 'login') {
            if (btnLogin) btnLogin.classList.add('activa');
            if (btnReg) btnReg.classList.remove('activa');
            if (formLogin) formLogin.style.display = 'block';
            if (formReg) formReg.style.display = 'none';
        } else {
            if (btnLogin) btnLogin.classList.remove('activa');
            if (btnReg) btnReg.classList.add('activa');
            if (formLogin) formLogin.style.display = 'none';
            if (formReg) formReg.style.display = 'block';
        }
    }

    /**
     * Completa el formulario de login con credenciales demo predeterminadas
     */
    function cargarCredencialDemo(rol) {
        const cuenta = window.DatosASFER.usuariosDemo.find(u => u.rol === rol);
        if (!cuenta) return;

        const inputCorreo = document.getElementById('correoLogin');
        const inputClave = document.getElementById('claveLogin');

        if (inputCorreo) inputCorreo.value = cuenta.correo;
        if (inputClave) inputClave.value = cuenta.clavePlana;

        mostrarToast('Credenciales de ' + rol.toUpperCase() + ' cargadas. Presione Iniciar Sesión.', 'alerta');
    }

    /**
     * Verifica y actualiza en pantalla el estado de bloqueo por intentos fallidos
     */
    function verificarBloqueoUI() {
        const estado = window.SeguridadASFER.verificarEstadoBloqueo();
        const alerta = document.getElementById('alertaSeguridadAuth');
        const botonEntrar = document.getElementById('btnSubmitLogin');

        if (estado.bloqueado) {
            if (alerta) {
                alerta.className = 'alerta-seguridad visible bloqueo';
                alerta.innerHTML = `
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>Bloqueo de seguridad: intente de nuevo en <strong id="segundosBloqueo">${estado.segundosRestantes}</strong>s.</span>
                `;
            }
            if (botonEntrar) botonEntrar.disabled = true;

            clearInterval(temporizadorBloqueo);
            temporizadorBloqueo = setInterval(function () {
                const nuevoEstado = window.SeguridadASFER.verificarEstadoBloqueo();
                if (!nuevoEstado.bloqueado) {
                    clearInterval(temporizadorBloqueo);
                    verificarBloqueoUI();
                } else {
                    const elSeg = document.getElementById('segundosBloqueo');
                    if (elSeg) elSeg.textContent = nuevoEstado.segundosRestantes;
                }
            }, 1000);
        } else {
            clearInterval(temporizadorBloqueo);
            if (alerta) alerta.className = 'alerta-seguridad';
            if (botonEntrar) botonEntrar.disabled = false;
        }
    }

    /**
     * Procesa el formulario de inicio de sesion con validacion de hash
     */
    async function procesarLogin(e) {
        e.preventDefault();

        const estadoBloqueo = window.SeguridadASFER.verificarEstadoBloqueo();
        if (estadoBloqueo.bloqueado) {
            mostrarToast('Cuenta temporalmente bloqueada por seguridad.', 'error');
            return false;
        }

        const correo = document.getElementById('correoLogin')?.value || '';
        const clave = document.getElementById('claveLogin')?.value || '';
        const alerta = document.getElementById('alertaSeguridadAuth');

        const resultado = await window.DatosASFER.autenticarUsuario(correo, clave);

        if (resultado.exito) {
            window.SeguridadASFER.limpiarIntentosFallidos();
            window.SeguridadASFER.guardarSesion(resultado.usuario);
            cerrarModalAuth();
            actualizarInterfazUsuario();
            mostrarToast('Bienvenido, ' + resultado.usuario.nombre + ' (' + resultado.usuario.rol.toUpperCase() + ')', 'exito');
        } else {
            const intento = window.SeguridadASFER.registrarIntentoFallido();
            if (intento.bloqueado) {
                verificarBloqueoUI();
                mostrarToast('Límite de intentos superado. Cuenta bloqueada por 3 minutos.', 'error');
            } else {
                if (alerta) {
                    alerta.className = 'alerta-seguridad visible error';
                    alerta.innerHTML = `
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        <span>${resultado.mensaje} Intentos restantes: ${intento.intentosRestantes}.</span>
                    `;
                }
                mostrarToast(resultado.mensaje, 'error');
            }
        }

        return false;
    }

    /**
     * Procesa el registro de un nuevo cliente con hash seguro
     */
    async function procesarRegistro(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombreRegistro')?.value || '';
        const correo = document.getElementById('correoRegistro')?.value || '';
        const clave = document.getElementById('claveRegistro')?.value || '';
        const confirmar = document.getElementById('confirmarClaveRegistro')?.value || '';

        if (clave !== confirmar) {
            mostrarToast('Las contraseñas no coinciden.', 'alerta');
            return false;
        }

        const fortaleza = window.SeguridadASFER.evaluarFortalezaContrasena(clave);
        if (!fortaleza.valida) {
            mostrarToast('La contraseña debe tener al menos 8 caracteres, números y mayúsculas.', 'alerta');
            return false;
        }

        const resultado = await window.DatosASFER.registrarNuevoUsuario(nombre, correo, clave, 'cliente');
        if (resultado.exito) {
            window.SeguridadASFER.guardarSesion(resultado.usuario);
            cerrarModalAuth();
            actualizarInterfazUsuario();
            mostrarToast('Registro exitoso. Bienvenido a Ferretería ASFER.', 'exito');
        } else {
            mostrarToast(resultado.mensaje, 'error');
        }

        return false;
    }

    /**
     * Cierra la sesion activa
     */
    function cerrarSesionUsuario() {
        window.SeguridadASFER.cerrarSesion();
        actualizarInterfazUsuario();
        mostrarToast('Sesión finalizada correctamente.', 'exito');
    }

    /**
     * Abre el panel de gestion correspondiente al rol (Admin o Empleado)
     */
    function abrirPanelGestion() {
        const sesion = window.SeguridadASFER.obtenerSesionActual();
        if (!sesion) {
            abrirModalAuth();
            return;
        }

        const modal = document.getElementById('modalPanelGestion');
        const fondo = document.getElementById('fondoOscuroPanel');
        if (modal) modal.classList.add('abierto');
        if (fondo) fondo.classList.add('mostrar');

        renderizarContenidoPanel();
    }

    /**
     * Cierra el panel de gestion
     */
    function cerrarPanelGestion() {
        const modal = document.getElementById('modalPanelGestion');
        const fondo = document.getElementById('fondoOscuroPanel');
        if (modal) modal.classList.remove('abierto');
        if (fondo) fondo.classList.remove('mostrar');
    }

    /**
     * Renderiza el contenido dinamico del panel segun rol
     */
    function renderizarContenidoPanel(pestanaActiva = 'pedidos') {
        const sesion = window.SeguridadASFER.obtenerSesionActual();
        if (!sesion) return;

        const titulo = document.getElementById('tituloPanelGestion');
        const navPestanas = document.getElementById('navPestanasPanel');
        const cuerpo = document.getElementById('cuerpoPanelGestion');

        if (!titulo || !navPestanas || !cuerpo) return;

        const esAdmin = sesion.rol === 'administrador';
        titulo.textContent = esAdmin ? 'Panel de Administración ASFER' : 'Panel Operativo de Empleados';

        // Definir pestanas segun rol
        navPestanas.innerHTML = `
            <button class="pestana-panel-btn ${pestanaActiva === 'pedidos' ? 'activa' : ''}" type="button" onclick="window.AppASFER.cambiarPestanaPanel('pedidos')">
                Gestión de Pedidos
            </button>
            ${esAdmin ? `
                <button class="pestana-panel-btn ${pestanaActiva === 'nuevo-producto' ? 'activa' : ''}" type="button" onclick="window.AppASFER.cambiarPestanaPanel('nuevo-producto')">
                    Agregar Producto
                </button>
                <button class="pestana-panel-btn ${pestanaActiva === 'auditoria' ? 'activa' : ''}" type="button" onclick="window.AppASFER.cambiarPestanaPanel('auditoria')">
                    Auditoría de Seguridad
                </button>
            ` : `
                <button class="pestana-panel-btn ${pestanaActiva === 'inventario' ? 'activa' : ''}" type="button" onclick="window.AppASFER.cambiarPestanaPanel('inventario')">
                    Consulta de Stock
                </button>
            `}
        `;

        if (pestanaActiva === 'pedidos') {
            renderizarTablaPedidos(cuerpo, esAdmin);
        } else if (pestanaActiva === 'nuevo-producto' && esAdmin) {
            renderizarFormularioNuevoProducto(cuerpo);
        } else if (pestanaActiva === 'auditoria' && esAdmin) {
            renderizarTablaAuditoria(cuerpo);
        } else if (pestanaActiva === 'inventario') {
            renderizarTablaInventario(cuerpo);
        }
    }

    /**
     * Cambia de pestana dentro del panel de gestion
     */
    function cambiarPestanaPanel(pestana) {
        renderizarContenidoPanel(pestana);
    }

    /**
     * Renderiza la tabla de pedidos con selector de estados en tiempo real
     */
    function renderizarTablaPedidos(contenedor, esAdmin) {
        const pedidos = window.DatosASFER.obtenerPedidos();

        if (pedidos.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; padding:30px; color:var(--texto-secundario);">No hay pedidos registrados.</p>';
            return;
        }

        let html = `
            <table class="tabla-gestion">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Artículos</th>
                        <th>Total</th>
                        <th>Estado Actual</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pedidos.forEach(function (ped) {
            const fechaFormateada = new Date(ped.fecha).toLocaleDateString('es-DO');
            const itemsResumen = ped.items.map(i => `${i.nombre} (${i.cantidad})`).join(', ');

            html += `
                <tr>
                    <td><strong>${ped.id}</strong><br><small style="color:var(--texto-atenuado);">${fechaFormateada}</small></td>
                    <td><strong>${window.SeguridadASFER.sanitizarTexto(ped.clienteNombre)}</strong><br><small>${window.SeguridadASFER.sanitizarTexto(ped.clienteTelefono)}</small></td>
                    <td style="max-width:240px; font-size:12px;">${window.SeguridadASFER.sanitizarTexto(itemsResumen)}</td>
                    <td><strong>RD$${ped.total.toLocaleString('es-DO')}</strong></td>
                    <td><span class="badge-estado ${ped.estado}">${ped.estado.toUpperCase()}</span></td>
                    <td>
                        <select onchange="window.AppASFER.cambiarEstadoPedido('${ped.id}', this.value)" style="padding:6px; border-radius:var(--radio-sm); border:1px solid var(--borde-medio); font-size:12px; background:var(--bg-superficie-alt); color:var(--texto-primario);">
                            <option value="pendiente" ${ped.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="preparacion" ${ped.estado === 'preparacion' ? 'selected' : ''}>En preparación</option>
                            <option value="listo" ${ped.estado === 'listo' ? 'selected' : ''}>Listo para entrega</option>
                            <option value="entregado" ${ped.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                        </select>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    }

    /**
     * Actualiza el estado de un pedido
     */
    function cambiarEstadoPedido(idPedido, nuevoEstado) {
        const pedidos = window.DatosASFER.obtenerPedidos();
        const ped = pedidos.find(p => p.id === idPedido);
        if (ped) {
            ped.estado = nuevoEstado;
            window.DatosASFER.guardarPedidos(pedidos);
            window.SeguridadASFER.registrarLogAuditoria('CAMBIO_ESTADO_PEDIDO', `Pedido ${idPedido} cambiado a ${nuevoEstado}`);
            mostrarToast(`Pedido ${idPedido} actualizado a estado: ${nuevoEstado.toUpperCase()}`, 'exito');
            renderizarContenidoPanel('pedidos');
        }
    }

    /**
     * Formulario para que el Administrador anada un producto nuevo
     */
    function renderizarFormularioNuevoProducto(contenedor) {
        contenedor.innerHTML = `
            <form onsubmit="return window.AppASFER.guardarNuevoProductoAdmin(event)" style="display:flex; flex-direction:column; gap:14px; max-width:600px; margin:0 auto; padding:10px 0;">
                <div class="grupo-campo">
                    <label>Nombre del Producto:</label>
                    <input type="text" id="nuevoProdNombre" class="campo-seguro" style="padding-left:14px;" placeholder="Ej. Llave inglesa ajustable 10 pulgadas" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
                    <div class="grupo-campo">
                        <label>Categoría:</label>
                        <select id="nuevoProdCat" class="campo-seguro" style="padding-left:14px;">
                            ${window.DatosASFER.categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="grupo-campo">
                        <label>Precio (RD$):</label>
                        <input type="number" id="nuevoProdPrecio" class="campo-seguro" style="padding-left:14px;" placeholder="Ej. 750" min="1" required>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
                    <div class="grupo-campo">
                        <label>Stock inicial:</label>
                        <input type="number" id="nuevoProdStock" class="campo-seguro" style="padding-left:14px;" placeholder="Ej. 20" min="0" required>
                    </div>
                    <div class="grupo-campo">
                        <label>URL de Imagen:</label>
                        <input type="url" id="nuevoProdImg" class="campo-seguro" style="padding-left:14px;" placeholder="https://..." required>
                    </div>
                </div>
                <div class="grupo-campo">
                    <label>Descripción técnica:</label>
                    <textarea id="nuevoProdDesc" class="campo-seguro" style="padding-left:14px; height:70px;" placeholder="Detalles de materiales, medidas y especificaciones"></textarea>
                </div>
                <button type="submit" class="btn btn-rojo" style="width:100%;">Publicar Producto en Catálogo</button>
            </form>
        `;
    }

    /**
     * Guarda el nuevo producto creado por el Administrador
     */
    function guardarNuevoProductoAdmin(e) {
        e.preventDefault();

        if (!window.SeguridadASFER.tienePermiso('administrador')) {
            mostrarToast('Acceso no autorizado.', 'error');
            return false;
        }

        const nombre = document.getElementById('nuevoProdNombre')?.value || '';
        const categoria = document.getElementById('nuevoProdCat')?.value || 'Herramientas';
        const precio = parseFloat(document.getElementById('nuevoProdPrecio')?.value || '0');
        const stock = parseInt(document.getElementById('nuevoProdStock')?.value || '0', 10);
        const imagen = document.getElementById('nuevoProdImg')?.value || '';
        const descripcion = document.getElementById('nuevoProdDesc')?.value || '';

        const productos = window.DatosASFER.obtenerProductos();
        const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

        const nuevo = {
            id: nuevoId,
            nombre: window.SeguridadASFER.sanitizarTexto(nombre),
            categoria: categoria,
            precio: precio,
            stock: stock,
            imagen: imagen,
            descripcion: window.SeguridadASFER.sanitizarTexto(descripcion)
        };

        productos.push(nuevo);
        window.DatosASFER.guardarProductos(productos);
        window.SeguridadASFER.registrarLogAuditoria('CREAR_PRODUCTO', `Producto ${nuevo.nombre} agregado con ID ${nuevoId}`);

        mostrarToast('Producto publicado exitosamente en el catálogo.', 'exito');
        cerrarPanelGestion();
        window.CatalogoASFER.renderizarCatalogo();
        return false;
    }

    /**
     * Renderiza la tabla de auditoria de seguridad
     */
    function renderizarTablaAuditoria(contenedor) {
        const logs = window.SeguridadASFER.obtenerLogsAuditoria();
        if (logs.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; padding:30px; color:var(--texto-secundario);">No hay eventos de auditoría registrados.</p>';
            return;
        }

        let html = `
            <table class="tabla-gestion">
                <thead>
                    <tr>
                        <th>Fecha y Hora</th>
                        <th>Acción</th>
                        <th>Usuario</th>
                        <th>Detalle</th>
                    </tr>
                </thead>
                <tbody>
        `;

        logs.forEach(function (log) {
            const fechaStr = new Date(log.fecha).toLocaleString('es-DO');
            html += `
                <tr>
                    <td><small style="color:var(--texto-atenuado);">${fechaStr}</small></td>
                    <td><strong>${log.accion}</strong></td>
                    <td>${log.usuario}</td>
                    <td>${log.detalle}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    }

    /**
     * Renderiza consulta de inventario para empleados
     */
    function renderizarTablaInventario(contenedor) {
        const productos = window.DatosASFER.obtenerProductos();

        let html = `
            <table class="tabla-gestion">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio (RD$)</th>
                        <th>Stock Actual</th>
                    </tr>
                </thead>
                <tbody>
        `;

        productos.forEach(function (p) {
            html += `
                <tr>
                    <td><strong>${window.SeguridadASFER.sanitizarTexto(p.nombre)}</strong></td>
                    <td>${p.categoria}</td>
                    <td>RD$${p.precio.toLocaleString('es-DO')}</td>
                    <td><strong>${p.stock}</strong> unidades</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;
    }

    /**
     * Alterna la visibilidad de la contrasena en inputs
     */
    function alternarVisibilidadClave(inputId) {
        const campo = document.getElementById(inputId);
        if (!campo) return;
        campo.type = campo.type === 'password' ? 'text' : 'password';
    }

    /**
     * Muestra y actualiza los horarios de atencion y el estado en vivo (Abierto/Cerrado)
     */
    function renderizarHorarios() {
        const listaUbicacion = document.getElementById('listaHorarioUbicacion');
        const listaContacto = document.getElementById('listaHorario');
        const estadoUbicacion = document.getElementById('estadoHorarioUbicacion');
        const estadoContacto = document.getElementById('estadoHorario');

        function formatearHora(hora) {
            const periodo = hora >= 12 ? 'p. m.' : 'a. m.';
            let h = hora % 12;
            if (h === 0) h = 12;
            return h + ':00 ' + periodo;
        }

        const itemsHtml = window.DatosASFER.horarios.map(function (d) {
            const horaTexto = d.cerrado ? 'Cerrado' : `${formatearHora(d.apertura)} – ${formatearHora(d.cierre)}`;
            return `<li><span>${d.dia}</span><strong>${horaTexto}</strong></li>`;
        }).join('');

        if (listaUbicacion) listaUbicacion.innerHTML = itemsHtml;
        if (listaContacto) listaContacto.innerHTML = itemsHtml;

        // Calcular estado en vivo
        const ahora = new Date();
        const diaSemana = ahora.getDay();
        const horaActual = ahora.getHours();
        const ordenSemana = [
            window.DatosASFER.horarios[6], // Domingo
            window.DatosASFER.horarios[0], // Lunes
            window.DatosASFER.horarios[1], // Martes
            window.DatosASFER.horarios[2], // Miercoles
            window.DatosASFER.horarios[3], // Jueves
            window.DatosASFER.horarios[4], // Viernes
            window.DatosASFER.horarios[5]  // Sabado
        ];

        const hoy = ordenSemana[diaSemana];
        const abierto = !hoy.cerrado && horaActual >= hoy.apertura && horaActual < hoy.cierre;

        const estadoHtml = abierto
            ? '<span class="punto-latido"></span><span>ABIERTO AHORA</span>'
            : '<span class="punto-latido"></span><span>CERRADO EN ESTE MOMENTO</span>';
        const claseEstado = abierto ? 'estado-horario estado-abierto' : 'estado-horario estado-cerrado';

        if (estadoUbicacion) {
            estadoUbicacion.innerHTML = estadoHtml;
            estadoUbicacion.className = claseEstado;
        }
        if (estadoContacto) {
            estadoContacto.innerHTML = estadoHtml;
            estadoContacto.className = claseEstado;
        }
    }

    /**
     * Inicializa animaciones con IntersectionObserver
     */
    function inicializarAnimacionesScroll() {
        const elementos = document.querySelectorAll('.animar-entrada');
        const observer = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visible');
                    observer.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.1 });

        elementos.forEach(el => observer.observe(el));
    }

    /**
     * Inicializacion general cuando el DOM esta listo
     */
    document.addEventListener('DOMContentLoaded', async function () {
        // Inicializar tema guardado o claro por defecto
        const temaGuardado = localStorage.getItem('asfer_tema') || 'claro';
        aplicarTema(temaGuardado);

        // Inicializar base de datos con hashes SHA-256
        await window.DatosASFER.inicializarBaseDatos();

        // Renderizar componentes
        actualizarInterfazUsuario();
        window.CatalogoASFER.renderizarFiltrosCategoria();
        window.CatalogoASFER.renderizarCatalogo();
        window.CarritoASFER.actualizarInterfazCarrito();
        window.ResenasASFER.cargarResenas();
        window.ResenasASFER.inicializarSelectorEstrellas();
        renderizarHorarios();
        inicializarAnimacionesScroll();

        // Escuchar cambios en fortaleza de contrasena de registro
        const inputClaveReg = document.getElementById('claveRegistro');
        if (inputClaveReg) {
            inputClaveReg.addEventListener('input', function () {
                const medidor = document.getElementById('medidorFortaleza');
                const textoMedidor = document.getElementById('textoFortaleza');
                const barras = [
                    document.getElementById('barraSeg1'),
                    document.getElementById('barraSeg2'),
                    document.getElementById('barraSeg3'),
                    document.getElementById('barraSeg4')
                ];

                if (!medidor || !textoMedidor) return;
                medidor.style.display = 'block';

                const res = window.SeguridadASFER.evaluarFortalezaContrasena(this.value);
                textoMedidor.textContent = 'Seguridad: ' + res.mensaje;

                barras.forEach((b, idx) => {
                    if (b) {
                        b.style.backgroundColor = idx < res.puntos
                            ? (res.puntos <= 2 ? 'var(--ambar-alerta)' : 'var(--verde-exito)')
                            : 'var(--borde-sutil)';
                    }
                });
            });
        }
    });

    // Exportacion publica del modulo principal
    window.AppASFER = {
        mostrarToast: mostrarToast,
        aplicarTema: aplicarTema,
        alternarTema: alternarTema,
        alternarConfig: alternarConfig,
        alternarMenuMovil: alternarMenuMovil,
        abrirModalAuth: abrirModalAuth,
        cerrarModalAuth: cerrarModalAuth,
        cambiarPestanaAuth: cambiarPestanaAuth,
        cargarCredencialDemo: cargarCredencialDemo,
        procesarLogin: procesarLogin,
        procesarRegistro: procesarRegistro,
        cerrarSesionUsuario: cerrarSesionUsuario,
        abrirPanelGestion: abrirPanelGestion,
        cerrarPanelGestion: cerrarPanelGestion,
        cambiarPestanaPanel: cambiarPestanaPanel,
        cambiarEstadoPedido: cambiarEstadoPedido,
        guardarNuevoProductoAdmin: guardarNuevoProductoAdmin,
        alternarVisibilidadClave: alternarVisibilidadClave
    };
})();
