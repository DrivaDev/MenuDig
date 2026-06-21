import type { ReactNode } from 'react'
import Link from 'next/link'

export interface BlogPost {
  slug:     string
  title:    string
  excerpt:  string
  date:     string  // ISO YYYY-MM-DD
  readTime: number  // minutes
  keywords: string[]
  content:  ReactNode
}

const MD = () => <Link href="/" className="font-semibold text-brand-principal hover:underline">MenuDig</Link>

// ─── Posts ────────────────────────────────────────────────────────────────────

const posts: BlogPost[] = [
  {
    slug:     'menu-digital-restaurante-argentina',
    title:    'Menú digital para restaurantes en Argentina: guía completa 2026',
    excerpt:  'Todo lo que necesitás saber para digitalizar el menú de tu restaurante en Argentina: qué es, cómo funciona, costos reales y por qué cada vez más locales lo adoptan.',
    date:     '2026-05-15',
    readTime: 6,
    keywords: ['menú digital restaurante argentina', 'carta digital restaurante', 'menú qr argentina'],
    content: (
      <>
        <p>
          En los últimos años, el menú digital dejó de ser una novedad para convertirse en una herramienta
          estándar en restaurantes, bares y cafeterías de todo el país. Si todavía usás carta impresa,
          probablemente ya notaste que algunos de tus competidores cambiaron. Y tienen razones concretas para hacerlo.
        </p>

        <h2>¿Qué es un menú digital para restaurantes?</h2>
        <p>
          Un menú digital es la versión online de tu carta, accesible desde el celular del cliente mediante
          un código QR. No requiere descarga de ninguna app: el cliente escanea el QR con la cámara del
          teléfono, y el menú se abre en el navegador en segundos.
        </p>
        <p>
          Podés mostrar categorías, platos con foto y descripción, precios, alérgenos y más. Cuando
          cambiás algo (un precio, un plato nuevo, un producto agotado), el cambio se refleja al instante
          en todos los QR que ya repartiste.
        </p>

        <h2>¿Por qué los restaurantes en Argentina están adoptando el menú digital?</h2>
        <p>
          Las razones son principalmente económicas y operativas:
        </p>
        <ul>
          <li>
            <strong>Inflación y precios cambiantes.</strong> Reimprimir cartas cada vez que cambia un precio
            cuesta tiempo y dinero. Con el menú digital, actualizás desde el celular en 30 segundos.
          </li>
          <li>
            <strong>Sin costo de reimpresión.</strong> El menú digital no se rompe, no se mancha y no se pierde.
            Actualizás cuantas veces quieras sin gastar en imprenta.
          </li>
          <li>
            <strong>Mejor experiencia para el cliente.</strong> Los clientes pueden ver fotos de los platos,
            leer ingredientes y filtrar por categoría, todo desde la pantalla del celular que ya tienen en la mano.
          </li>
          <li>
            <strong>Higiene.</strong> Desde la pandemia, muchos clientes prefieren no tocar cartas que pasaron
            por cientos de manos.
          </li>
        </ul>

        <h2>¿Cómo funciona el menú QR en la práctica?</h2>
        <p>
          El proceso es simple:
        </p>
        <ol>
          <li>Creás tu cuenta en una plataforma como <MD />.</li>
          <li>Cargás tus categorías y platos (con foto, descripción y precio).</li>
          <li>La plataforma genera automáticamente un código QR único para tu local.</li>
          <li>Descargás el QR e imprimís en las mesas, la entrada o donde quieras.</li>
          <li>Los clientes escanean y ven el menú actualizado en tiempo real.</li>
        </ol>
        <p>
          No hay aplicación que instalar, ni para vos ni para tu cliente. Todo funciona desde el navegador.
        </p>

        <h2>¿Cuánto cuesta un menú digital en Argentina?</h2>
        <p>
          Los costos varían según la plataforma. <MD />, por ejemplo, ofrece 14 días de prueba gratuita sin
          tarjeta de crédito. Después, el plan mensual incluye todos los platos, categorías y
          actualizaciones sin costo adicional.
        </p>
        <p>
          Comparado con el costo de reimprimir cartas cada uno o dos meses, el menú digital se amortiza
          rápidamente, sobre todo en un contexto de precios que cambian con frecuencia.
        </p>

        <h2>¿Qué datos necesito para empezar?</h2>
        <p>
          Solo necesitás tu correo electrónico para crear la cuenta. Después, el nombre de tu restaurante,
          las categorías del menú (Entradas, Platos principales, Bebidas, etc.) y los platos con precio.
          Las fotos son opcionales, pero mejoran mucho la experiencia del cliente.
        </p>
        <p>
          En <MD />, podés tener tu menú público listo en menos de 10 minutos desde que te registrás.
        </p>

        <h2>Conclusión</h2>
        <p>
          El menú digital ya no es una ventaja diferencial: es una expectativa. Los clientes lo buscan,
          los locales que lo tienen reducen costos, y la gestión del menú se vuelve muchísimo más ágil.
          Si todavía no digitalizaste tu carta, el momento es ahora.
        </p>
      </>
    ),
  },
  {
    slug:     'menu-digital-vs-carta-papel',
    title:    'Menú digital vs carta de papel: ¿cuál conviene para tu restaurante?',
    excerpt:  'Comparamos las dos opciones en detalle: costos, experiencia del cliente, mantenimiento y más. Cuál elegir según el tipo de local.',
    date:     '2026-05-22',
    readTime: 5,
    keywords: ['menú digital vs carta papel', 'carta digital vs tradicional', 'ventajas menú qr restaurante'],
    content: (
      <>
        <p>
          La carta de papel lleva décadas siendo el estándar en la industria gastronómica. Pero el menú
          digital con QR ganó terreno rápidamente, y hoy muchos dueños de restaurantes se preguntan si
          vale la pena hacer el cambio. En este artículo comparamos ambas opciones en los aspectos que
          más importan.
        </p>

        <h2>Costos: carta de papel vs menú digital</h2>
        <p>
          La carta de papel tiene un costo de entrada más bajo pero un costo recurrente alto. Cada vez que
          cambia un precio, se agota un plato o agregás algo nuevo, hay que reimprimir. En un contexto de
          inflación, eso puede significar varias reimpresiones al año.
        </p>
        <p>
          El menú digital tiene un costo fijo mensual (en <MD />, por ejemplo), sin importar cuántas
          veces actualicés. A largo plazo, la ecuación económica generalmente favorece al menú digital.
        </p>

        <h2>Experiencia del cliente</h2>
        <p>
          La carta de papel tiene una ventaja táctil: el cliente la sostiene, la hojea, puede verla sin
          necesitar batería en el celular. Para ciertos restaurantes de alta gama, esto sigue siendo parte
          de la experiencia de marca.
        </p>
        <p>
          El menú digital, en cambio, permite algo que la carta de papel no puede: mostrar fotos de cada plato.
          Estudios en restaurantes muestran que los platos con foto se piden más. Además, el menú digital
          puede incluir descripciones largas, alérgenos, etiquetas de "picante", "sin TACC", etc.
        </p>

        <h2>Actualización y mantenimiento</h2>
        <p>
          Este es el punto donde el menú digital gana sin discusión. ¿Se terminó el risotto? En el menú
          digital lo desactivás en 10 segundos desde el celular. ¿Subió el precio del bife? Lo actualizás
          antes de que llegue el primer cliente del turno.
        </p>
        <p>
          Con la carta de papel, eso implica tachar a mano, poner un papelito encima, o imprimir de nuevo.
          Ninguna opción es ideal para la imagen del local.
        </p>

        <h2>Higiene y percepción del cliente</h2>
        <p>
          Después de la pandemia, muchos clientes son más conscientes de lo que tocan. Una carta que pasó
          por cientos de manos, aunque esté limpia, genera incomodidad en algunos comensales. El menú QR
          elimina esa preocupación.
        </p>

        <h2>¿Cuándo conviene el menú digital?</h2>
        <ul>
          <li>Restaurantes con precios que cambian frecuentemente.</li>
          <li>Locales que quieren mostrar fotos atractivas de sus platos.</li>
          <li>Bares, cafeterías, rotiserías y cualquier negocio gastronómico con rotación alta de carta.</li>
          <li>Negocios que quieren reducir costos de impresión sin resignar profesionalismo.</li>
        </ul>

        <h2>Conclusión</h2>
        <p>
          Para la mayoría de los restaurantes en Argentina, el menú digital es la opción más práctica y
          económica. No reemplaza la carta de papel en todos los contextos, pero para el 90% de los locales
          gastronómicos, ofrece ventajas concretas desde el primer mes.
        </p>
      </>
    ),
  },
  {
    slug:     'como-hacer-menu-digital-restaurante',
    title:    'Cómo hacer un menú digital para tu restaurante paso a paso',
    excerpt:  'Guía práctica para crear tu menú digital con QR desde cero, sin saber programar. Incluye tips para las fotos, los textos y cómo colocar el QR en tu local.',
    date:     '2026-05-29',
    readTime: 7,
    keywords: ['cómo hacer menú digital restaurante', 'crear menú digital qr', 'menú qr gratis restaurante'],
    content: (
      <>
        <p>
          Crear un menú digital para tu restaurante es más simple de lo que parece. No necesitás saber
          programar, no necesitás contratar a nadie, y podés tenerlo funcionando en menos de una hora.
          Acá te explicamos cómo hacerlo paso a paso.
        </p>

        <h2>Paso 1: Elegí una plataforma</h2>
        <p>
          Existen varias plataformas de menú digital. Lo que tenés que evaluar:
        </p>
        <ul>
          <li><strong>Facilidad de uso.</strong> Debería ser tan simple como llenar un formulario.</li>
          <li><strong>Que incluya el QR.</strong> Algunas plataformas cobran el QR aparte.</li>
          <li><strong>Personalización.</strong> Que puedas poner los colores de tu local.</li>
          <li><strong>Precio justo.</strong> Buscá opciones con prueba gratuita para testear antes de pagar.</li>
        </ul>
        <p>
          <MD />, por ejemplo, incluye QR descargable, personalización de colores y 14 días de prueba
          gratis sin tarjeta.
        </p>

        <h2>Paso 2: Creá tu cuenta</h2>
        <p>
          El proceso es el mismo en casi todas las plataformas: ingresás tu email, elegís una contraseña
          y listo. En <MD />, además, el sistema genera automáticamente una URL pública para tu menú
          basada en el nombre de tu restaurante (por ejemplo, <code>menudig.com.ar/menu/la-parrilla</code>).
        </p>

        <h2>Paso 3: Cargá las categorías</h2>
        <p>
          Antes de cargar los platos, organizá tu menú en categorías: Entradas, Platos principales,
          Pastas, Pizzas, Postres, Bebidas, etc. Esto facilita la navegación al cliente.
        </p>
        <p>
          Tip: menos categorías es mejor. Si tenés muchas, usá subcategorías para agrupar (por ejemplo,
          "Bebidas" en "Con alcohol" y "Sin alcohol").
        </p>

        <h2>Paso 4: Cargá los platos</h2>
        <p>
          Para cada plato, completá:
        </p>
        <ul>
          <li><strong>Nombre.</strong> Claro y apetitoso.</li>
          <li><strong>Descripción.</strong> Ingredientes principales, punto de cocción, presentación.</li>
          <li><strong>Precio.</strong> El precio actual.</li>
          <li><strong>Foto.</strong> Opcional pero muy recomendado.</li>
        </ul>

        <h2>Tips para las fotos de platos</h2>
        <p>
          Las fotos son el factor que más impacta en las ventas. Algunos consejos prácticos:
        </p>
        <ul>
          <li>Usá luz natural siempre que puedas. La luz artificial amarilla aplana los colores.</li>
          <li>Fotografiá desde arriba (cenital) o en ángulo de 45°. Evitá el contrapicado.</li>
          <li>Usá un fondo limpio: tabla de madera, mantel blanco o pizarrón.</li>
          <li>El celular es suficiente. No necesitás cámara profesional.</li>
          <li>Antes de publicar, editá el brillo y la saturación en la app de fotos de tu celular.</li>
        </ul>

        <h2>Paso 5: Personalizá los colores</h2>
        <p>
          Configurá los colores del menú para que coincidan con la identidad visual de tu local. Si tenés
          logo, subilo también. Esto hace que el menú se vea como parte de tu marca, no como un template genérico.
        </p>

        <h2>Paso 6: Descargá el QR e imprimilo</h2>
        <p>
          Una vez que el menú está listo, descargá el código QR en alta resolución. Podés imprimirlo en:
        </p>
        <ul>
          <li>Tarjetitas en cada mesa</li>
          <li>Carteles en la entrada</li>
          <li>El reverso de la factura</li>
          <li>Stickers en las mesas</li>
          <li>Un display acrílico (se consiguen en librerías o imprenta)</li>
        </ul>

        <h2>Paso 7: Mantenelo actualizado</h2>
        <p>
          La ventaja del menú digital es que podés actualizarlo cuando quieras. Acostumbrate a revisar
          precios y disponibilidad de platos antes de cada turno. En 2 minutos tenés el menú al día.
        </p>

        <h2>Conclusión</h2>
        <p>
          Hacer un menú digital para tu restaurante no requiere conocimientos técnicos ni inversión grande.
          Con las herramientas adecuadas, podés tenerlo funcionando hoy mismo. El primer paso es crear
          la cuenta: el resto es cargar lo que ya sabés de memoria.
        </p>
      </>
    ),
  },
  {
    slug:     'menu-qr-restaurante-como-funciona',
    title:    'Menú QR para restaurantes: qué es y cómo funciona',
    excerpt:  '¿Qué es exactamente el menú con QR? ¿Necesitan los clientes una app? ¿Funciona en todos los celulares? Respondemos las preguntas más frecuentes.',
    date:     '2026-06-05',
    readTime: 5,
    keywords: ['menú qr restaurante', 'código qr menú restaurante', 'cómo funciona menú qr'],
    content: (
      <>
        <p>
          El menú con código QR es una de las herramientas más adoptadas en la gastronomía de los últimos
          años. Pero todavía hay dueños de restaurantes (y clientes) con dudas sobre cómo funciona, qué
          necesitan para usarlo, y si realmente vale la pena. Acá respondemos las preguntas más frecuentes.
        </p>

        <h2>¿Qué es un código QR para menú?</h2>
        <p>
          Un código QR (Quick Response) es una imagen que funciona como enlace. Cuando tu cliente apunta
          la cámara del celular al QR, el teléfono detecta automáticamente que hay un enlace y lo abre
          en el navegador. En ese enlace está tu menú digital.
        </p>
        <p>
          No hay nada que instalar. No hay cuenta que crear. El cliente solo abre la cámara, apunta y listo.
        </p>

        <h2>¿Funciona en todos los celulares?</h2>
        <p>
          Sí. La mayoría de los smartphones modernos leen QR directamente con la cámara nativa, sin app
          adicional. Esto incluye:
        </p>
        <ul>
          <li>iPhone con iOS 11 o superior (desde 2017)</li>
          <li>Android con Google Lens integrado (desde 2018 en la mayoría de modelos)</li>
          <li>Samsung, Motorola, Xiaomi, y otras marcas populares en Argentina</li>
        </ul>
        <p>
          En casos muy excepcionales (teléfonos muy viejos), el cliente puede descargar una app gratuita
          de lector QR, pero esto es cada vez más raro.
        </p>

        <h2>¿Los clientes necesitan internet?</h2>
        <p>
          Sí, necesitan conexión a internet para ver el menú: ya sea datos móviles o el WiFi del local.
          Es una buena práctica ofrecer WiFi gratuito y publicar la contraseña cerca del QR.
        </p>

        <h2>¿Qué pasa si cambia el menú?</h2>
        <p>
          El QR siempre apunta a la misma URL. Cuando actualizás el menú desde el panel de administración,
          el cambio se refleja automáticamente la próxima vez que cualquier cliente escanee el QR.
          No necesitás reimprimir el código.
        </p>
        <p>
          Esa es una de las mayores ventajas del menú digital: el QR físico es permanente, el contenido
          que muestra es dinámico.
        </p>

        <h2>¿Es seguro para el cliente?</h2>
        <p>
          Sí. El menú QR no pide datos personales al cliente, no instala nada en el celular, y no
          requiere registro. Es simplemente una página web con tu carta.
        </p>

        <h2>¿Puedo tener más de un QR para diferentes zonas del local?</h2>
        <p>
          Con <MD />, el QR siempre apunta al mismo menú. Si querés diferencias por zona (por ejemplo,
          carta de terraza vs carta de salón), necesitarías cuentas separadas. Para la mayoría de los
          restaurantes, un único menú es suficiente.
        </p>

        <h2>¿Los clientes prefieren el menú QR o la carta de papel?</h2>
        <p>
          Depende del público, pero la tendencia es clara: los menores de 50 años prefieren o aceptan
          sin problema el QR. La ventaja más mencionada por clientes es poder ver las fotos de los platos
          antes de pedir.
        </p>
        <p>
          Una buena práctica es ofrecer ambas opciones durante los primeros meses de implementación,
          e ir midiendo la adopción.
        </p>

        <h2>¿Cómo empiezo?</h2>
        <p>
          Podés crear tu menú QR en <MD /> de forma completamente gratuita durante 14 días.
          Sin tarjeta, sin compromiso. En menos de 10 minutos tenés el menú listo y el QR para imprimir.
        </p>
      </>
    ),
  },
  {
    slug:     'aumentar-ventas-restaurante-menu-digital',
    title:    'Cómo aumentar las ventas de tu restaurante con el menú digital',
    excerpt:  'El menú digital no es solo una carta online. Bien usado, aumenta el ticket promedio, reduce errores de pedido y mejora la experiencia que hace volver a los clientes.',
    date:     '2026-06-12',
    readTime: 6,
    keywords: ['aumentar ventas restaurante', 'menú digital ventas', 'ticket promedio restaurante'],
    content: (
      <>
        <p>
          Digitalizar el menú de tu restaurante tiene beneficios obvios: menos costos de impresión,
          actualizaciones más rápidas. Pero hay un beneficio menos obvio que muchos dueños descubren
          después de implementarlo: <strong>el menú digital puede aumentar tus ventas</strong>.
          Acá explicamos cómo y por qué.
        </p>

        <h2>Las fotos aumentan el ticket promedio</h2>
        <p>
          Este es el efecto más documentado. Cuando los clientes ven una foto atractiva de un plato,
          son más propensos a pedirlo, sobre todo si es un plato que no habrían elegido solo leyendo
          el nombre.
        </p>
        <p>
          Restaurantes que implementaron fotos en el menú digital reportan incrementos del 15% al 30%
          en el pedido de platos que antes se vendían poco. Los postres y las entradas son las categorías
          que más se benefician de las imágenes.
        </p>

        <h2>Descripciones bien escritas generan deseo</h2>
        <p>
          La carta de papel limita el espacio para describir los platos. El menú digital no tiene esa
          restricción. Usá ese espacio para hacer que cada plato suene apetitoso:
        </p>
        <ul>
          <li>En vez de "Bife de chorizo", probá "Bife de chorizo madurado 21 días, punto jugoso, con chimichurri casero".</li>
          <li>Mencioná el origen de los ingredientes cuando sea relevante.</li>
          <li>Describí la textura, el punto de cocción, la presentación.</li>
        </ul>

        <h2>Menos errores de pedido, más satisfacción</h2>
        <p>
          Cuando el cliente puede leer con detalle lo que incluye cada plato (ingredientes, alérgenos,
          opciones), hay menos malentendidos con el mozo y menos devoluciones o quejas. Eso se traduce en
          una experiencia más fluida y clientes más satisfechos.
        </p>

        <h2>La disponibilidad en tiempo real reduce la frustración</h2>
        <p>
          Pocos momentos son más frustrantes para un cliente que elegir un plato y que el mozo le diga
          "ese no hay más". Con el menú digital, podés desactivar un plato en segundos cuando se agota.
          El cliente nunca elige algo que no está disponible.
        </p>

        <h2>Actualizaciones estratégicas según el momento del día</h2>
        <p>
          Con un menú digital, podés hacer cambios estratégicos durante el servicio:
        </p>
        <ul>
          <li>Destacar el plato del día al mediodía.</li>
          <li>Agregar promociones de happy hour por la tarde.</li>
          <li>Mostrar los postres más prominentemente después de las 9 PM.</li>
        </ul>
        <p>
          Cualquier cambio tarda menos de un minuto y se ve reflejado de inmediato.
        </p>

        <h2>El menú como herramienta de branding</h2>
        <p>
          Un menú digital bien diseñado, con los colores de tu local, tu logo y fotos de calidad,
          refuerza la identidad de tu marca. Los clientes que tienen una experiencia visual positiva
          son más propensos a recomendar el lugar y a volver.
        </p>
        <p>
          <MD /> permite personalizar colores y logo del menú para que se vea como una
          extensión de tu marca, no como un template genérico.
        </p>

        <h2>Conclusión</h2>
        <p>
          El menú digital bien implementado no es solo una carta online. Es una herramienta de ventas.
          Las fotos, las descripciones detalladas, la disponibilidad en tiempo real y la posibilidad de
          hacer cambios estratégicos durante el servicio se combinan para aumentar el ticket promedio
          y mejorar la experiencia del cliente.
        </p>
        <p>
          Si todavía no lo probaste, en <MD /> tenés 14 días gratis para ver el impacto en tu local
          antes de tomar una decisión.
        </p>
      </>
    ),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllPosts(): Omit<BlogPost, 'content'>[] {
  return posts.map(({ content: _content, ...rest }) => rest).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
