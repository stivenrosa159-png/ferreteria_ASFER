/**
 * ============================================================================
 * FERRETERIA ASFER - MODULO DE PASARELA DE PAGOS FUNCIONAL (PROYECTO ESCOLAR)
 * Constanza, Republica Dominicana
 * Checkout interactivo para Tarjetas (Visa/Mastercard), Banreservas,
 * PayPal y Efectivo en mostrador.
 * Sin bajones de rendimiento, diseno limpio, sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    let metodoSeleccionado = 'tarjeta'; // 'tarjeta', 'banreservas', 'paypal', 'efectivo'
    let subtotalActual = 0;
    let itbisActual = 0;
    let totalActual = 0;
    let itemsCheckout = [];
    let pedidoProcesado = null;

    /**
     * Abre el modal de la pasarela de pagos
     * @param {string} metodo 'tarjeta', 'banreservas', 'paypal', 'efectivo'
     */
    function abrirCheckout(metodo = 'tarjeta') {
        // Cerrar carrito si estaba abierto
        if (window.CarritoASFER && typeof window.CarritoASFER.cerrarCarrito === 'function') {
            window.CarritoASFER.cerrarCarrito();
        }

        const modal = document.getElementById('modalPasarelaPago');
        const fondo = document.getElementById('fondoOscuroPago');
        const pantallaForm = document.getElementById('checkoutCuerpo');
        const pantallaRecibo = document.getElementById('pantallaReciboExito');
        const overlayProc = document.getElementById('overlayProcesandoPago');

        if (!modal || !fondo) return;

        // Resetear vistas internas
        if (pantallaForm) pantallaForm.style.display = 'grid';
        if (pantallaRecibo) {
            pantallaRecibo.classList.remove('activo');
            pantallaRecibo.style.display = 'none';
        }
        if (overlayProc) overlayProc.classList.remove('activo');

        // Cargar articulos a pagar
        cargarArticulosParaPago();

        // Seleccionar metodo solicitado
        cambiarMetodo(metodo);

        // Prellenar datos de cliente si hay sesion iniciada o datos en el carrito
        prellenarDatosCliente();

        // Mostrar modal
        fondo.classList.add('mostrar');
        modal.classList.add('abierto');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el modal de la pasarela de pagos
     */
    function cerrarCheckout() {
        const modal = document.getElementById('modalPasarelaPago');
        const fondo = document.getElementById('fondoOscuroPago');
        if (modal) modal.classList.remove('abierto');
        if (fondo) fondo.classList.remove('mostrar');
        document.body.style.overflow = '';
    }

    /**
     * Carga los articulos del carrito para el checkout
     */
    function cargarArticulosParaPago() {
        const itemsCarrito = (window.CarritoASFER && typeof window.CarritoASFER.obtenerItems === 'function')
            ? window.CarritoASFER.obtenerItems()
            : [];

        const catalogo = window.DatosASFER.obtenerProductos();
        itemsCheckout = [];

        itemsCarrito.forEach(function (it) {
            const prod = catalogo.find(p => p.id === it.id);
            if (prod) {
                itemsCheckout.push({
                    id: prod.id,
                    nombre: prod.nombre,
                    precio: prod.precio,
                    cantidad: it.cantidad
                });
            }
        });

        actualizarResumenCheckout();
    }

    /**
     * Si el usuario no tiene articulos en el carrito, carga una orden de muestra escolar
     */
    function cargarOrdenMuestraEscolar() {
        itemsCheckout = [
            { id: 1, nombre: 'Martillo de uña 16 oz profesional', precio: 450, cantidad: 1 },
            { id: 4, nombre: 'Juego de destornilladores x6 piezas', precio: 650, cantidad: 1 },
            { id: 8, nombre: 'Bombillo LED 12W luz blanca', precio: 150, cantidad: 2 }
        ];
        actualizarResumenCheckout();
        if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
            window.AppASFER.mostrarToast('Pedido de muestra escolar cargado exitosamente.', 'exito');
        }
    }

    /**
     * Actualiza el desglose de totales y la lista lateral de articulos
     */
    function actualizarResumenCheckout() {
        const listaContenedor = document.getElementById('listaItemsCheckout');
        const elemSubtotal = document.getElementById('checkoutSubtotal');
        const elemItbis = document.getElementById('checkoutItbis');
        const elemTotal = document.getElementById('checkoutTotal');
        const btnPagar = document.getElementById('btnConfirmarPagoTexto');

        if (!listaContenedor) return;

        if (itemsCheckout.length === 0) {
            listaContenedor.innerHTML = `
                <div style="text-align:center; padding:16px 8px; color:var(--texto-secundario); font-size:12.5px;">
                    <p>No tiene artículos agregados en su pedido.</p>
                    <button type="button" class="btn-demo-datos" style="margin-top:10px;" onclick="window.PagosASFER.cargarOrdenMuestraEscolar()">
                        Cargar orden de muestra escolar (RD$1,400)
                    </button>
                </div>
            `;
            subtotalActual = 0;
            itbisActual = 0;
            totalActual = 0;
        } else {
            listaContenedor.innerHTML = '';
            let suma = 0;

            itemsCheckout.forEach(function (item) {
                const sub = item.precio * item.cantidad;
                suma += sub;

                const fila = document.createElement('div');
                fila.className = 'item-checkout-fila';
                fila.innerHTML = `
                    <span title="${window.SeguridadASFER.sanitizarTexto(item.nombre)}">${window.SeguridadASFER.sanitizarTexto(item.nombre)} x${item.cantidad}</span>
                    <strong>RD$${sub.toLocaleString('es-DO')}</strong>
                `;
                listaContenedor.appendChild(fila);
            });

            subtotalActual = suma;
            // ITBIS 18% representativo transparente
            itbisActual = Math.round(subtotalActual * 0.18);
            totalActual = subtotalActual + itbisActual;
        }

        if (elemSubtotal) elemSubtotal.textContent = 'RD$' + subtotalActual.toLocaleString('es-DO');
        if (elemItbis) elemItbis.textContent = 'RD$' + itbisActual.toLocaleString('es-DO');
        if (elemTotal) elemTotal.textContent = 'RD$' + totalActual.toLocaleString('es-DO');
        if (btnPagar) btnPagar.textContent = totalActual > 0 ? 'Pagar RD$' + totalActual.toLocaleString('es-DO') : 'Procesar Pago';
    }

    /**
     * Alterna la vista entre los metodos de pago disponibles
     * @param {string} metodo 'tarjeta', 'banreservas', 'paypal', 'efectivo'
     */
    function cambiarMetodo(metodo) {
        metodoSeleccionado = metodo;

        // Actualizar estado activo de las pestanas
        const botones = document.querySelectorAll('.btn-metodo-pago');
        botones.forEach(btn => {
            btn.classList.toggle('activo', btn.getAttribute('data-metodo') === metodo);
        });

        // Ocultar todos los bloques de formulario
        const vistaTarjeta = document.getElementById('vistaPagoTarjeta');
        const vistaBanreservas = document.getElementById('vistaPagoBanreservas');
        const vistaPaypal = document.getElementById('vistaPagoPaypal');
        const vistaEfectivo = document.getElementById('vistaPagoEfectivo');

        if (vistaTarjeta) vistaTarjeta.style.display = 'none';
        if (vistaBanreservas) vistaBanreservas.style.display = 'none';
        if (vistaPaypal) vistaPaypal.style.display = 'none';
        if (vistaEfectivo) vistaEfectivo.style.display = 'none';

        if (metodo === 'tarjeta' && vistaTarjeta) {
            vistaTarjeta.style.display = 'block';
        } else if (metodo === 'banreservas' && vistaBanreservas) {
            vistaBanreservas.style.display = 'block';
        } else if (metodo === 'paypal' && vistaPaypal) {
            vistaPaypal.style.display = 'block';
        } else if (metodo === 'efectivo' && vistaEfectivo) {
            vistaEfectivo.style.display = 'block';
        }
    }

    /**
     * Prellena datos de cliente si hay sesion activa o campos previos
     */
    function prellenarDatosCliente() {
        const sesion = window.SeguridadASFER ? window.SeguridadASFER.obtenerSesionActual() : null;
        const inputNombre = document.getElementById('checkoutNombreCliente');
        const inputCorreo = document.getElementById('checkoutCorreoCliente');
        const inputTel = document.getElementById('checkoutTelefonoCliente');

        if (sesion) {
            if (inputNombre && !inputNombre.value) inputNombre.value = sesion.nombre || '';
            if (inputCorreo && !inputCorreo.value) inputCorreo.value = sesion.correo || '';
        }

        // Si ya habia escrito datos en el panel del carrito
        const nombreCarrito = document.getElementById('nombreCliente')?.value;
        const telCarrito = document.getElementById('telefonoCliente')?.value;
        if (nombreCarrito && inputNombre && !inputNombre.value) inputNombre.value = nombreCarrito;
        if (telCarrito && inputTel && !inputTel.value) inputTel.value = telCarrito;
    }

    /**
     * Formatea el numero de tarjeta mientras el usuario teclea
     * y actualiza el display de la tarjeta virtual
     */
    function formatearNumeroTarjeta(input) {
        let val = input.value.replace(/\D/g, '').substring(0, 16);
        let formateado = val.match(/.{1,4}/g)?.join(' ') || val;
        input.value = formateado;

        // Detectar si es Visa o Mastercard
        const logoDisplay = document.getElementById('tarjetaMarcaLogo');
        const numeroDisplay = document.getElementById('tarjetaNumeroDisplay');

        if (val.startsWith('4')) {
            if (logoDisplay) logoDisplay.textContent = 'VISA';
        } else if (val.startsWith('5') || val.startsWith('2')) {
            if (logoDisplay) logoDisplay.textContent = 'MASTERCARD';
        } else {
            if (logoDisplay) logoDisplay.textContent = 'TARJETA';
        }

        if (numeroDisplay) {
            numeroDisplay.textContent = formateado ? formateado : '•••• •••• •••• ••••';
        }
    }

    /**
     * Actualiza el titular de la tarjeta virtual
     */
    function actualizarTitularTarjeta(input) {
        const titularDisplay = document.getElementById('tarjetaTitularDisplay');
        if (titularDisplay) {
            titularDisplay.textContent = input.value ? input.value.toUpperCase() : 'NOMBRE DEL TITULAR';
        }
    }

    /**
     * Formatea y actualiza la fecha de vencimiento (MM/AA)
     */
    function formatearExpTarjeta(input) {
        let val = input.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        input.value = val;

        const expDisplay = document.getElementById('tarjetaExpDisplay');
        if (expDisplay) {
            expDisplay.textContent = val ? val : 'MM/AA';
        }
    }

    /**
     * Llena datos de prueba escolar instantaneos para demostracion
     */
    function llenarDatosPruebaEscolar() {
        const inputNumero = document.getElementById('numeroTarjetaInput');
        const inputTitular = document.getElementById('titularTarjetaInput');
        const inputExp = document.getElementById('expTarjetaInput');
        const inputCvv = document.getElementById('cvvTarjetaInput');
        const inputNombre = document.getElementById('checkoutNombreCliente');
        const inputCorreo = document.getElementById('checkoutCorreoCliente');
        const inputTel = document.getElementById('checkoutTelefonoCliente');

        if (inputNumero) {
            inputNumero.value = '4532 8819 0421 9832';
            formatearNumeroTarjeta(inputNumero);
        }
        if (inputTitular) {
            inputTitular.value = 'Roberto Fernández';
            actualizarTitularTarjeta(inputTitular);
        }
        if (inputExp) {
            inputExp.value = '11/28';
            formatearExpTarjeta(inputExp);
        }
        if (inputCvv) {
            inputCvv.value = '742';
        }
        if (inputNombre && !inputNombre.value) {
            inputNombre.value = 'Ing. Roberto Fernández';
        }
        if (inputCorreo && !inputCorreo.value) {
            inputCorreo.value = 'r.fernandez@ejemplo.edu.do';
        }
        if (inputTel && !inputTel.value) {
            inputTel.value = '(809) 539-2104';
        }

        if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
            window.AppASFER.mostrarToast('Datos de prueba escolar autocompletados.', 'exito');
        }
    }

    /**
     * Copia al portapapeles el numero de cuenta de Banreservas
     */
    function copiarCuentaBanreservas() {
        const cuenta = '960-128472-3';
        navigator.clipboard.writeText(cuenta).then(function () {
            if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
                window.AppASFER.mostrarToast('No. de cuenta Banreservas copiado: ' + cuenta, 'exito');
            }
        }).catch(function () {
            if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
                window.AppASFER.mostrarToast('No. de cuenta: ' + cuenta, 'exito');
            }
        });
    }

    /**
     * Calcula la devuelta o cambio si paga en efectivo
     */
    function calcularCambioEfectivo(input) {
        const monto = parseFloat(input.value) || 0;
        const textoCambio = document.getElementById('textoCambioEfectivo');
        if (!textoCambio) return;

        if (monto >= totalActual && totalActual > 0) {
            const devuelta = monto - totalActual;
            textoCambio.textContent = 'Cambio estimado a recibir en caja: RD$' + devuelta.toLocaleString('es-DO');
            textoCambio.style.color = 'var(--verde-exito)';
        } else if (monto > 0) {
            textoCambio.textContent = 'El monto es menor al total de la orden.';
            textoCambio.style.color = 'var(--ambar-alerta)';
        } else {
            textoCambio.textContent = 'Ingrese el valor del billete a entregar.';
            textoCambio.style.color = 'var(--texto-secundario)';
        }
    }

    /**
     * Procesa la simulacion del pago bancario
     */
    function procesarPago(event) {
        if (event) event.preventDefault();

        if (itemsCheckout.length === 0) {
            if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
                window.AppASFER.mostrarToast('Debe tener al menos un artículo para procesar el pago.', 'alerta');
            }
            return;
        }

        const inputNombre = document.getElementById('checkoutNombreCliente');
        const inputCorreo = document.getElementById('checkoutCorreoCliente');
        const inputTel = document.getElementById('checkoutTelefonoCliente');

        const nombreCliente = inputNombre ? inputNombre.value.trim() : 'Cliente ASFER';
        const correoCliente = inputCorreo ? inputCorreo.value.trim() : 'cliente@asfer.com.do';
        const telefonoCliente = inputTel ? inputTel.value.trim() : '(809) 539-2104';

        if (!nombreCliente) {
            if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
                window.AppASFER.mostrarToast('Por favor ingrese su nombre para el comprobante.', 'alerta');
            }
            if (inputNombre) inputNombre.focus();
            return;
        }

        // Mostrar pantalla de carga bancaria
        const overlayProc = document.getElementById('overlayProcesandoPago');
        if (overlayProc) overlayProc.classList.add('activo');

        // Simulacion de handshake bancario con retardo realista de 1.2s
        setTimeout(function () {
            if (overlayProc) overlayProc.classList.remove('activo');

            // Generar identificadores de transaccion
            const randomId = Math.floor(1000 + Math.random() * 9000);
            const idOrden = 'ORD-' + randomId;
            const codigoAuth = 'AUTH-ASFER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const fechaAhora = new Date();

            let detalleMetodo = '';
            if (metodoSeleccionado === 'tarjeta') {
                const numVal = document.getElementById('numeroTarjetaInput')?.value || '4532';
                const ultimos4 = numVal.replace(/\s/g, '').slice(-4) || '8821';
                detalleMetodo = 'Tarjeta de Crédito/Débito (•••• ' + ultimos4 + ')';
            } else if (metodoSeleccionado === 'banreservas') {
                const ref = document.getElementById('referenciaBanreservasInput')?.value || 'DEP-78129';
                detalleMetodo = 'Transferencia Banreservas (Ref: ' + ref + ')';
            } else if (metodoSeleccionado === 'paypal') {
                detalleMetodo = 'PayPal Express Checkout (Cuenta Verificada)';
            } else {
                detalleMetodo = 'Efectivo en Mostrador (Caja Registradora Constanza)';
            }

            // Crear objeto de pedido
            pedidoProcesado = {
                id: idOrden,
                authCode: codigoAuth,
                clienteNombre: nombreCliente,
                clienteCorreo: correoCliente,
                clienteTelefono: telefonoCliente,
                fecha: fechaAhora.toISOString(),
                fechaFormato: fechaAhora.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                items: [...itemsCheckout],
                subtotal: subtotalActual,
                itbis: itbisActual,
                total: totalActual,
                estado: 'pagado',
                metodoPago: detalleMetodo
            };

            // Guardar en la base de datos de pedidos local
            const pedidos = window.DatosASFER.obtenerPedidos();
            pedidos.unshift(pedidoProcesado);
            window.DatosASFER.guardarPedidos(pedidos);

            // Registrar en auditoria de seguridad
            window.SeguridadASFER.registrarLogAuditoria(
                'PAGO_APROBADO',
                `Pago escolar aprobado para orden ${idOrden} por RD$${totalActual.toLocaleString('es-DO')} vía ${detalleMetodo}`
            );

            // Vaciar el carrito ya que la orden fue pagada
            if (window.CarritoASFER && typeof window.CarritoASFER.vaciarCarrito === 'function') {
                window.CarritoASFER.vaciarCarrito();
            }

            // Mostrar el recibo formal de pago
            renderizarReciboExitoso();

            if (window.AppASFER && typeof window.AppASFER.mostrarToast === 'function') {
                window.AppASFER.mostrarToast('¡Pago procesado con éxito! Recibo digital generado.', 'exito');
            }
        }, 1200);
    }

    /**
     * Renderiza el recibo formal digital oficial de ASFER
     */
    function renderizarReciboExitoso() {
        const pantallaForm = document.getElementById('checkoutCuerpo');
        const pantallaRecibo = document.getElementById('pantallaReciboExito');
        if (!pantallaRecibo || !pedidoProcesado) return;

        if (pantallaForm) pantallaForm.style.display = 'none';
        pantallaRecibo.style.display = 'flex';
        pantallaRecibo.classList.add('activo');

        let itemsHtml = '';
        pedidoProcesado.items.forEach(function (it) {
            const sub = it.precio * it.cantidad;
            itemsHtml += `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>${window.SeguridadASFER.sanitizarTexto(it.nombre)} x${it.cantidad}</span>
                    <span>RD$${sub.toLocaleString('es-DO')}</span>
                </div>
            `;
        });

        pantallaRecibo.innerHTML = `
            <div class="icono-exito-animado">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style="font-size:22px; font-weight:800; color:var(--texto-primario); margin-bottom:4px;">
                ¡Transacción Aprobada Exitosamente!
            </h3>
            <p style="font-size:13.5px; color:var(--texto-secundario); max-width:440px;">
                Su pago ha sido procesado mediante la pasarela escolar segura de Ferretería ASFER. Su pedido se encuentra en preparación para despacho.
            </p>

            <div class="ticket-digital" id="areaTicketDigital">
                <div class="ticket-header">
                    <div>
                        <strong style="font-size:15px; color:var(--rojo-marca);">FERRETERÍA ASFER, S.R.L.</strong>
                        <div style="font-size:11.5px; color:var(--texto-atenuado);">RNC: 1-31-98765-4 | Constanza, R.D.</div>
                    </div>
                    <span class="badge-estado pagado" style="font-size:11px;">PAGADO</span>
                </div>

                <div class="ticket-linea">
                    <span>Número de Orden:</span>
                    <strong>${pedidoProcesado.id}</strong>
                </div>
                <div class="ticket-linea">
                    <span>Código de Autorización:</span>
                    <strong style="font-family:monospace;">${pedidoProcesado.authCode}</strong>
                </div>
                <div class="ticket-linea">
                    <span>Fecha y Hora:</span>
                    <span>${pedidoProcesado.fechaFormato}</span>
                </div>
                <div class="ticket-linea">
                    <span>Cliente:</span>
                    <strong>${window.SeguridadASFER.sanitizarTexto(pedidoProcesado.clienteNombre)}</strong>
                </div>
                <div class="ticket-linea">
                    <span>Método de Pago:</span>
                    <span>${window.SeguridadASFER.sanitizarTexto(pedidoProcesado.metodoPago)}</span>
                </div>

                <div class="ticket-tabla-items">
                    <strong style="font-size:12px; margin-bottom:4px; color:var(--texto-primario);">Artículos Facturados:</strong>
                    ${itemsHtml}
                </div>

                <div class="ticket-linea">
                    <span>Subtotal:</span>
                    <span>RD$${pedidoProcesado.subtotal.toLocaleString('es-DO')}</span>
                </div>
                <div class="ticket-linea">
                    <span>ITBIS (18%):</span>
                    <span>RD$${pedidoProcesado.itbis.toLocaleString('es-DO')}</span>
                </div>
                <div class="ticket-linea" style="font-size:16px; border-top:1px dashed var(--borde-medio); padding-top:8px;">
                    <strong>Total Pagado:</strong>
                    <strong style="color:var(--rojo-marca);">RD$${pedidoProcesado.total.toLocaleString('es-DO')}</strong>
                </div>
            </div>

            <div class="acciones-recibo">
                <button type="button" class="btn btn-rojo" onclick="window.PagosASFER.imprimirRecibo()">
                    <svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    <span>Imprimir / Guardar Recibo PDF</span>
                </button>
                <button type="button" class="btn btn-negro" onclick="window.PagosASFER.enviarComprobanteWhatsApp()">
                    <svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>Enviar a WhatsApp ASFER</span>
                </button>
                <button type="button" class="btn btn-borde" onclick="window.PagosASFER.cerrarCheckout()">
                    <span>Finalizar y Volver a la Tienda</span>
                </button>
            </div>
        `;
    }

    /**
     * Imprime o guarda como PDF el recibo
     */
    function imprimirRecibo() {
        window.print();
    }

    /**
     * Comparte el comprobante de pago aprobado al WhatsApp de ASFER
     */
    function enviarComprobanteWhatsApp() {
        if (!pedidoProcesado) return;

        let texto = 'FERRETERIA ASFER - Notificacion de Pago Aprobado%0A%0A';
        texto += 'No. Orden: ' + pedidoProcesado.id + '%0A';
        texto += 'Autorizacion: ' + pedidoProcesado.authCode + '%0A';
        texto += 'Cliente: ' + pedidoProcesado.clienteNombre + '%0A';
        texto += 'Metodo: ' + pedidoProcesado.metodoPago + '%0A';
        texto += 'Total Pagado: RD$' + pedidoProcesado.total.toLocaleString('es-DO') + '%0A%0A';
        texto += 'Favor coordinar despacho o entrega en almacen.';

        const url = 'https://wa.me/' + window.DatosASFER.negocio.whatsapp + '?text=' + texto;
        window.open(url, '_blank');
    }

    // Exportacion publica del modulo de pagos
    window.PagosASFER = {
        abrirCheckout: abrirCheckout,
        cerrarCheckout: cerrarCheckout,
        cambiarMetodo: cambiarMetodo,
        cargarArticulosParaPago: cargarArticulosParaPago,
        cargarOrdenMuestraEscolar: cargarOrdenMuestraEscolar,
        formatearNumeroTarjeta: formatearNumeroTarjeta,
        actualizarTitularTarjeta: actualizarTitularTarjeta,
        formatearExpTarjeta: formatearExpTarjeta,
        llenarDatosPruebaEscolar: llenarDatosPruebaEscolar,
        copiarCuentaBanreservas: copiarCuentaBanreservas,
        calcularCambioEfectivo: calcularCambioEfectivo,
        procesarPago: procesarPago,
        imprimirRecibo: imprimirRecibo,
        enviarComprobanteWhatsApp: enviarComprobanteWhatsApp
    };
})();
