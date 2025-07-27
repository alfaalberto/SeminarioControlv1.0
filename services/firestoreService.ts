

import { db, auth, firebase } from '../firebase/config';
import { Student, Professor, Evaluation } from '../types';

// --- Colecciones ---
const usersCollection = db.collection('users');
const studentsCollection = db.collection('students');
const evaluationsCollection = db.collection('evaluations');


// --- Funciones de Usuario (Profesores/Admin) ---
export const createFirstAdmin = async (name: string, email: string, password: string): Promise<Professor> => {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;

        if (!newUser) {
            throw new Error("La creación del usuario en Firebase Auth falló.");
        }

        const adminDoc = {
            name,
            email,
            role: 'admin' as const
        };
        
        await usersCollection.doc(newUser.uid).set(adminDoc);


        return {
            id: newUser.uid,
            ...adminDoc
        };

    } catch (error) {
        console.error("Error al crear el primer administrador:", error);
        throw error;
    }
};

export const addProfessor = async (name: string, email: string, password: string): Promise<Professor> => {
    try {
        // 1. Crear usuario en Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;

        if (!newUser) {
            throw new Error("La creación del usuario en Firebase Auth falló.");
        }

        // 2. Crear documento de profesor en Firestore
        const professorDoc = {
            name,
            email,
            role: 'professor' as const
        };
        // Usamos setDoc para establecer el UID de Auth como ID del documento en Firestore.
        // Esto es CRÍTICO para que el sistema de autenticación funcione correctamente.
        await usersCollection.doc(newUser.uid).set(professorDoc);

        return {
            id: newUser.uid,
            ...professorDoc
        };

    } catch (error) {
        console.error("Error al agregar profesor:", error);
        // Aquí podrías manejar la eliminación del usuario de Auth si falla la creación en Firestore
        throw error;
    }
};

// --- Funciones de Estudiantes ---
export const addStudent = async (name: string, matricula: string): Promise<Student> => {
    try {
        const docRef = await studentsCollection.add({ name, matricula });
        return { id: docRef.id, name, matricula };
    } catch (error) {
        console.error("Error al agregar estudiante:", error);
        throw error;
    }
};

// --- Funciones de Evaluaciones ---
export const saveEvaluation = async (evaluationData: Omit<Evaluation, 'id' | 'date'>): Promise<Evaluation> => {
    try {
        const dataToSave = {
            ...evaluationData,
            date: firebase.firestore.Timestamp.now(),
        };
        const docRef = await evaluationsCollection.add(dataToSave);
        return {
            id: docRef.id,
            ...evaluationData,
            date: dataToSave.date.toDate().toISOString(),
        };
    } catch (error) {
        console.error("Error al guardar la evaluación:", error);
        throw error;
    }
};
