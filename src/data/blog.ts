export type BlogArticleSection = {
  heading: string
  paragraphs: string[]
  points?: string[]
}

export type BlogPost = {
  id: string
  category: string
  tags: string[]
  title: string
  excerpt: string
  isSample: boolean
  introduction: string[]
  sections: BlogArticleSection[]
  takeaway: string[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 'arquitecturas-plataformas-iot',
    category: 'Arquitectura IoT',
    tags: ['IoT', 'MQTT', 'Arquitectura', 'Trazabilidad'],
    title: 'Arquitecturas para plataformas IoT',
    excerpt:
      'Principios para recibir, validar y exponer datos de dispositivos sin perder trazabilidad ni capacidad de crecimiento.',
    isSample: true,
    introduction: [
      'Una plataforma IoT no empieza cuando se instala un broker ni cuando se elige entre MQTT y HTTP. Empieza cuando se define qué significa un evento fiable. Un dispositivo puede enviar una lectura, una alarma o un cambio de estado, pero el sistema necesita saber quién lo envió, cuándo ocurrió, qué unidad utiliza y qué versión del contrato entiende. Sin esas respuestas, escalar la ingesta solo multiplica la ambigüedad.',
      'La arquitectura debe separar las decisiones que pertenecen al borde de las que pertenecen al procesamiento central. También debe asumir que habrá mensajes duplicados, conexiones intermitentes, consumidores lentos y datos que necesiten revisión. El objetivo no es prometer que nada fallará, sino hacer que cada fallo sea visible, acotado y recuperable sin perder la historia del dato.',
    ],
    sections: [
      {
        heading: 'La ingesta empieza por un contrato',
        paragraphs: [
          'El contrato de un evento debe identificar al dispositivo y su contexto mínimo. Conviene incluir una identidad estable, el método de autenticación, la versión del esquema, una marca temporal del dispositivo y otra de recepción, además de la magnitud, el valor y la unidad. La validación de tipos, rangos y campos obligatorios ocurre antes de publicar el evento para que los consumidores no tengan que adivinar qué recibieron.',
          'Rechazar un mensaje no significa descartarlo en silencio. La respuesta o el registro de rechazo debe distinguir una credencial inválida, un esquema desconocido y un valor fuera de rango. Un dispositivo con firmware antiguo puede necesitar una ruta de compatibilidad, mientras que un mensaje mal formado puede ir a una cola de revisión. Esa diferencia evita que un problema de calidad termine mezclado con un problema de conectividad.',
        ],
        points: [
          'Identidad y autenticación verificables antes de aceptar la lectura.',
          'Esquema versionado, unidades explícitas y marcas temporales diferenciadas.',
          'Respuesta de rechazo observable y recuperable, no un descarte silencioso.',
        ],
      },
      {
        heading: 'Desacoplar recepción y procesamiento',
        paragraphs: [
          'Un gateway puede terminar conexiones, autenticar dispositivos, normalizar formatos y aplicar límites por identidad. Su responsabilidad debe terminar cerca del acuse de recibo que el dispositivo necesita, no después de que cada consumidor haya guardado y enriquecido el dato. Separar esa frontera permite que la recepción siga siendo predecible aunque una proyección, una alerta o un proceso analítico se ralentice.',
          'Después de la validación, un broker ofrece una frontera de desacoplamiento. Las particiones, las cuotas y la retención permiten absorber ráfagas sin convertirlas automáticamente en pérdida de datos. La contraparte es el backpressure: si la capacidad de procesamiento baja, hay que hacerlo visible mediante profundidad de colas y edad del mensaje, y definir si se ralentiza al emisor, se descarta una clase de evento o se conserva para procesarlo más tarde.',
        ],
      },
      {
        heading: 'Trazabilidad de extremo a extremo',
        paragraphs: [
          'Cada evento debería conservar un identificador propio y, cuando exista una operación más amplia, un identificador de correlación. La plataforma puede añadir el instante de entrada, la identidad del gateway, el resultado de validación y la versión de normalización. Esos metadatos conectan el mensaje recibido con los logs, métricas, alertas y registros almacenados sin depender únicamente del texto libre de un log.',
          'La trazabilidad también incluye los caminos que no terminan bien. Un evento que no puede procesarse debe conservar su motivo y llegar a una cola de mensajes muertos o a un almacenamiento de revisión. Desde allí, una corrección controlada puede permitir un replay con la misma identidad del evento. El consumidor debe distinguir un replay de un evento nuevo y mantener la idempotencia para no duplicar efectos.',
        ],
      },
      {
        heading: 'Crecer sin perder control',
        paragraphs: [
          'Cuando aumenta el número de dispositivos, particionar por una clave estable ayuda a repartir trabajo y conservar un orden útil dentro de un dispositivo o una cuenta. No hay una clave perfecta para todos los casos: particionar solo por dispositivo puede concentrar un productor muy activo, mientras que mezclarlo todo puede complicar las garantías de orden. La decisión debe partir del patrón de lectura y de las operaciones que deben ser idempotentes.',
          'No todos los datos necesitan vivir en la misma capa. Las lecturas recientes pueden estar en una consulta rápida, los históricos en almacenamiento más económico y los eventos originales en una retención definida para auditoría o replay. Encima de esa distribución, una API estable debe ocultar detalles de partición y devolver estados claros. Escalar la infraestructura sin fijar políticas de retención, permisos y evolución del esquema solo desplaza el problema.',
        ],
      },
      {
        heading: 'Ejemplo: del dispositivo a la API',
        paragraphs: [
          'Imaginemos una lectura de temperatura. El dispositivo crea un evento con su identidad, versión de esquema, valor en grados y marca temporal local. El gateway valida las credenciales, añade el instante de recepción y responde según el contrato. Si el esquema es válido, el broker conserva el evento y lo hace disponible para consumidores independientes; si no lo es, registra el rechazo con una causa que el equipo pueda revisar.',
          'Un consumidor de almacenamiento transforma la lectura al formato de consulta y guarda el identificador original para evitar duplicados. Otro consumidor puede evaluar reglas de alerta, mientras que un proceso de exportación lee de una proyección preparada para ese uso. La API consulta la vista apropiada, aplica autorización por dispositivo o cuenta y expone la lectura junto con su calidad y su instante de recepción, no solo con un número aislado.',
          'Si el almacenamiento está temporalmente indisponible, el broker conserva el trabajo pendiente dentro de su política de retención. Si el consumidor falla después de guardar pero antes de confirmar, volverá a recibir el evento; por eso la escritura debe ser idempotente. Si la validación detecta una unidad desconocida, el mensaje no se convierte en una lectura aparentemente correcta: queda marcado para corrección o rechazo.',
        ],
        points: [
          'Dispositivo → gateway: identidad, autenticación y límites de entrada.',
          'Gateway → validación → broker: esquema, unidades, timestamps y acuse.',
          'Broker → consumidores: almacenamiento, alertas y proyecciones desacopladas.',
          'Proyección → API: autorización, calidad del dato y lectura estable.',
        ],
      },
    ],
    takeaway: [
      'La arquitectura no necesita ocultar sus límites; necesita expresarlos con contratos, métricas y operaciones de recuperación que permitan confiar en cada lectura.',
    ],
  },
  {
    id: 'rabbitmq-celery-procesos-pesados',
    category: 'Procesos asíncronos',
    tags: ['RabbitMQ', 'Celery', 'Colas', 'Idempotencia'],
    title: 'RabbitMQ y Celery para procesos pesados',
    excerpt:
      'Cómo separar el trabajo intensivo de la petición principal y diseñar flujos operativos más resistentes.',
    isSample: true,
    introduction: [
      'Una petición HTTP tiene una responsabilidad inmediata: validar la solicitud, aplicar autorización y devolver una respuesta que el cliente pueda interpretar. Hay trabajos que no encajan bien en ese límite, como generar una exportación grande, procesar medios, importar muchos registros o esperar a un sistema externo. Mantenerlos dentro de la petición hace que los timeouts y los reintentos del cliente se conviertan en trabajo duplicado.',
      'RabbitMQ y Celery pueden separar la decisión de iniciar un trabajo de su ejecución. Esa separación no convierte una operación en fiable por sí sola. Hay que definir qué significa entregar una tarea, cuándo se confirma, qué errores se reintentan y cómo se consulta el estado. Una cola útil no es un buzón opaco: es un contrato operativo entre quien publica, quien procesa y quien observa.',
    ],
    sections: [
      {
        heading: 'Qué trabajo sacar de la petición',
        paragraphs: [
          'El trabajo asíncrono suele tener una duración o una variabilidad que no conviene atar al ciclo de vida del navegador. Un informe puede requerir leer varias fuentes, una conversión de vídeo puede consumir CPU y una integración externa puede responder tarde. La petición puede crear el registro de trabajo y devolver un identificador, mientras que el worker completa el proceso sin mantener abierta la conexión original.',
          'No todo merece una cola. Validar un campo, guardar una pequeña modificación o calcular una respuesta corta suele ser más claro dentro de la petición. Introducir un broker para tareas diminutas añade serialización, estados y puntos de fallo. La decisión debe considerar el tiempo esperado, la capacidad de reintento, la necesidad de desconectar al usuario y si el resultado puede consultarse después de forma explícita.',
        ],
      },
      {
        heading: 'Colas con responsabilidades claras',
        paragraphs: [
          'Una tarea de Celery debe representar una unidad que pueda observarse y repetirse. La cola, la routing key y el tipo de worker deberían comunicar la responsabilidad: una importación no debería competir sin límites con una generación de documentos, y un proceso que espera red no necesariamente necesita la misma concurrencia que uno intensivo en CPU. Separar colas ayuda a aplicar límites sin esconder la saturación.',
          'El mensaje debe transportar lo necesario para localizar el trabajo, no una copia enorme de todos los datos. Un identificador de exportación, una versión de parámetros y referencias autorizadas suelen ser más manejables que incluir archivos o colecciones completas. El worker vuelve a leer el estado permitido, comprueba que la tarea sigue siendo válida y confirma el mensaje en un momento coherente con la política de entrega elegida.',
        ],
        points: [
          'Definir una tarea con entrada pequeña, versión identificable y resultado persistido.',
          'Separar colas cuando cambien la prioridad, el recurso limitante o el tipo de worker.',
          'Acordar si la confirmación ocurre al recibir o después de completar el trabajo.',
        ],
      },
      {
        heading: 'Reintentos, idempotencia y fallos',
        paragraphs: [
          'Un reintento solo es útil si el error puede desaparecer. Un timeout de un servicio externo puede justificar varios intentos con backoff exponencial acotado, mientras que un esquema inválido o un permiso revocado necesita una corrección, no más tráfico. Los límites de tiempo por tarea y por llamada impiden que un worker quede bloqueado indefinidamente, y el jitter evita que muchos reintentos se sincronicen.',
          'La entrega de un mensaje puede provocar duplicados cuando un worker termina el efecto pero falla antes de confirmar. Por ello, la operación debe usar una clave de idempotencia o una transición de estado que rechace una segunda ejecución equivalente. Los errores permanentes pueden terminar en una cola de mensajes muertos con contexto suficiente para revisión manual. Marcar una tarea como fallida es más honesto que ocultarla en reintentos infinitos.',
        ],
      },
      {
        heading: 'Observabilidad y operación',
        paragraphs: [
          'El identificador de tarea debe acompañar a los logs y, cuando la petición originó el trabajo, también al identificador de correlación. Así se puede seguir el recorrido desde el `202` inicial hasta el resultado o el fallo. La profundidad de la cola muestra cantidad, pero la edad del mensaje más antiguo revela mejor si los usuarios están esperando más de lo previsto.',
          'Las métricas deben ayudar a decidir una acción: tasa de éxito y fallo, duración, reintentos, workers activos, saturación del recurso y cantidad de mensajes muertos. Una alerta basada solo en profundidad puede dispararse por un pico breve; combinarla con edad y duración aporta contexto. Los paneles y procedimientos deben indicar cuándo aumentar capacidad, pausar publicaciones o enviar un caso a revisión.',
        ],
      },
      {
        heading: 'Ejemplo: generar una exportación',
        paragraphs: [
          'El cliente solicita una exportación y la API valida filtros, crea un registro en estado `pendiente` y publica una tarea que contiene el identificador de ese registro. La respuesta es `202` y devuelve el task ID junto con una URL de consulta. El cliente no interpreta ese código como si el archivo ya existiera: sabe que debe consultar el estado o esperar una notificación definida por el producto.',
          'Celery consume la tarea, cambia el estado a `procesando` con una transición idempotente y lee los datos autorizados por páginas. Escribe el resultado en una ubicación temporal, actualiza el progreso que sea útil y, al finalizar, registra la referencia descargable y la fecha de expiración. Si una fuente externa falla de forma transitoria, reintenta dentro del límite; si los parámetros son inválidos, marca `fallida` con un mensaje accionable.',
          'La ruta de estado devuelve `pendiente`, `procesando`, `completada` o `fallida` sin inventar un resultado. Una descarga comprueba autorización y que el archivo sigue disponible. Si el worker recibe el mismo mensaje otra vez, encuentra el estado ya completado y no genera una segunda exportación. La cola, el registro persistido y la API forman así un flujo único que se puede explicar al usuario.',
        ],
        points: [
          'Solicitud → registro pendiente → `202` con identificador de tarea.',
          'RabbitMQ → Celery: consumo, transición idempotente y lectura por páginas.',
          'Resultado persistido → consulta de estado → descarga autorizada.',
          'Error transitorio → reintento acotado; error permanente → fallo visible o revisión.',
        ],
      },
    ],
    takeaway: [
      'Una cola es una herramienta para hacer explícito el tiempo y el fallo, no una promesa de ejecución mágica. Diseñar esa conversación con honestidad permite operar y comunicar cada estado.',
    ],
  },
  {
    id: 'infraestructura-distribuida-latencia',
    category: 'Infraestructura distribuida',
    tags: ['Infraestructura', 'Latencia', 'Sistemas distribuidos', 'Resiliencia'],
    title: 'Infraestructura distribuida y latencia',
    excerpt:
      'Criterios para operar servidores en distintas ubicaciones y cuidar la fiabilidad y la experiencia de usuario.',
    isSample: true,
    introduction: [
      'Añadir servidores en distintas regiones puede acercar el cómputo a los usuarios, pero también introduce más decisiones que una simple copia de la aplicación. Aparecen enlaces de red imperfectos, datos que deben coordinarse, rutas que pueden cambiar y operaciones que han de diagnosticar varios lugares a la vez. La distribución es útil cuando resuelve un problema medido; no es un sustituto de entender el recorrido de una petición.',
      'La latencia percibida tampoco es una sola cifra. Incluye resolución de nombres, conexión y TLS, procesamiento de aplicación, consultas, saltos entre regiones y transferencia de la respuesta. Un promedio puede ocultar una cola lenta o una dependencia que falla para una parte de los usuarios. Por eso el diseño debe tratar latencia, disponibilidad y consistencia como decisiones relacionadas, con límites observables.',
    ],
    sections: [
      {
        heading: 'La latencia es un presupuesto',
        paragraphs: [
          'Descomponer una petición ayuda a descubrir dónde se consume el tiempo. DNS y la conexión inicial tienen un coste, igual que el establecimiento de TLS, la lógica de aplicación y cada consulta a una base de datos. Una llamada síncrona a otra región añade ida y vuelta y puede repetirse si una capa intermedia encadena servicios. Si cada equipo mide solo su componente, el presupuesto completo queda sin dueño.',
          'Los percentiles p95 y p99 muestran la cola de experiencias lentas que el promedio oculta. No hace falta inventar un objetivo universal para usarlos: basta con relacionar cada ruta con una expectativa del producto y observar qué componente explica sus peores casos. También conviene distinguir latencia del cliente, del servidor y de las dependencias para no resolver con más regiones un problema que está en una consulta o en una respuesta demasiado grande.',
        ],
      },
      {
        heading: 'Ubicar cómputo y datos',
        paragraphs: [
          'El cómputo puede acercarse al usuario, pero los datos tienen gravedad: moverlos, replicarlos y mantener sus permisos cuesta. Una región cercana para lecturas no resuelve automáticamente dónde debe vivir una escritura. Hay que decidir quién es dueño de cada cambio, cómo se ordenan conflictos y qué ocurre si la réplica está temporalmente retrasada. Las restricciones legales y operativas también pueden limitar la ubicación válida.',
          'Una topología con demasiadas llamadas cruzadas se vuelve difícil de razonar. Si una petición local necesita una cadena síncrona de servicios y bases remotas, el usuario queda expuesto a cada enlace. Es preferible agrupar operaciones relacionadas, leer desde una réplica adecuada o aceptar un modelo de consistencia explícito cuando el dominio lo permite. La proximidad solo aporta valor si no se anula con dependencias conversacionales.',
        ],
      },
      {
        heading: 'Diseñar para enlaces imperfectos',
        paragraphs: [
          'Los timeouts deben existir en cada frontera y ser compatibles con el presupuesto de la petición. Un timeout demasiado largo retiene recursos; uno demasiado corto convierte una respuesta lenta pero válida en una cascada de reintentos. Los reintentos deben ser acotados, usar backoff y jitter, y aplicarse solo a operaciones seguras o idempotentes. Repetir una escritura no protegida puede agravar el fallo original.',
          'Un circuit breaker puede dejar de llamar temporalmente a una dependencia que está fallando y permitir que el sistema se recupere. El enrutamiento debe considerar la salud real de cada región, no solo que el proceso responda a un chequeo superficial. Cuando una dependencia no está disponible, la degradación puede consistir en servir una caché, ocultar una función secundaria o devolver un estado pendiente; nunca debería presentar datos inventados como si estuvieran confirmados.',
        ],
      },
      {
        heading: 'Consistencia, caché y enrutamiento',
        paragraphs: [
          'La consistencia fuerte simplifica ciertas lecturas, pero puede exigir coordinación remota y aumentar el tiempo de respuesta. La consistencia eventual reduce esa coordinación, a cambio de que una lectura observe un estado anterior durante un intervalo. La decisión depende del dato: un perfil puede tolerar retraso controlado, mientras que una autorización o un saldo puede necesitar una fuente de verdad más estricta.',
          'Las cachés y las réplicas de lectura requieren reglas de invalidación y un dueño claro del enrutamiento. La afinidad puede evitar cambios de región innecesarios, pero también concentra tráfico cuando una ubicación deja de estar sana. Una ruta de escritura debe saber dónde confirmar el cambio y una ruta de lectura debe comunicar, de manera visible para el sistema, si acepta una réplica retrasada. La complejidad no desaparece por ponerla detrás de un balanceador.',
        ],
      },
      {
        heading: 'Ejemplo: una petición entre regiones',
        paragraphs: [
          'Consideremos una petición cuyo usuario entra por la región más cercana. En una opción, el servicio local valida la solicitud, consulta una caché local y realiza un único salto controlado hacia el dueño de los datos. La respuesta indica si el dato está confirmado y las métricas separan el tiempo local del tiempo remoto. Si ese salto falla, la aplicación puede devolver una respuesta degradada o un estado pendiente definido por el producto.',
          'En otra opción, el servicio local llama de forma síncrona a un servicio remoto, que llama a una base de datos de una tercera ubicación y después consulta una integración adicional. La cadena acumula tiempos de red y expone la petición a más probabilidades de timeout. Aunque el promedio parezca aceptable, el p95 y el p99 pueden empeorar cuando cualquier enlace tiene una cola lenta; una tasa de error creciente también puede provocar reintentos que saturen más la cadena.',
          'La comparación no decide por sí sola qué topología es correcta. Hay que observar el recorrido completo, el comportamiento con enlaces degradados, el coste de mantener réplicas y la consistencia que necesita cada operación. Un diseño distribuido puede elegir el primer patrón para lecturas tolerantes a retraso y reservar la coordinación fuerte para las escrituras que realmente la necesitan.',
        ],
        points: [
          'Entrada cercana → validación local → una dependencia remota explícita.',
          'Presupuesto separado para DNS, conexión, aplicación, datos y transferencia.',
          'p95/p99, tasa de error y saturación observados junto con el promedio.',
          'Fallback o estado pendiente definido antes de que un enlace falle.',
        ],
      },
    ],
    takeaway: [
      'La mejor topología es la que hace explícitos sus saltos, sus límites de consistencia y sus respuestas ante fallos, y luego demuestra con observaciones que esos compromisos benefician al recorrido real.',
    ],
  },
]
