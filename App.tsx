

import React, { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EvaluationForm from './components/EvaluationForm';
import ReportsPage from './components/ReportsPage';
import StudentsPage from './components/StudentsPage';
import ProfessorsPage from './components/ProfessorsPage';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import FirstAdminSetup from './components/FirstAdminSetup';
import { FIREBASE_PROJECT_ID } from './firebase/config';

// --- Toast Notification System ---
type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

interface ToastContextType {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe ser usado dentro de un ToastProvider');
  return context;
};

const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({ toasts }) => {
    return (
        <div className="fixed bottom-5 right-5 z-[100] w-80 space-y-3">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

const Toast: React.FC<ToastMessage> = ({ message, type }) => {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
  };
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }
  return (
    <div className={`flex items-center p-4 rounded-lg shadow-premium-lg text-white ${colors[type]} animate-fade-in-up`}>
      <i className={`fa-solid ${icons[type]} mr-3 text-xl`}></i>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};


// --- Main App Layout ---
const routeTitles: { [key: string]: string } = {
  '/': 'Panel de Control',
  '/evaluar': 'Evaluar Seminario',
  '/reportes': 'Reportes de Desempeño',
  '/estudiantes': 'Gestión de Estudiantes',
  '/profesores': 'Gestión de Profesores',
  '/settings': 'Ajustes',
};

const ProtectedAppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const currentTitle = routeTitles[location.pathname] || 'Panel de Control';
  
  const handleLogout = async () => {
      await logout();
      navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 z-30">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-slate-600">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800">{currentTitle}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-offset-2 ring-slate-300">
                           {user?.name.charAt(0).toUpperCase()}
                        </button>
                        {dropdownOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-premium-lg py-1 z-20"
                                onMouseLeave={() => setDropdownOpen(false)}
                            >
                                <div className="px-4 py-3">
                                    <p className="font-semibold text-sm text-slate-800 truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize mt-1">{user?.role}</p>
                                </div>
                                <div className="border-t border-slate-100"></div>
                                <Link
                                    to="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <i className="fa-solid fa-cog w-5 text-slate-500"></i>
                                    <span>Ajustes</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <i className="fa-solid fa-arrow-right-from-bracket w-5 text-slate-500"></i>
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/evaluar" element={<EvaluationForm />} />
                <Route path="/reportes" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {user?.role === 'admin' && (
                    <>
                        <Route path="/estudiantes" element={<StudentsPage />} />
                        <Route path="/profesores" element={<ProfessorsPage />} />
                    </>
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
      </main>
    </div>
  );
};


// --- App Router ---
const App: React.FC = () => {
    const { user, loading, firestoreError, isFirstRun } = useAuth();

    if (firestoreError?.code === 'unavailable') {
        return <FirestoreUnavailableError />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600">Cargando...</p>
                </div>
            </div>
        );
    }
    
    if (isFirstRun && !user) {
        return <FirstAdminSetup />;
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
                <RequireAuth>
                    <ProtectedAppLayout />
                </RequireAuth>
            } />
        </Routes>
    );
};

// --- Authentication Guard ---
const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
    let { user } = useAuth();
    let location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// --- Firestore Unavailable Error Component ---
const FirestoreUnavailableError: React.FC = () => {
    const { retryInitialization, loading } = useAuth();
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-900 p-4">
            <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-premium-lg border-t-4 border-red-500">
                <div className="text-center">
                    <i className="fa-solid fa-tower-broadcast text-5xl text-red-500 mb-4"></i>
                    <h1 className="text-2xl font-extrabold text-slate-900">Error de Conexión Persistente</h1>
                    <p className="mt-2 text-md text-slate-600">
                        La aplicación no puede conectar con la base de datos de Firebase.
                    </p>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mt-8">
                    <p className="font-bold"><i className="fa-solid fa-circle-check mr-2"></i>¡Tu configuración es correcta!</p>
                    <p className="text-sm mt-1">
                        Has configurado el proyecto de Firebase correctamente. Este error persistente casi siempre se debe a un problema de red externo que bloquea la conexión.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <p className="font-semibold pt-4 text-slate-800 text-center">Diagnóstico de Red: ¿Qué puedes revisar?</p>

                    <ul className="list-disc list-outside space-y-3 text-slate-700 pl-5">
                        <li>
                            <span className="font-bold">Firewall o Antivirus:</span> Revisa si algún software de seguridad en tu computadora está bloqueando las conexiones a `firestore.googleapis.com`.
                        </li>
                        <li>
                            <span className="font-bold">Red Corporativa o VPN:</span> Si estás en una red de trabajo o usando una VPN, es posible que tengan reglas de seguridad estrictas. Intenta conectarte desde otra red (como los datos de tu móvil) para confirmar.
                        </li>
                         <li>
                            <span className="font-bold">Servidor Proxy:</span> Algunas configuraciones de red usan un proxy que puede interferir con la conexión segura de Firebase.
                        </li>
                    </ul>

                    <div className="text-center pt-4 flex items-center justify-center gap-4">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg shadow-sm hover:bg-slate-300 transition-colors"
                        >
                            Recargar Página
                        </button>
                        <button 
                            onClick={retryInitialization} 
                            disabled={loading}
                            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-400 disabled:cursor-wait"
                        >
                            {loading ? (
                                <><svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Reintentando...</>
                            ) : (
                                <><i className="fa-solid fa-rotate-right mr-2"></i> Reintentar Conexión</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default App;