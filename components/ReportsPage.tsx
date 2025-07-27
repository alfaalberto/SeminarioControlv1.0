import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db, firebase } from '../firebase/config';
import { Evaluation, Student } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-premium-lg border border-slate-100">
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-sm text-indigo-600">{`${payload[0].name}: ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};

const ReportsPage: React.FC = () => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let studentsLoaded = false;
        let evalsLoaded = false;

        const updateLoadingState = () => {
            if (studentsLoaded && evalsLoaded) {
                setLoading(false);
            }
        };

        const unsubscribeStudents = db.collection('students').onSnapshot(snapshot => {
            const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
            setStudents(studentsData);
            studentsLoaded = true;
            updateLoadingState();
        }, error => {
            console.error("Error al cargar estudiantes para reportes:", error);
            studentsLoaded = true;
            updateLoadingState();
        });

        const unsubscribeEvals = db.collection('evaluations').onSnapshot(snapshot => {
            const evalsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: (data.date as firebase.firestore.Timestamp).toDate().toISOString(),
                } as Evaluation;
            });
            setEvaluations(evalsData);
            evalsLoaded = true;
            updateLoadingState();
        }, error => {
            console.error("Error al cargar evaluaciones para reportes:", error);
            evalsLoaded = true;
            updateLoadingState();
        });

        return () => {
            unsubscribeStudents();
            unsubscribeEvals();
        };
    }, []);

    const studentAverageScores = useMemo(() => {
        const studentScores: { [key: string]: { totalScore: number; count: number } } = {};

        evaluations.forEach(evaluation => {
            if (!studentScores[evaluation.studentId]) {
                studentScores[evaluation.studentId] = { totalScore: 0, count: 0 };
            }
            studentScores[evaluation.studentId].totalScore += evaluation.finalScore;
            studentScores[evaluation.studentId].count += 1;
        });

        return students.map(student => {
            const data = studentScores[student.id];
            return {
                name: student.name.split(' ').slice(0, 2).join(' '), // Use first name + first last name
                averageScore: data ? data.totalScore / data.count : 0,
            };
        }).filter(item => item.averageScore > 0);
    }, [evaluations, students]);
    
    const semesterAverageScores = useMemo(() => {
        const semesterScores: { [key: string]: { totalScore: number; count: number } } = {};

        evaluations.forEach(evaluation => {
            if (!semesterScores[evaluation.semester]) {
                semesterScores[evaluation.semester] = { totalScore: 0, count: 0 };
            }
            semesterScores[evaluation.semester].totalScore += evaluation.finalScore;
            semesterScores[evaluation.semester].count += 1;
        });
        
        return Object.keys(semesterScores).map(semester => ({
            name: semester.replace(' Semestre', 'S'),
            averageScore: semesterScores[semester].totalScore / semesterScores[semester].count,
        }));
    }, [evaluations]);

    if (loading) {
        return <div className="text-center p-10">Generando reportes...</div>;
    }

    if (evaluations.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <i className="fa-solid fa-chart-pie text-6xl mb-4 text-slate-300"></i>
                <h2 className="text-2xl font-bold mb-2">No hay datos para reportes</h2>
                <p>Realiza algunas evaluaciones para poder generar los reportes.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-premium">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Promedio por Estudiante</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={studentAverageScores}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis domain={[0, 10]} tick={{fontSize: 12}} stroke="#94a3b8"/>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                        <Bar dataKey="averageScore" name="Calificación Promedio" fill="#4338ca" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-premium">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Promedio por Semestre</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={semesterAverageScores}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8"/>
                        <YAxis domain={[0, 10]} tick={{fontSize: 12}} stroke="#94a3b8"/>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240, 253, 244, 0.5)' }} />
                        <Bar dataKey="averageScore" name="Calificación Promedio" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReportsPage;