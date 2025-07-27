import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { addStudent } from '../services/firestoreService';
import { Student } from '../types';
import { useAuth } from '../AuthContext';
import { useToast } from '../App';

const StudentsPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentMatricula, setNewStudentMatricula] = useState('');

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.collection('students').orderBy('name').onSnapshot(
            (querySnapshot) => {
                const studs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
                setStudents(studs);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching students: ", error);
                addToast("Error al cargar los estudiantes.", 'error');
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [addToast]);

    const handleAddStudent = async () => {
        if (newStudentName.trim() && newStudentMatricula.trim()) {
            setIsSaving(true);
            try {
                await addStudent(newStudentName, newStudentMatricula);
                // No need to refresh list, onSnapshot handles it
                setIsModalOpen(false);
                setNewStudentName('');
                setNewStudentMatricula('');
                addToast('Estudiante agregado exitosamente', 'success');
            } catch (error) {
                addToast('Error al agregar el estudiante.', 'error');
            } finally {
                setIsSaving(false);
            }
        } else {
            addToast('Por favor, completa todos los campos.', 'error');
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10">Cargando estudiantes...</div>;
        }
        if (students.length === 0) {
            return <div className="text-center py-10 text-slate-500">No hay estudiantes registrados.</div>;
        }
        return (
            <>
                {/* Mobile Card View */}
                <div className="divide-y divide-slate-100 lg:hidden">
                    {students.map(student => (
                        <div key={student.id} className="p-4">
                            <p className="font-medium text-slate-900">{student.name}</p>
                            <p className="text-sm text-slate-500">{student.matricula}</p>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-slate-200">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0">Nombre Completo</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Matrícula</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">{student.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{student.matricula}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-premium">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Lista de Estudiantes</h3>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 text-sm font-medium shadow-sm"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span className="hidden sm:inline">Agregar Estudiante</span>
                    </button>
                )}
            </div>
            {renderContent()}
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity" onClick={() => setIsModalOpen(false)}>
                    <div className="relative bg-white rounded-xl shadow-premium-lg w-full max-w-md p-8 transform transition-all" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Agregar Nuevo Estudiante</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre completo" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="w-full px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="text" placeholder="Matrícula (ej. A01234567)" value={newStudentMatricula} onChange={(e) => setNewStudentMatricula(e.target.value)} className="w-full px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-4 py-2 bg-slate-100 text-slate-800 text-sm font-medium rounded-md hover:bg-slate-200 focus:outline-none disabled:opacity-50">
                                Cancelar
                            </button>
                             <button onClick={handleAddStudent} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none flex items-center disabled:bg-indigo-400">
                                {isSaving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                                {isSaving ? 'Guardando...' : 'Guardar Estudiante'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;