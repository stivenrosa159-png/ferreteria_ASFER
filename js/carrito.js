/**
 * ============================================================================
 * FERRETERIA ASFER - MODULO DE CARRITO Y PEDIDO POR WHATSAPP
 * Constanza, Republica Dominicana
 * Gestion de cantidades, persistencia local, calculo de totales,
 * guardado en panel de pedidos y exportacion a WhatsApp.
 * Sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    let listaCarrito = [];

    // Cargar carrito guardado si existe
    try {
        listaCarrito = JSON.parse(localStorage.getItem('asfer_carrito_items')) || [];
    } catch (e) {
        listaCarrito = [];
    }

    /**
     * Guarda el carrito actual en localStorage
     */
    function guardarEnStorage() {
        localStorage.setItem('asfer_carrito_items', JSON.stringify(listaCarrito));
    }

    /**
     * Agrega un producto al carrito
     * @param {number} idProducto
     */
    function agregarProducto(idProducto) {
        const itemExistente = listaCarrito.find(i => i.id === idProducto);
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            listaCarrito.push({ id: idProducto, cantidad: 1 });
        }
        guardarEnStorage();
        actualizarInterfazCarrito();
        abrirCarrito();
        window.AppASFER.mostrarToast('Producto agregado a su lista de pedido.', 'exito');
    }

    /**
     * Modifica la cantidad de un producto
     * @param {number} idProducto
     * @param {number} delta
     */
    function modificarCantidad(idProducto, delta) {
        const item = listaCarrito.find(i => i.id === idProducto);
        if (!item) return;

        item.cantidad += delta;
        if (item.cantidad <= 0) {
            eliminarProducto(idProducto);
            return;
        }
        guardarEnStorage();
        actualizarInterfazCarrito();
    }

    /**
     * Elimina un producto del carrito
     * @param {number} idProducto
     */
    function eliminarProducto(idProducto) {
        listaCarrito = listaCarrito.filter(i => i.id !== idProducto);
        guardarEnStorage();
        actualizarInterfazCarrito();
    }

    /**
     * Calcula el monto total estimado del carrito
     * @returns {number}
     */
    function calcularTotal() {
        const catalogo = window.DatosASFER.obtenerProductos();
        return listaCarrito.reduce(function (total, item) {
            const prod = catalogo.find(p => p.id === item.id);
            return total + (prod ? prod.precio * item.cantidad : 0);
        }, 0);
    }

    /**
     * Actualiza la interfaz del carrito y el contador del encabezado
     */
    function actualizarInterfazCarrito() {
        const contenedorLista = document.getElementById('listaCarrito');
        const badgeContador = document.getElementById('contadorCarrito');
        const elementoTotal = document.getElementById('totalCarrito');

        const totalArticulos = listaCarrito.reduce((suma, i) => suma + i.cantidad, 0);
        if (badgeContador) badgeContador.textContent = totalArticulos;

        if (!contenedorLista) return;

        if (listaCarrito.length === 0) {
            contenedorLista.innerHTML = `
                <div class="carrito-vacio-mensaje">
                    <p>Su lista de pedido está vacía.</p>
                    <p style="font-size:13px; margin-top:8px;">Explore el catálogo y agregue herramientas o materiales.</p>
                </div>
            `;
        } else {
            contenedorLista.innerHTML = '';
            const catalogo = window.DatosASFER.obtenerProductos();

            listaCarrito.forEach(function (item) {
                const prod = catalogo.find(p => p.id === item.id);
                if (!prod) return;

                const fila = document.createElement('div');
                fila.className = 'item-carrito';
                fila.innerHTML = `
                    <div style="flex-grow:1; padding-right:8px;">
                        <div class="item-info-nombre">${window.SeguridadASFER.sanitizarTexto(prod.nombre)}</div>
                        <div class="item-info-precio">RD$${prod.precio.toLocaleString('es-DO')} c/u</div>
                    </div>
                    <div class="item-controles">
                        <button class="boton-cantidad" type="button" onclick="window.CarritoASFER.modificarCantidad(${prod.id}, -1)">-</button>
                        <span style="font-weight:700; min-width:22px; text-align:center;">${item.cantidad}</span>
                        <button class="boton-cantidad" type="button" onclick="window.CarritoASFER.modificarCantidad(${prod.id}, 1)">+</button>
                        <button class="boton-eliminar-item" type="button" onclick="window.CarritoASFER.eliminarProducto(${prod.id})" title="Eliminar artículo">
                            <svg viewBox="0 0 24 24" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
                contenedorLista.appendChild(fila);
            });
        }

        if (elementoTotal) {
            elementoTotal.textContent = 'RD$' + calcularTotal().toLocaleString('es-DO');
        }
    }

    /**
     * Abre el panel lateral del carrito
     */
    function abrirCarrito() {
        const panel = document.getElementById('panelCarrito');
        const fondo = document.getElementById('fondoOscuro');
        if (panel) panel.classList.add('abierto');
        if (fondo) fondo.classList.add('mostrar');
    }

    /**
     * Cierra el panel lateral del carrito
     */
    function cerrarCarrito() {
        const panel = document.getElementById('panelCarrito');
        const fondo = document.getElementById('fondoOscuro');
        if (panel) panel.classList.remove('abierto');
        if (fondo) fondo.classList.remove('mostrar');
    }

    /**
     * Envia el pedido preparado por WhatsApp y lo registra en el sistema de pedidos
     */
    function enviarPedidoPorWhatsApp() {
        if (listaCarrito.length === 0) {
            window.AppASFER.mostrarToast('Su pedido está vacío. Agregue artículos antes de enviar.', 'alerta');
            return;
        }

        const nombreCliente = window.SeguridadASFER.sanitizarTexto(document.getElementById('nombreCliente')?.value || '');
        const telefonoCliente = window.SeguridadASFER.sanitizarTexto(document.getElementById('telefonoCliente')?.value || '');
        const notaCliente = window.SeguridadASFER.sanitizarTexto(document.getElementById('notaCliente')?.value || '');

        const catalogo = window.DatosASFER.obtenerProductos();
        const itemsPedido = [];

        let textoWhatsApp = 'FERRETERIA ASFER - Solicitud de Cotizacion y Pedido%0A%0A';
        textoWhatsApp += 'Detalle de articulos requeridos:%0A';

        listaCarrito.forEach(function (item) {
            const prod = catalogo.find(p => p.id === item.id);
            if (prod) {
                const subtotal = prod.precio * item.cantidad;
                itemsPedido.push({
                    nombre: prod.nombre,
                    cantidad: item.cantidad,
                    precio: prod.precio
                });
                textoWhatsApp += '- ' + prod.nombre + ' x' + item.cantidad + ' (RD$' + subtotal.toLocaleString('es-DO') + ')%0A';
            }
        });

        const totalFinal = calcularTotal();
        textoWhatsApp += '%0ATotal Estimado: RD$' + totalFinal.toLocaleString('es-DO') + '%0A';

        if (nombreCliente) textoWhatsApp += 'Cliente: ' + nombreCliente + '%0A';
        if (telefonoCliente) textoWhatsApp += 'Telefono: ' + telefonoCliente + '%0A';
        if (notaCliente) textoWhatsApp += 'Nota adicional: ' + notaCliente + '%0A';

        textoWhatsApp += '%0APor favor confirmar disponibilidad en almacen y tiempo de despacho.';

        // Registrar nuevo pedido en la base local para que Empleados y Admin puedan gestionarlo
        const pedidos = window.DatosASFER.obtenerPedidos();
        const nuevoId = 'ORD-' + (pedidos.length + 1001);
        pedidos.unshift({
            id: nuevoId,
            clienteNombre: nombreCliente || 'Cliente General',
            clienteTelefono: telefonoCliente || 'N/A',
            fecha: new Date().toISOString(),
            items: itemsPedido,
            total: totalFinal,
            estado: 'pendiente',
            nota: notaCliente
        });
        window.DatosASFER.guardarPedidos(pedidos);
        window.SeguridadASFER.registrarLogAuditoria('PEDIDO_CREADO', 'Pedido ' + nuevoId + ' registrado por valor RD$' + totalFinal);

        // Abrir ventana de WhatsApp con el mensaje estructurado sin emojis
        const urlWhatsApp = 'https://wa.me/' + window.DatosASFER.negocio.whatsapp + '?text=' + textoWhatsApp;
        window.open(urlWhatsApp, '_blank');
        cerrarCarrito();
    }

    // Exportacion del modulo de carrito
    window.CarritoASFER = {
        agregarProducto: agregarProducto,
        modificarCantidad: modificarCantidad,
        eliminarProducto: eliminarProducto,
        calcularTotal: calcularTotal,
        actualizarInterfazCarrito: actualizarInterfazCarrito,
        abrirCarrito: abrirCarrito,
        cerrarCarrito: cerrarCarrito,
        enviarPedidoPorWhatsApp: enviarPedidoPorWhatsApp
    };
})();
