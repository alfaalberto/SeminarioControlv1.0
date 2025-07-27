import React, { useEffect, useState, useMemo } from 'react';
import { db, firebase } from '../firebase/config';
import { Evaluation, Student } from '../types';
import { useAuth } from '../AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    change?: string;
    iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, change, iconBgColor }) => (
    <div className="bg-white p-5 rounded-xl shadow-premium flex items-center space-x-4">
        <div className={`p-4 rounded-lg ${iconBgColor}`}>
            <i className={`fa-solid ${icon} text-white text-xl`}></i>
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-premium-lg border border-slate-100">
                <p className="text-xs text-slate-500">{`Evaluación ${label}`}</p>
                <p className="text-sm font-bold text-slate-800">{`Calificación: ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};


const Dashboard: React.FC = () => {
    const { user } = useAuth();
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
            console.error("Error al cargar estudiantes del dashboard:", error);
            studentsLoaded = true;
            updateLoadingState();
        });

        const unsubscribeEvals = db.collection('evaluations').orderBy("date", "desc").onSnapshot(snapshot => {
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
            console.error("Error al cargar evaluaciones del dashboard:", error);
            evalsLoaded = true;
            updateLoadingState();
        });

        return () => {
            unsubscribeStudents();
            unsubscribeEvals();
        };
    }, []);
    
    const recentEvaluations = useMemo(() => {
        return evaluations.slice(0, 5).map(ev => ({
            ...ev,
            studentName: students.find(s => s.id === ev.studentId)?.name || 'N/A'
        }));
    }, [evaluations, students]);
    
    const performanceTrendData = useMemo(() => {
        // Take the 10 most recent evaluations, reverse them for chronological order in the chart
        return evaluations.slice(0, 10).reverse().map((ev, index) => ({
            name: index + 1,
            score: ev.finalScore,
        }));
    }, [evaluations]);
    
    if (loading) {
        return <div className="text-center p-10">Cargando datos...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">¡Bienvenido de nuevo, {user?.name.split(' ')[0]}!</h2>
                <p className="text-slate-500 mt-1">Aquí tienes un resumen de la actividad reciente.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon="fa-chart-line" label="Evaluaciones Totales" value={evaluations.length} change="Desde el inicio" iconBgColor="bg-blue-500" />
                <StatCard icon="fa-users" label="Estudiantes Activos" value={students.length} change="En el sistema" iconBgColor="bg-green-500" />
                <StatCard icon="fa-hourglass-half" label="Pendientes (Demo)" value={5} change="Para revisión final" iconBgColor="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-premium">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad Reciente</h3>
                    <div className="overflow-x-auto">
                        {recentEvaluations.length > 0 ? (
                             <table className="min-w-full">
                                <thead >
                                    <tr>
                                        <th className="pb-4 pt-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiante</th>
                                        <th className="pb-4 pt-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Semestre</th>
                                        <th className="pb-4 pt-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Calificación</th>
                                        <th className="pb-4 pt-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEvaluations.map(evaluation => (
                                        <tr key={evaluation.id} className="border-b border-slate-100 last:border-b-0">
                                            <td className="py-3 pr-3 whitespace-nowrap text-sm font-medium text-slate-900">{evaluation.studentName}</td>
                                            <td className="py-3 px-3 whitespace-nowrap text-sm text-slate-500">{evaluation.semester}</td>
                                            <td className="py-3 px-3 whitespace-nowrap text-sm text-slate-500">
                                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${evaluation.finalScore >= 8 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {evaluation.finalScore.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 pl-3 whitespace-nowrap text-sm text-slate-500">{new Date(evaluation.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <i className="fa-solid fa-folder-open text-4xl mb-4 text-slate-300"></i>
                                <p>No hay actividad reciente para mostrar.</p>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-premium">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tendencia de Desempeño</h3>
                    <p className="text-sm text-slate-500 mb-4 -mt-3">Últimas {performanceTrendData.length} evaluaciones</p>
                     <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={performanceTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                            <YAxis domain={[0, 10]} tick={{fontSize: 12}} stroke="#94a3b8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="score" name="Calificación" stroke="#4338ca" strokeWidth={2} dot={{ r: 4, fill: '#4338ca' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;