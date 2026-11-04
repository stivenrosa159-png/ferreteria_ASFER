/**
 * ============================================================================
 * FERRETERIA ASFER - MODULO DE SEGURIDAD Y CONTROL DE ACCESO (RBAC)
 * Constanza, Republica Dominicana
 * Criptografia con Web Crypto API (SHA-256), gestion de sesiones,
 * proteccion contra fuerza bruta (Rate Limiting), sanitizacion XSS y niveles de rol.
 * Sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    // Sal criptografica para hashing seguro en cliente
    const SALT_SEGURIDAD = 'ASFER_CONSTANZA_SECURE_SALT_2026';

    // Configuracion de proteccion contra fuerza bruta
    const MAX_INTENTOS_FALLIDOS = 5;
    const TIEMPO_BLOQUEO_MINUTOS = 3;

    /**
     * Sanitiza cadenas de texto para prevenir ataques de inyeccion XSS
     * @param {string} texto
     * @returns {string} texto sanitizado y seguro
     */
    function sanitizarTexto(texto) {
        if (typeof texto !== 'string') return '';
        const mapaEntidades = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return texto.replace(/[&<>"'/]/g, function (caracter) {
            return mapaEntidades[caracter];
        }).trim();
    }

    /**
     * Calcula el hash SHA-256 de una contrasena con sal utilizando Web Crypto API
     * @param {string} contrasena
     * @returns {Promise<string>} Hash hexadecimal
     */
    async function calcularHashContrasena(contrasena) {
        const textoConSal = SALT_SEGURIDAD + contrasena;
        const codificador = new TextEncoder();
        const datos = codificador.encode(textoConSal);
        const bufferHash = await crypto.subtle.digest('SHA-256', datos);
        const arregloBytes = Array.from(new Uint8Array(bufferHash));
        return arregloBytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Genera un token de sesion criptograficamente seguro
     * @returns {string} Token aleatorio
     */
    function generarTokenSesion() {
        const bytes = new Uint8Array(24);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Evalua la fortaleza de una contrasena y retorna una puntuacion del 0 al 4
     * @param {string} contrasena
     * @returns {{puntos: number, mensaje: string, valida: boolean}}
     */
    function evaluarFortalezaContrasena(contrasena) {
        let puntos = 0;
        if (!contrasena) return { puntos: 0, mensaje: 'Vacia', valida: false };

        if (contrasena.length >= 8) puntos += 1;
        if (/[A-Z]/.test(contrasena)) puntos += 1;
        if (/[0-9]/.test(contrasena)) puntos += 1;
        if (/[^A-Za-z0-9]/.test(contrasena)) puntos += 1;

        const mensajes = ['Muy debil', 'Debil', 'Aceptable', 'Fuerte', 'Excelente'];
        return {
            puntos: puntos,
            mensaje: mensajes[puntos],
            valida: contrasena.length >= 8 && puntos >= 3
        };
    }

    /**
     * Verifica si una direccion IP/cuenta esta bloqueada por intentos fallidos
     * @returns {{bloqueado: boolean, segundosRestantes: number}}
     */
    function verificarEstadoBloqueo() {
        const bloqueoJson = localStorage.getItem('asfer_bloqueo_seguridad');
        if (!bloqueoJson) return { bloqueado: false, segundosRestantes: 0 };

        try {
            const bloqueo = JSON.parse(bloqueoJson);
            const ahora = Date.now();
            if (bloqueo.expiraEn > ahora) {
                const segundos = Math.ceil((bloqueo.expiraEn - ahora) / 1000);
                return { bloqueado: true, segundosRestantes: segundos };
            } else {
                localStorage.removeItem('asfer_bloqueo_seguridad');
                localStorage.removeItem('asfer_intentos_fallidos');
                return { bloqueado: false, segundosRestantes: 0 };
            }
        } catch (e) {
            localStorage.removeItem('asfer_bloqueo_seguridad');
            return { bloqueado: false, segundosRestantes: 0 };
        }
    }

    /**
     * Registra un intento de acceso fallido y aplica bloqueo si supera el limite
     * @returns {{intentosRestantes: number, bloqueado: boolean}}
     */
    function registrarIntentoFallido() {
        let intentos = parseInt(localStorage.getItem('asfer_intentos_fallidos') || '0', 10) + 1;
        localStorage.setItem('asfer_intentos_fallidos', intentos.toString());

        if (intentos >= MAX_INTENTOS_FALLIDOS) {
            const expiraEn = Date.now() + (TIEMPO_BLOQUEO_MINUTOS * 60 * 1000);
            localStorage.setItem('asfer_bloqueo_seguridad', JSON.stringify({
                expiraEn: expiraEn,
                intentos: intentos
            }));
            registrarLogAuditoria('BLOQUEO_FUERZA_BRUTA', 'Bloqueo temporal por intentos fallidos excedidos');
            return { intentosRestantes: 0, bloqueado: true };
        }

        return {
            intentosRestantes: MAX_INTENTOS_FALLIDOS - intentos,
            bloqueado: false
        };
    }

    /**
     * Limpia el contador de intentos fallidos al tener exito
     */
    function limpiarIntentosFallidos() {
        localStorage.removeItem('asfer_intentos_fallidos');
        localStorage.removeItem('asfer_bloqueo_seguridad');
    }

    /**
     * Guarda un evento de auditoria en el registro local
     * @param {string} accion
     * @param {string} detalle
     */
    function registrarLogAuditoria(accion, detalle) {
        let logs = [];
        try {
            logs = JSON.parse(localStorage.getItem('asfer_logs_auditoria') || '[]');
        } catch (e) {
            logs = [];
        }

        logs.unshift({
            fecha: new Date().toISOString(),
            accion: sanitizarTexto(accion),
            detalle: sanitizarTexto(detalle),
            usuario: obtenerSesionActual() ? obtenerSesionActual().correo : 'Anonimo'
        });

        // Mantener maximo 50 registros de auditoria
        if (logs.length > 50) logs = logs.slice(0, 50);
        localStorage.setItem('asfer_logs_auditoria', JSON.stringify(logs));
    }

    /**
     * Obtiene los logs de auditoria para el panel de Administrador
     */
    function obtenerLogsAuditoria() {
        try {
            return JSON.parse(localStorage.getItem('asfer_logs_auditoria') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * Guarda la sesion activa con caducidad de 2 horas
     * @param {object} usuario
     */
    function guardarSesion(usuario) {
        const DOS_HORAS_MS = 2 * 60 * 60 * 1000;
        const sesion = {
            token: generarTokenSesion(),
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            creadaEn: Date.now(),
            expiraEn: Date.now() + DOS_HORAS_MS
        };
        sessionStorage.setItem('asfer_sesion_activa', JSON.stringify(sesion));
        localStorage.setItem('asfer_sesion_recordatorio', JSON.stringify({
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        }));
        registrarLogAuditoria('INICIO_SESION', 'Inicio de sesion exitoso con rol ' + usuario.rol);
    }

    /**
     * Obtiene y valida la sesion activa actual
     * @returns {object|null}
     */
    function obtenerSesionActual() {
        const sesionJson = sessionStorage.getItem('asfer_sesion_activa');
        if (!sesionJson) return null;

        try {
            const sesion = JSON.parse(sesionJson);
            if (Date.now() > sesion.expiraEn) {
                cerrarSesion();
                return null;
            }
            return sesion;
        } catch (e) {
            cerrarSesion();
            return null;
        }
    }

    /**
     * Cierra la sesion activa
     */
    function cerrarSesion() {
        const sesion = obtenerSesionActual();
        if (sesion) {
            registrarLogAuditoria('CIERRE_SESION', 'Cierre de sesion voluntario');
        }
        sessionStorage.removeItem('asfer_sesion_activa');
    }

    /**
     * Control de Acceso Basado en Roles (RBAC)
     * Verifica si el usuario actual posee los permisos necesarios
     * @param {string} rolRequerido ('administrador', 'empleado', 'cliente')
     * @returns {boolean}
     */
    function tienePermiso(rolRequerido) {
        const sesion = obtenerSesionActual();
        if (!sesion) return false;

        const jerarquiaRoles = {
            'cliente': 1,
            'empleado': 2,
            'administrador': 3
        };

        const nivelActual = jerarquiaRoles[sesion.rol] || 0;
        const nivelRequerido = jerarquiaRoles[rolRequerido] || 99;

        return nivelActual >= nivelRequerido;
    }

    // Exportacion publica del modulo de seguridad en el objeto window
    window.SeguridadASFER = {
        sanitizarTexto: sanitizarTexto,
        calcularHashContrasena: calcularHashContrasena,
        evaluarFortalezaContrasena: evaluarFortalezaContrasena,
        verificarEstadoBloqueo: verificarEstadoBloqueo,
        registrarIntentoFallido: registrarIntentoFallido,
        limpiarIntentosFallidos: limpiarIntentosFallidos,
        registrarLogAuditoria: registrarLogAuditoria,
        obtenerLogsAuditoria: obtenerLogsAuditoria,
        guardarSesion: guardarSesion,
        obtenerSesionActual: obtenerSesionActual,
        cerrarSesion: cerrarSesion,
        tienePermiso: tienePermiso
    };
})();
