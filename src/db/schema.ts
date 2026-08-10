import { pgTable, serial, integer, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

// --- Módulo 1: Candidatos (Híbrido JSONB) ---

export const candidatos = pgTable('candidatos', {
  id_hoja_vida: integer('id_hoja_vida').primaryKey(),
  expediente: text('expediente'),
  documento: text('documento'),
  nombre_completo: text('nombre_completo').notNull(),
  partido_politico: text('partido_politico').notNull(),
  tipo_eleccion: text('tipo_eleccion'),
  cargo: text('cargo'),
  
  // Geografía
  departamento: text('departamento'),
  provincia: text('provincia'),
  distrito: text('distrito'),
  
  // Archivos (URLs)
  foto_url: text('foto_url'),
  hoja_vida_url: text('hoja_vida_url'),
  plan_gobierno_url: text('plan_gobierno_url'),
  
  // Bloques JSONB Anidados
  datos_personales: jsonb('datos_personales'),
  experiencia_laboral: jsonb('experiencia_laboral'),
  formacion_academica: jsonb('formacion_academica'),
  cargos_y_renuncias: jsonb('cargos_y_renuncias'), // Para cargos eleccion, partidarios y renuncias
  bienes_y_rentas: jsonb('bienes_y_rentas'),       // Para ingresos, inmuebles y muebles
  sentencias: jsonb('sentencias'),                 // Penales y obligaciones
  info_adicional: jsonb('info_adicional'),

  // --- Módulo 2: Inteligencia Artificial (IA) ---
  ia_resumen_hoja_vida: text('ia_resumen_hoja_vida'),
  ia_resumen_plan_gobierno: text('ia_resumen_plan_gobierno'),
});

export const planes_gobierno = pgTable('planes_gobierno', {
  expediente: text('expediente').primaryKey(),
  partido_politico: text('partido_politico'),
  tipo_eleccion: text('tipo_eleccion'),
  dimension_social: jsonb('dimension_social'),
  dimension_institucional: jsonb('dimension_institucional'),
  dimension_economica: jsonb('dimension_economica'),
  dimension_territorial_ambiental: jsonb('dimension_territorial_ambiental'),
  resumen_ia: text('resumen_ia'),
});

// --- Módulo 3: Usuarios y Match Electoral ---

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  nombre: text('nombre'),
  creado_en: timestamp('creado_en').defaultNow(),
});

export const cuestionario_match = pgTable('cuestionario_match', {
  id: serial('id').primaryKey(),
  pregunta: text('pregunta').notNull(),
  categoria: text('categoria'),
});

export const respuestas_candidato = pgTable('respuestas_candidato', {
  id: serial('id').primaryKey(),
  id_candidato: integer('id_candidato').references(() => candidatos.id_hoja_vida, { onDelete: 'cascade' }),
  id_pregunta: integer('id_pregunta').references(() => cuestionario_match.id, { onDelete: 'cascade' }),
  valor: integer('valor').notNull(), // Ej: 1 a 5 (Muy en desacuerdo a Muy de acuerdo)
});

export const respuestas_usuario = pgTable('respuestas_usuario', {
  id: serial('id').primaryKey(),
  id_usuario: uuid('id_usuario').references(() => usuarios.id, { onDelete: 'cascade' }),
  id_pregunta: integer('id_pregunta').references(() => cuestionario_match.id, { onDelete: 'cascade' }),
  valor: integer('valor').notNull(),
});


// --- Módulo 4: Sondeos y Encuestas ---

export const sondeos = pgTable('sondeos', {
  id: serial('id').primaryKey(),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion'),
  fecha_inicio: timestamp('fecha_inicio').defaultNow(),
  fecha_cierre: timestamp('fecha_cierre'),
  activo: integer('activo').default(1), // 1: activo, 0: inactivo
});

export const sondeo_opciones = pgTable('sondeo_opciones', {
  id: serial('id').primaryKey(),
  id_sondeo: integer('id_sondeo').references(() => sondeos.id, { onDelete: 'cascade' }),
  texto_opcion: text('texto_opcion').notNull(), // Nombre de candidato, o "Voto Blanco/Viciado"
  id_candidato: integer('id_candidato').references(() => candidatos.id_hoja_vida, { onDelete: 'set null' }), // Opcional, si la opción es un candidato específico
});

export const votos = pgTable('votos', {
  id: serial('id').primaryKey(),
  id_sondeo: integer('id_sondeo').references(() => sondeos.id, { onDelete: 'cascade' }),
  id_opcion: integer('id_opcion').references(() => sondeo_opciones.id, { onDelete: 'cascade' }),
  id_usuario: uuid('id_usuario').references(() => usuarios.id, { onDelete: 'cascade' }),
});
