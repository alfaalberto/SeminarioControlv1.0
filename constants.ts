
import { SemesterCriteria } from './types';

export const SEMESTERS = [
  'Primer Semestre',
  'Segundo Semestre',
  'Tercer Semestre',
  'Cuarto Semestre',
  'Quinto Semestre',
];

export const EVALUATION_CRITERIA: SemesterCriteria = {
  'Primer Semestre': [
    { id: '1-1', name: 'Definición del Problema', weight: 20, description: 'Claridad y delimitación del problema de investigación.' },
    { id: '1-2', name: 'Revisión del Estado del Arte', weight: 25, description: 'Profundidad y pertinencia de la literatura revisada.' },
    { id: '1-3', name: 'Justificación y Relevancia', weight: 20, description: 'Importancia del problema y contribución potencial.' },
    { id: '1-4', name: 'Hipótesis u Objetivo General', weight: 15, description: 'Coherencia y claridad de la hipótesis o el objetivo.' },
    { id: '1-5', name: 'Viabilidad Técnica y Académica', weight: 20, description: 'Factibilidad del proyecto con los recursos y tiempo disponibles.' },
  ],
  'Segundo Semestre': [
    { id: '2-1', name: 'Marco Teórico Profundizado', weight: 20, description: 'Solidez y profundidad del marco teórico que sustenta la investigación.' },
    { id: '2-2', name: 'Metodología', weight: 25, description: 'Claridad, adecuación y rigor del diseño metodológico propuesto.' },
    { id: '2-3', name: 'Modelo Analítico o Computacional', weight: 20, description: 'Desarrollo y coherencia del modelo a utilizar.' },
    { id: '2-4', name: 'Avances Prácticos o Simulados', weight: 20, description: 'Resultados preliminares obtenidos y su análisis inicial.' },
    { id: '2-5', name: 'Plan de Trabajo Ajustado', weight: 15, description: 'Ajustes y realismo del plan de trabajo para las siguientes etapas.' },
  ],
  'Tercer Semestre': [
    { id: '3-1', name: 'Implementación Técnica/Prototipo', weight: 25, description: 'Calidad y avance de la implementación o prototipo desarrollado.' },
    { id: '3-2', name: 'Análisis Intermedio de Resultados', weight: 25, description: 'Profundidad del análisis de los resultados obtenidos hasta la fecha.' },
    { id: '3-3', name: 'Comparación con Estado del Arte', weight: 15, description: 'Análisis comparativo de los resultados con trabajos relacionados.' },
    { id: '3-4', name: 'Identificación de Problemas Técnicos', weight: 15, description: 'Capacidad para identificar y proponer soluciones a problemas encontrados.' },
    { id: '3-5', name: 'Comunicación Técnica y Visual', weight: 20, description: 'Claridad en la presentación de avances y resultados.' },
  ],
  'Cuarto Semestre': [
    { id: '4-1', name: 'Resultados Completos y Validados', weight: 30, description: 'Presentación y validación de los resultados finales de la investigación.' },
    { id: '4-2', name: 'Discusión y Contribución Científica', weight: 25, description: 'Análisis profundo de los resultados y su aporte al conocimiento.' },
    { id: '4-3', name: 'Redacción de Artículos o Tesis', weight: 20, description: 'Avance y calidad en la redacción de productos científicos.' },
    { id: '4-4', name: 'Publicaciones/Divulgación', weight: 15, description: 'Esfuerzos y logros en la divulgación de la investigación.' },
    { id: '4-5', name: 'Preparación para Defensa', weight: 10, description: 'Madurez y preparación del trabajo para la defensa de tesis.' },
  ],
  'Quinto Semestre': [
    { id: '5-1', name: 'Diagnóstico de Retrasos', weight: 20, description: 'Justificación clara y fundamentada de la necesidad de extensión.' },
    { id: '5-2', name: 'Plan de Recuperación', weight: 25, description: 'Plan de trabajo detallado y realista para concluir la tesis.' },
    { id: '5-3', name: 'Nuevos Avances Técnicos', weight: 20, description: 'Resultados concluyentes adicionales obtenidos durante la extensión.' },
    { id: '5-4', name: 'Impacto de la Ampliación', weight: 15, description: 'Análisis del impacto de los nuevos resultados en la contribución final.' },
    { id: '5-5', name: 'Compromiso Académico', weight: 20, description: 'Demostración de un compromiso claro para la finalización del grado.' },
  ],
};
