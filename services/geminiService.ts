
import { GoogleGenAI } from "@google/genai";
import { Evaluation, Student, Criterion } from '../types';

if (!process.env.API_KEY) {
    console.warn("La variable de entorno API_KEY no está configurada. Las funciones de Gemini estarán deshabilitadas.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateFeedback = async (
    student: Student,
    evaluation: Omit<Evaluation, 'id' | 'date' | 'professorId'>,
    criteria: Criterion[]
): Promise<string> => {

    if (!process.env.API_KEY) {
        return "Error: La API_KEY de Gemini no está configurada. Por favor, contacta al administrador.";
    }
    
    const scoresText = evaluation.scores.map(score => {
        const criterion = criteria.find(c => c.id === score.criterionId);
        return `- ${criterion?.name || 'Criterio Desconocido'} (${criterion?.weight}%): ${score.score.toFixed(1)}/10.0`;
    }).join('\n');

    const prompt = `
        Eres un profesor universitario experimentado y constructivo, especializado en programas de maestría en ingeniería.
        Tu tarea es generar un informe de retroalimentación detallado y personalizado para un estudiante basado en la evaluación de su presentación de seminario.

        **Instrucciones:**
        1.  Comienza con un saludo cordial dirigido al estudiante por su nombre.
        2.  Menciona que esta es la retroalimentación para su presentación del ${evaluation.semester}.
        3.  Analiza el desempeño del estudiante basándote en los siguientes criterios y calificaciones (escala 0-10):
            ${scoresText}
        4.  La calificación final ponderada fue: ${evaluation.finalScore.toFixed(2)}/10.0.
        5.  **Estructura del feedback:**
            *   **Fortalezas:** Identifica 2-3 áreas donde el estudiante demostró un buen desempeño. Sé específico y relaciona tus comentarios con los criterios mejor calificados. Usa un tono alentador.
            *   **Áreas de Oportunidad:** Identifica 2-3 áreas clave que necesitan mejora. Sé constructivo y específico, basándote en los criterios con calificaciones más bajas. Ofrece sugerencias concretas o preguntas que guíen al estudiante a reflexionar y mejorar.
            *   **Recomendaciones Generales:** Proporciona uno o dos consejos generales para su próximo seminario o para el avance de su tesis.
            *   **Cierre:** Termina con una nota positiva y motivadora.

        **Estudiante:** ${student.name}
        **Semestre:** ${evaluation.semester}
        
        Genera el informe de retroalimentación. Sé profesional, claro y conciso.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        return "Ocurrió un error al generar la retroalimentación. Por favor, inténtalo de nuevo más tarde.";
    }
};