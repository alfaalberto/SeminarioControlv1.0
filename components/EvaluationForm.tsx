import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase/config';
import { saveEvaluation } from '../services/firestoreService';
import { generateFeedback } from '../services/geminiService';
import { Student, EvaluationScore, Criterion } from '../types';
import { SEMESTERS, EVALUATION_CRITERIA } from '../constants';
import { useAuth } from '../AuthContext';
import { useToast } from '../App';

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-block ml-2" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      <i className="fa-regular fa-circle-question text-slate-400 cursor-pointer"></i>
      {visible && (
        <div className="absolute z-10 w-64 p-3 -mt-2 transform -translate-x-1/2 left-1/2 bg-slate-800 text-white text-xs rounded-lg shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

const ScoreCircularProgress: React.FC<{ score: number }> = ({ score }) => {
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 10) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="text-slate-200" fill="transparent" stroke="currentColor" />
                <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="text-indigo-600" fill="transparent" stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{score.toFixed(2)}</span>
                <span className="text-xs text-slate-500">/ 10.00</span>
            </div>
        </div>
    );
};

const EvaluationForm: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>(SEMESTERS[0]);
  const [scores, setScores] = useState<EvaluationScore[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  
  useEffect(() => {
    setIsLoadingStudents(true);
    const unsubscribe = db.collection('students').orderBy('name').onSnapshot(
        (querySnapshot) => {
            const studs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
            setStudents(studs);
            setIsLoadingStudents(false);
        },
        (error) => {
            console.error("Error fetching students for form: ", error);
            addToast("Error al cargar la lista de estudiantes", "error");
            setIsLoadingStudents(false);
        }
    );
    return () => unsubscribe();
  }, [addToast]);

  const currentCriteria = useMemo(() => EVALUATION_CRITERIA[selectedSemester] || [], [selectedSemester]);

  const resetForm = useCallback(() => {
    setScores(currentCriteria.map(c => ({ criterionId: c.id, score: 0 })));
    setFeedback('');
  }, [currentCriteria]);

  useEffect(() => {
    resetForm();
  }, [selectedSemester, selectedStudentId, resetForm]);

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores(prev => prev.map(s => s.criterionId === criterionId ? { ...s, score: value } : s));
  };
  
  const finalScore = useMemo(() => {
    return scores.reduce((acc, scoreItem) => {
      const criterion = currentCriteria.find(c => c.id === scoreItem.criterionId);
      return acc + (criterion ? scoreItem.score * (criterion.weight / 100) : 0);
    }, 0);
  }, [scores, currentCriteria]);

  const handleGenerateFeedback = useCallback(async () => {
    if (!selectedStudentId) {
      addToast('Por favor, selecciona un estudiante.', 'error');
      return;
    }
    setIsGenerating(true);
    setFeedback('');
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
        const evaluationData = { studentId: selectedStudentId, semester: selectedSemester, scores, finalScore };
        const generatedText = await generateFeedback(student, evaluationData, currentCriteria);
        setFeedback(generatedText);
    }
    setIsGenerating(false);
  }, [selectedStudentId, students, selectedSemester, scores, finalScore, currentCriteria, addToast]);

  const handleSaveEvaluation = async () => {
      if (!selectedStudentId) {
          addToast('Por favor, selecciona un estudiante.', 'error');
          return;
      }
      if (!user) {
          addToast('Error de autenticación. Por favor, inicie sesión de nuevo.', 'error');
          return;
      }
      setIsSaving(true);
      try {
        const evaluationData = { studentId: selectedStudentId, professorId: user.id, semester: selectedSemester, scores, finalScore };
        await saveEvaluation(evaluationData);
        addToast('Evaluación guardada exitosamente.', 'success');
        setSelectedStudentId('');
        setSelectedSemester(SEMESTERS[0]);
        // The scores will reset automatically due to the useEffect watching selectedStudentId
      } catch(error) {
        addToast('Error al guardar la evaluación. Inténtalo de nuevo.', 'error');
        console.error(error);
      } finally {
        setIsSaving(false);
      }
  };

  const isFormComplete = selectedStudentId && scores.every(s => s.score > 0);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <style>{`
            input[type=range].custom-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: #4f46e5;
                cursor: pointer;
                border-radius: 50%;
                margin-top: -8px;
            }
            input[type=range].custom-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #4f46e5;
                cursor: pointer;
                border-radius: 50%;
            }
        `}</style>
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-premium">
          <h2 className="text-xl font-bold text-slate-900">Detalles de la Evaluación</h2>
          <p className="mt-1 text-sm text-slate-600">Selecciona un estudiante y un semestre para comenzar.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-slate-700">Estudiante</label>
              <select id="student" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={isLoadingStudents} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-slate-50">
                <option value="">{isLoadingStudents ? 'Cargando...' : 'Selecciona un estudiante...'}</option>
                {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-slate-700">Semestre</label>
              <select id="semester" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {SEMESTERS.map(semester => <option key={semester} value={semester}>{semester}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-premium">
          <h3 className="text-xl font-bold text-slate-900">Criterios de Evaluación (0-10)</h3>
          <div className="space-y-6 mt-6">
            {currentCriteria.map((criterion: Criterion) => {
              const scoreValue = scores.find(s => s.criterionId === criterion.id)?.score ?? 0;
              return (
                <div key={criterion.id}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      {criterion.name} ({criterion.weight}%)
                      <InfoTooltip text={criterion.description} />
                    </label>
                    <span className="text-sm font-semibold text-indigo-600 w-12 text-right">{scoreValue.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0" max="10" step="0.5" value={scoreValue} onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value))} disabled={!selectedStudentId} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer custom-slider disabled:opacity-50 disabled:cursor-not-allowed"/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-1 space-y-8 lg:sticky top-8">
        <div className="bg-white p-8 rounded-xl shadow-premium text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Calificación Final</h3>
            <div className='flex justify-center'>
                <ScoreCircularProgress score={finalScore} />
            </div>
             <button
                onClick={handleSaveEvaluation}
                disabled={!isFormComplete || isSaving}
                className="w-full mt-6 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isSaving ? 'Guardando...' : 'Guardar Evaluación'}
            </button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-premium">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Retroalimentación con IA</h3>
            <button onClick={handleGenerateFeedback} disabled={!isFormComplete || isGenerating} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                {isGenerating ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Generando...</>) : (<><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Generar Retroalimentación</>)}
            </button>
            {feedback && (
                <div className="mt-6 p-4 bg-slate-50 rounded-md border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">Sugerencia de Retroalimentación:</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{feedback}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;