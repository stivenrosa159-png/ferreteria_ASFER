/**
 * ============================================================================
 * FERRETERIA ASFER - MODULO DE RESENAS Y SUGERENCIAS (EL BANCO DEL MAESTRO)
 * Constanza, Republica Dominicana
 * Calificaciones comunitarias con estrellas SVG, validacion y sanitizacion.
 * Sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    let calificacionSeleccionada = 5;

    // Resenas base de referencia
    const RESENAS_PREDETERMINADAS = [
        {
            nombre: 'Don Ramón Ventura',
            oficio: 'Maestro Constructor',
            tipo: 'Reseña',
            estrellas: 5,
            comentario: 'Excelente surtido de materiales en Constanza. El cemento y los tubos siempre están en perfecto estado y el despacho es sumamente rápido.'
        },
        {
            nombre: 'Ing. Carlos Mendoza',
            oficio: 'Instalador Eléctrico',
            tipo: 'Reseña',
            estrellas: 5,
            comentario: 'Tienen variedad de breakers, conductores y cajas eléctricas de buena calidad. Poder enviar la lista previa por WhatsApp ahorra muchísimo tiempo.'
        },
        {
            nombre: 'Elena Jiménez',
            oficio: 'Renovación de Hogar',
            tipo: 'Sugerencia',
            estrellas: 5,
            comentario: 'Muy buena atención del personal en el mostrador. Me asesoraron con la brocha y la pintura adecuada para exteriores húmedos.'
        }
    ];

    /**
     * Genera el HTML de estrellas en SVG segun la cantidad especificada
     * @param {number} cantidad
     * @returns {string}
     */
    function generarEstrellasSVG(cantidad) {
        let svgHtml = '';
        for (let i = 1; i <= 5; i++) {
            const fill = i <= cantidad ? '#F59E0B' : 'var(--borde-fuerte)';
            svgHtml += `
                <svg viewBox="0 0 24 24" style="color: ${fill};">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            `;
        }
        return svgHtml;
    }

    /**
     * Carga y renderiza las resenas en la cuadricula
     */
    function cargarResenas() {
        const contenedor = document.getElementById('cuadriculaResenas');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        let guardadas = [];
        try {
            guardadas = JSON.parse(localStorage.getItem('asfer_resenas_locales')) || [];
        } catch (e) {
            guardadas = [];
        }

        const todas = [...guardadas, ...RESENAS_PREDETERMINADAS];

        todas.forEach(function (r) {
            const inicial = r.nombre ? r.nombre.charAt(0).toUpperCase() : 'M';
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-resena animar-entrada visible';

            tarjeta.innerHTML = `
                <div class="resena-autor-fila">
                    <div class="resena-avatar">${inicial}</div>
                    <div class="resena-datos">
                        <strong>${window.SeguridadASFER.sanitizarTexto(r.nombre)}</strong>
                        <span>${window.SeguridadASFER.sanitizarTexto(r.oficio || 'Cliente de Constanza')}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="resena-estrellas-svg">
                        ${generarEstrellasSVG(r.estrellas)}
                    </div>
                    <span class="resena-tipo-tag">${window.SeguridadASFER.sanitizarTexto(r.tipo)}</span>
                </div>
                <p class="resena-cuerpo">"${window.SeguridadASFER.sanitizarTexto(r.comentario)}"</p>
            `;
            contenedor.appendChild(tarjeta);
        });
    }

    /**
     * Abre el modal de nueva resena
     */
    function abrirModalResena() {
        const modal = document.getElementById('modalResena');
        const fondo = document.getElementById('fondoOscuroResena');
        if (modal) modal.classList.add('abierto');
        if (fondo) fondo.classList.add('mostrar');
    }

    /**
     * Cierra el modal de nueva resena
     */
    function cerrarModalResena() {
        const modal = document.getElementById('modalResena');
        const fondo = document.getElementById('fondoOscuroResena');
        if (modal) modal.classList.remove('abierto');
        if (fondo) fondo.classList.remove('mostrar');
    }

    /**
     * Inicializa el selector interactivo de estrellas SVG
     */
    function inicializarSelectorEstrellas() {
        const estrellas = document.querySelectorAll('#selectorEstrellasSVG svg');
        estrellas.forEach(function (estrella) {
            estrella.addEventListener('click', function () {
                calificacionSeleccionada = parseInt(this.getAttribute('data-val'), 10);
                estrellas.forEach(function (s) {
                    const val = parseInt(s.getAttribute('data-val'), 10);
                    s.classList.toggle('activa', val <= calificacionSeleccionada);
                });
            });
        });
    }

    /**
     * Procesa y valida el formulario de envio de nueva resena
     */
    function procesarNuevaResena(evento) {
        evento.preventDefault();

        const tipo = document.getElementById('tipoAporte')?.value || 'Reseña';
        const nombre = document.getElementById('nombreResena')?.value || '';
        const oficio = document.getElementById('oficioResena')?.value || '';
        const comentario = document.getElementById('comentarioResena')?.value || '';

        if (!nombre.trim() || !comentario.trim()) {
            window.AppASFER.mostrarToast('Por favor complete su nombre y el comentario.', 'alerta');
            return false;
        }

        const nueva = {
            nombre: window.SeguridadASFER.sanitizarTexto(nombre),
            oficio: window.SeguridadASFER.sanitizarTexto(oficio),
            tipo: window.SeguridadASFER.sanitizarTexto(tipo),
            estrellas: calificacionSeleccionada,
            comentario: window.SeguridadASFER.sanitizarTexto(comentario)
        };

        let guardadas = [];
        try {
            guardadas = JSON.parse(localStorage.getItem('asfer_resenas_locales')) || [];
        } catch (e) {
            guardadas = [];
        }

        guardadas.unshift(nueva);
        localStorage.setItem('asfer_resenas_locales', JSON.stringify(guardadas));

        document.getElementById('formNuevaResena')?.reset();
        cerrarModalResena();
        cargarResenas();
        window.AppASFER.mostrarToast('Muchas gracias. Su opinión fue publicada en El Banco del Maestro.', 'exito');
        return false;
    }

    // Exportacion del modulo de resenas
    window.ResenasASFER = {
        cargarResenas: cargarResenas,
        abrirModalResena: abrirModalResena,
        cerrarModalResena: cerrarModalResena,
        inicializarSelectorEstrellas: inicializarSelectorEstrellas,
        procesarNuevaResena: procesarNuevaResena
    };
})();
