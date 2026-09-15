export const specializationUrl = 'https://www.coursera.org/specializations/generative-ai-engineering-with-llms'

// Course order and scope checked against IBM's public Coursera syllabus on 2026-09-07.
// Availability controls published content, not course completion or certification.
export const learningCourses = [
  {
    id: 'curso-1', title: 'Arquitecturas y preparación de datos',
    available: true,
    officialTitle: 'Generative AI and LLMs: Architecture and Data Preparation',
    url: 'https://www.coursera.org/learn/generative-ai-llm-architecture-data-preparation',
    question: '¿Cómo se convierte una frase en datos?',
    description: 'Un modelo trabaja con números. Para darle una frase como «La IA aprende patrones», primero hay que dividirla en pequeñas piezas y asignarles identificadores. Este curso presenta distintas formas de crear modelos generativos y enseña a preparar el texto para trabajar con él en PyTorch.',
    ideas: [
      ['Tokens: las piezas del texto', 'Un token puede ser una palabra, parte de ella o un signo. El tokenizador decide dónde cortar: por eso una frase de cinco palabras puede tener más de cinco tokens.'],
      ['Vocabulario: un número para cada pieza', 'Es la tabla que relaciona cada token con un ID. Ese número sirve para encontrarlo, como el número de una ficha. Dos IDs consecutivos no tienen por qué representar palabras parecidas.'],
      ['Batches: varios ejemplos a la vez', 'Un batch es un grupo de ejemplos que el modelo procesa juntos. Si agrupamos 32 frases, el batch size es 32. Trabajar así permite aprovechar el cálculo en paralelo.'],
      ['Padding: completar los huecos', 'Para agrupar frases de distinta longitud, añadimos tokens de relleno a las más cortas. Ese relleno se llama padding. Una máscara marca qué posiciones son relleno para que el modelo pueda ignorarlas.'],
    ],
    concepts: ['tokenizacion-y-vocabulario', 'datos-y-clasificacion'],
  },
  {
    id: 'curso-2', title: 'Representaciones y modelos de lenguaje',
    available: true,
    officialTitle: 'Gen AI Foundational Models for NLP & Language Understanding',
    url: 'https://www.coursera.org/learn/gen-ai-foundational-models-for-nlp-and-language-understanding',
    question: '¿Cómo aprende un modelo qué palabras encajan?',
    description: 'Contar palabras da algunas pistas, pero el orden y el contexto cambian lo que dice una frase. Este curso pasa de formas sencillas de representar el texto a embeddings y modelos que aprenden a predecir cómo continúa. La idea es entender qué información conserva cada opción.',
    ideas: [
      ['Bag of words: contar palabras', 'Una bolsa de palabras anota cuántas veces aparece cada palabra. Las dos frases del ejemplo tienen los mismos recuentos, aunque en una persigue el gato y en la otra el perro. Para distinguirlas hace falta conservar el orden.'],
      ['Embeddings: aprender relaciones', 'Un embedding es una lista de números, o vector, asociada a un token. Esos números se ajustan al entrenar: pueden acercar las representaciones de palabras que aparecen en contextos parecidos.'],
      ['Contexto: lo que viene antes', 'Después de «Me he puesto el», varias palabras podrían encajar. Si antes hablamos de frío, «abrigo» parece más probable. Un modelo de lenguaje aprende a asignar probabilidades al siguiente token usando el contexto disponible.'],
    ],
    concepts: ['embeddings', 'modelos-de-lenguaje', 'evaluacion-de-modelos'],
  },
  {
    id: 'curso-3', title: 'Transformers y atención',
    available: true,
    officialTitle: 'Generative AI Language Modeling with Transformers',
    url: 'https://www.coursera.org/learn/generative-ai-language-modeling-with-transformers',
    question: '¿Cómo se relacionan las palabras de una frase?',
    description: 'En «Me senté en el banco del parque», la palabra «parque» ayuda a interpretar «banco». La atención permite que el modelo combine información de distintos tokens para representarlos en su contexto. Este curso explica cómo lo hace un transformer y cómo se usa para tareas como clasificar textos o traducir.',
    ideas: [
      ['Posición: dónde está cada token', 'Las mismas palabras en otro orden pueden decir algo distinto. El transformer incorpora información sobre la posición de cada token para poder tener en cuenta ese orden.'],
      ['Atención: cuánto aporta cada token', 'Para actualizar la representación de un token, el modelo calcula cuánto peso dar a la información de los demás tokens disponibles. Esos pesos determinan cómo se combina el contexto.'],
      ['Máscara: qué información está disponible', 'Al entrenar un modelo para continuar un texto, ocultamos los tokens futuros: no debe ver la respuesta que está intentando predecir. Esta regla se llama máscara causal. En otras tareas puede utilizarse la frase completa.'],
    ],
    concepts: ['transformers-y-atencion'],
  },
  {
    id: 'curso-4', title: 'Adaptar un modelo a una tarea',
    available: true,
    officialTitle: 'Generative AI Engineering and Fine-Tuning Transformers',
    url: 'https://www.coursera.org/learn/generative-ai-engineering-and-fine-tuning-transformers',
    question: '¿Qué cambia cuando ajustas un modelo?',
    description: 'El siguiente paso del programa es trabajar con modelos preentrenados: cargarlos, ejecutar inferencia y adaptarlos con ejemplos de una tarea. Introduce el ajuste eficiente de parámetros, con métodos como LoRA y QLoRA, usando Hugging Face y PyTorch.',
    ideas: [
      ['Inferencia', 'Se utiliza el modelo para obtener una salida, sin actualizar sus pesos.'],
      ['Fine-tuning', 'Los ejemplos de entrenamiento modifican parámetros para adaptar su comportamiento.'],
      ['LoRA', 'Se entrenan matrices pequeñas de adaptación mientras los pesos base permanecen congelados.'],
    ],
    flow: [['Modelo base', 'Pesos preentrenados'], ['Adaptación', 'Ejemplos de la tarea'], ['Validación', 'Datos separados']],
    takeaway: 'Adaptar requiere medir: mejorar en los ejemplos de entrenamiento no demuestra una mejora en datos nuevos.',
    concepts: [],
  },
  {
    id: 'curso-5', title: 'Instrucciones y preferencias',
    available: false,
    officialTitle: 'Generative AI Advanced Fine-Tuning for LLMs',
    url: 'https://www.coursera.org/learn/generative-ai-advanced-fine-tuning-for-llms',
    question: '¿Cómo se enseña qué respuesta se prefiere?',
    description: 'Este curso aborda el ajuste con instrucciones y señales de preferencia. El programa incluye modelos de recompensa, aprendizaje por refuerzo con feedback humano, PPO y optimización directa de preferencias (DPO).',
    ideas: [
      ['Demostraciones', 'Los pares de instrucción y respuesta muestran el comportamiento deseado.'],
      ['Preferencias', 'Comparar dos respuestas aporta una señal distinta a dar una única respuesta de ejemplo.'],
      ['Objetivo', 'DPO utiliza pares de preferencia; un enfoque con PPO puede optimizar una señal de recompensa.'],
    ],
    flow: [['Una instrucción', 'La misma pregunta'], ['Dos respuestas', 'Comparar alternativas'], ['Una preferencia', 'Señal para el ajuste']],
    takeaway: 'La calidad de la señal importa: una respuesta preferida no equivale automáticamente a una respuesta verdadera.',
    concepts: [],
  },
  {
    id: 'curso-6', title: 'RAG, herramientas y agentes',
    available: false,
    officialTitle: 'Fundamentals of AI Agents Using RAG and LangChain',
    url: 'https://www.coursera.org/learn/fundamentals-of-ai-agents-using-rag-and-langchain',
    question: '¿Cómo se conecta un modelo con información externa?',
    description: 'El programa pasa del modelo aislado a una aplicación: prompts, aprendizaje en contexto y componentes de LangChain. RAG recupera información para incorporarla a la consulta; las herramientas permiten que un agente solicite acciones o datos durante una tarea.',
    ideas: [
      ['Recuperar', 'Buscar fragmentos relevantes reduce la cantidad de documentos que entran en el contexto.'],
      ['Contextualizar', 'La pregunta y las fuentes recuperadas se envían juntas al modelo.'],
      ['Herramientas', 'La aplicación ejecuta las llamadas permitidas y devuelve sus resultados al modelo.'],
    ],
    flow: [['Pregunta', 'Qué necesita el usuario'], ['Recuperación', 'Fragmentos relevantes'], ['Respuesta', 'Generación con contexto']],
    takeaway: 'RAG aporta información durante la consulta; no implica reentrenar el modelo ni garantiza que use bien las fuentes.',
    concepts: [],
  },
  {
    id: 'curso-7', title: 'Una aplicación de preguntas y respuestas',
    available: false,
    officialTitle: 'Project: Generative AI Applications with RAG and LangChain',
    url: 'https://www.coursera.org/learn/project-generative-ai-applications-with-rag-and-langchain',
    question: '¿Cómo se unen todas las piezas?',
    description: 'El proyecto final del programa reúne carga de documentos, división en fragmentos, embeddings, una base vectorial y un recuperador. Una interfaz con Gradio permite consultar el sistema de preguntas y respuestas construido con LangChain.',
    ideas: [
      ['Preparación', 'Cargar, dividir e indexar los documentos que servirán como fuente.'],
      ['Consulta', 'Recuperar fragmentos y construir el contexto para generar una respuesta.'],
      ['Comprobación', 'Revisar respuestas, fuentes y casos en los que los documentos no contienen la información.'],
    ],
    flow: [['Documentos', 'Fragmentos y embeddings'], ['Índice vectorial', 'Búsqueda por consulta'], ['Interfaz', 'Pregunta, respuesta y fuentes']],
    takeaway: 'Es el proyecto previsto de la especialización. Ainkii es un proyecto personal independiente.',
    concepts: [],
  },
] as const

export const conceptCourseHref = (id: string) => {
  const course = learningCourses.find(course => (course.concepts as readonly string[]).includes(id))
  if (!course) throw new Error(`Concept has no course: ${id}`)
  return `/aprendizaje/#${course.id}`
}
