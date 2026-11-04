/**
 * ============================================================================
 * FERRETERIA ASFER - BASE DE DATOS Y CONFIGURACION DE LA APLICACION
 * Constanza, Republica Dominicana
 * Productos, categorias, cuentas predeterminadas de roles, pedidos y horarios.
 * Sin emojis.
 * ============================================================================
 */

(function () {
    'use strict';

    // Informacion comercial de ASFER
    const DATOS_NEGOCIO = {
        razonSocial: 'ASFER, S.R.L.',
        nombreComercial: 'Ferretería ASFER',
        rnc: '1-31-98765-4',
        direccion: 'W753+85W, Av. Gral. Luperón, Constanza 41000, República Dominicana',
        telefono: '(809) 539-2104',
        telefonoEnlace: '8095392104',
        whatsapp: '18095392104',
        correo: 'ventas@asfer.com.do',
        instagramUrl: 'https://www.instagram.com/asfersrl/',
        mapaUrl: 'https://www.google.com/maps/search/?api=1&query=W753%2B85W+Av.+Gral.+Luper%C3%B3n+Constanza+Rep%C3%BAblica+Dominicana'
    };

    // Categorias oficiales del catalogo
    const CATEGORIAS_PRODUCTO = [
        'Herramientas',
        'Electricidad',
        'Plomería',
        'Pintura',
        'Construcción'
    ];

    // Catalogo inicial de productos
    const PRODUCTOS_INICIALES = [
        // Herramientas
        { id: 1,  nombre: 'Martillo de uña 16 oz profesional', precio: 450,  categoria: 'Herramientas', stock: 24, imagen: 'https://ferremix.com.do/cdn/shop/files/MAR-16F.jpg?v=1754322785', descripcion: 'Acero forjado con empuñadura de fibra antideslizante.' },
        { id: 2,  nombre: 'Taladro percutor industrial 1/2"',  precio: 3200, categoria: 'Herramientas', stock: 12, imagen: 'https://tecindustrialrd.com/web/image/product.product/56605/image_1024', descripcion: 'Potencia de 750W para concreto, metal y madera.' },
        { id: 3,  nombre: 'Cinta métrica de alta resistencia 5m', precio: 220,  categoria: 'Herramientas', stock: 35, imagen: 'https://cdn.almacen.do/2021/08/Cinta-M%C3%A9trica-INGCO-5-m-x-25-mm-Front.jpg', descripcion: 'Cinta de nylon con bloqueo magnetico y carcasa de impacto.' },
        { id: 4,  nombre: 'Juego de destornilladores x6 piezas',  precio: 650,  categoria: 'Herramientas', stock: 18, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk2-D2N6ZydgJuLq2wXxnfjz6vAe3ak_GHKyKdlKKKrg&s=10.jpg', descripcion: 'Puntas imantadas de cromo vanadio (planos y de estrella).' },
        { id: 5,  nombre: 'Sierra circular 7-1/4" de precisión', precio: 4500, categoria: 'Herramientas', stock: 8,  imagen: 'https://ferremix.com.do/cdn/shop/files/SICI-7-1-4A3.jpg?v=1754324134', descripcion: 'Motor de alto torque con guia laser para cortes rectos.' },

        // Electricidad
        { id: 6,  nombre: 'Cable eléctrico THHN #12 (por metro)', precio: 55,   categoria: 'Electricidad', stock: 500, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvdzi7I7jzt9X0VdfNo8YX71iVpEfELVu3k5uYMNzmyA&s=10', descripcion: 'Cobre 100% puro para instalaciones residenciales seguras.' },
        { id: 7,  nombre: 'Interruptor sencillo de placa marfil', precio: 180,  categoria: 'Electricidad', stock: 60, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY7Nu6W5VGwySPaeFyHWVXGSsHlvj1YCoi3e8INYqmhw&s=10', descripcion: 'Mecanismo silencioso de 15A / 120V con certificacion.' },
        { id: 8,  nombre: 'Bombillo LED 12W luz blanca de alta potencia', precio: 150,  categoria: 'Electricidad', stock: 80, imagen: 'https://www.e-vatio.com/cdn/shop/products/01_03c401a7-f460-4f04-aa27-8a4a2e49dd5e.jpg?v=1658412047', descripcion: 'Ahorro del 85% de energia, durabilidad estimada 25,000 horas.' },
        { id: 9,  nombre: 'Breaker termomagnético 20A monopolar', precio: 320,  categoria: 'Electricidad', stock: 45, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKGRIYQx4SKCSXNIz7LdDFXFwzcaGVok-R8ncZe9NGfg&s=10', descripcion: 'Proteccion instantanea contra sobrecargas y cortocircuitos.' },

        // Plomería
        { id: 10, nombre: 'Tubo de PVC para presión 1/2" SDR-26', precio: 180,  categoria: 'Plomería', stock: 120, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ7PrDt_iY3G6d5zmwY-bqoOBrd4ffSYKh0StzfqOCpg&s=10', descripcion: 'Tubo sanitario y agua potable de alta tolerancia termica.' },
        { id: 11, nombre: 'Llave de paso esférica de bronce 1/2"', precio: 380,  categoria: 'Plomería', stock: 30, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Zb8IIXGlMU2kGERuEOTTvvWgg3ApVvpcqDM6Q646Hw&s=10', descripcion: 'Cierre hermetico a 1/4 de vuelta libre de oxido.' },
        { id: 12, nombre: 'Cinta de teflón de alta densidad 3/4"', precio: 60,   categoria: 'Plomería', stock: 95, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQd4x3n-ujSsDhoFfSqs_odX5eOPIWYxlVVINfMhlITqQ&s=10', descripcion: 'Sellado profesional antifugas para roscas de metal y PVC.' },

        // Pintura
        { id: 13, nombre: 'Pintura látex acrílica blanca (1 galón)', precio: 1450, categoria: 'Pintura', stock: 25, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwNFxQTe5Qx2NWGEG7AQSll2YUX1xM2dX7Vl9lfsn9JA&s=10', descripcion: 'Acabado mate de gran cubrimiento resistente a climas frios de montaña.' },
        { id: 14, nombre: 'Brocha profesional de cerda suave 3"', precio: 220,  categoria: 'Pintura', stock: 40, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOVED4Dldit-17iKClyXZpRhJwwOR_XkKyTxa3AiQkBQ&s=10', descripcion: 'Distribucion pareja de pintura sin soltar cerdas.' },

        // Construcción
        { id: 15, nombre: 'Saco de cemento gris Portland 42.5 kg', precio: 380,  categoria: 'Construcción', stock: 150, imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJAmIU-5eXVHZTKmp_CEeBUnPLPd2rR9r3vUMWNs1Q-Q&s=10', descripcion: 'Fragüado rápido y resistencia estructural superior.' }
    ];

    // Horarios de operacion de Ferreteria ASFER
    const HORARIOS_OPERACION = [
        { dia: 'Lunes',     apertura: 8, cierre: 18, cerrado: false },
        { dia: 'Martes',    apertura: 8, cierre: 18, cerrado: false },
        { dia: 'Miércoles', apertura: 8, cierre: 18, cerrado: false },
        { dia: 'Jueves',    apertura: 8, cierre: 18, cerrado: false },
        { dia: 'Viernes',   apertura: 8, cierre: 18, cerrado: false },
        { dia: 'Sábado',    apertura: 8, cierre: 17, cerrado: false },
        { dia: 'Domingo',   apertura: 0, cierre: 0,  cerrado: true  }
    ];

    // Cuentas predeterminadas con sus credenciales de prueba
    // Las contrasenas son hasheadas con SHA-256 al inicializar la base de datos
    const USUARIOS_PREDETERMINADOS = [
        {
            nombre: 'Ing. Roberto Fernández',
            correo: 'admin@asfer.com',
            clavePlana: 'Admin#2026',
            rol: 'administrador',
            descripcion: 'Nivel 3: Control total del catalogo, auditoria y usuarios'
        },
        {
            nombre: 'Carlos Manuel Gómez',
            correo: 'empleado@asfer.com',
            clavePlana: 'Empleado#2026',
            rol: 'empleado',
            descripcion: 'Nivel 2: Operacion de pedidos, atencion y cambio de stock'
        },
        {
            nombre: 'Pedro Jiménez (Contratista)',
            correo: 'cliente@asfer.com',
            clavePlana: 'Cliente#2026',
            rol: 'cliente',
            descripcion: 'Nivel 1: Cotizaciones, historial y preparacion de pedidos'
        }
    ];

    // Pedidos iniciales de ejemplo para el panel de Empleado y Admin
    const PEDIDOS_INICIALES = [
        {
            id: 'ORD-1001',
            clienteNombre: 'Pedro Jiménez',
            clienteTelefono: '(809) 450-1234',
            fecha: '2026-10-29T10:15:00Z',
            items: [
                { nombre: 'Saco de cemento gris Portland 42.5 kg', cantidad: 10, precio: 380 },
                { nombre: 'Tubo de PVC para presión 1/2" SDR-26', cantidad: 6, precio: 180 }
            ],
            total: 4880,
            estado: 'preparacion', // pendiente, preparacion, listo, entregado
            nota: 'Entregar en la entrada de Valle Nuevo.'
        },
        {
            id: 'ORD-1002',
            clienteNombre: 'Marcos De La Cruz',
            clienteTelefono: '(809) 539-9988',
            fecha: '2026-10-29T14:30:00Z',
            items: [
                { nombre: 'Taladro percutor industrial 1/2"', cantidad: 1, precio: 3200 },
                { nombre: 'Juego de destornilladores x6 piezas', cantidad: 1, precio: 650 }
            ],
            total: 3850,
            estado: 'listo',
            nota: 'Pasa a recoger a las 5:00 p.m.'
        }
    ];

    /**
     * Inicializa la base de datos en localStorage asegurando el hashing de contrasenas
     */
    async function inicializarBaseDatos() {
        // Inicializar productos si no existen
        if (!localStorage.getItem('asfer_productos')) {
            localStorage.setItem('asfer_productos', JSON.stringify(PRODUCTOS_INICIALES));
        }

        // Inicializar pedidos si no existen
        if (!localStorage.getItem('asfer_pedidos')) {
            localStorage.setItem('asfer_pedidos', JSON.stringify(PEDIDOS_INICIALES));
        }

        // Inicializar usuarios con hashes seguros de contrasena
        if (!localStorage.getItem('asfer_usuarios')) {
            const usuariosConHash = [];
            for (const u of USUARIOS_PREDETERMINADOS) {
                const hash = await window.SeguridadASFER.calcularHashContrasena(u.clavePlana);
                usuariosConHash.push({
                    nombre: u.nombre,
                    correo: u.correo,
                    hashContrasena: hash,
                    rol: u.rol
                });
            }
            localStorage.setItem('asfer_usuarios', JSON.stringify(usuariosConHash));
        }
    }

    /**
     * Obtiene la lista actual de productos
     */
    function obtenerProductos() {
        try {
            return JSON.parse(localStorage.getItem('asfer_productos')) || PRODUCTOS_INICIALES;
        } catch (e) {
            return PRODUCTOS_INICIALES;
        }
    }

    /**
     * Guarda la lista de productos
     */
    function guardarProductos(lista) {
        localStorage.setItem('asfer_productos', JSON.stringify(lista));
    }

    /**
     * Obtiene la lista actual de usuarios
     */
    function obtenerUsuarios() {
        try {
            return JSON.parse(localStorage.getItem('asfer_usuarios')) || [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Registra un nuevo usuario con hash seguro
     */
    async function registrarNuevoUsuario(nombre, correo, contrasena, rol) {
        const usuarios = obtenerUsuarios();
        const correoNormalizado = correo.toLowerCase().trim();

        if (usuarios.some(u => u.correo.toLowerCase() === correoNormalizado)) {
            return { exito: false, mensaje: 'Ya existe una cuenta con este correo electrónico.' };
        }

        const hash = await window.SeguridadASFER.calcularHashContrasena(contrasena);
        const nuevo = {
            nombre: window.SeguridadASFER.sanitizarTexto(nombre),
            correo: correoNormalizado,
            hashContrasena: hash,
            rol: rol || 'cliente'
        };

        usuarios.push(nuevo);
        localStorage.setItem('asfer_usuarios', JSON.stringify(usuarios));
        window.SeguridadASFER.registrarLogAuditoria('REGISTRO_USUARIO', 'Nuevo usuario registrado: ' + correoNormalizado);
        return { exito: true, usuario: nuevo };
    }

    /**
     * Autentica un usuario verificando hash de contrasena
     */
    async function autenticarUsuario(correo, contrasena) {
        const correoNormalizado = correo.toLowerCase().trim();
        const usuarios = obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(u => u.correo.toLowerCase() === correoNormalizado);

        if (!usuarioEncontrado) {
            return { exito: false, mensaje: 'Credenciales inválidas. Verifique su correo o clave.' };
        }

        const hashIngresado = await window.SeguridadASFER.calcularHashContrasena(contrasena);
        if (hashIngresado !== usuarioEncontrado.hashContrasena) {
            return { exito: false, mensaje: 'Contraseña incorrecta.' };
        }

        return { exito: true, usuario: usuarioEncontrado };
    }

    /**
     * Obtiene la lista de pedidos
     */
    function obtenerPedidos() {
        try {
            return JSON.parse(localStorage.getItem('asfer_pedidos')) || [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Guarda la lista de pedidos
     */
    function guardarPedidos(lista) {
        localStorage.setItem('asfer_pedidos', JSON.stringify(lista));
    }

    // Exportacion del modulo de datos
    window.DatosASFER = {
        negocio: DATOS_NEGOCIO,
        categorias: CATEGORIAS_PRODUCTO,
        horarios: HORARIOS_OPERACION,
        usuariosDemo: USUARIOS_PREDETERMINADOS,
        inicializarBaseDatos: inicializarBaseDatos,
        obtenerProductos: obtenerProductos,
        guardarProductos: guardarProductos,
        obtenerUsuarios: obtenerUsuarios,
        registrarNuevoUsuario: registrarNuevoUsuario,
        autenticarUsuario: autenticarUsuario,
        obtenerPedidos: obtenerPedidos,
        guardarPedidos: guardarPedidos
    };
})();
