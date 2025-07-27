
import React, { useState } from 'react';
import { createFirstAdmin } from '../services/firestoreService';
import { useToast } from '../App';

const FirstAdminSetup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conflictError, setConflictError] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        addToast("La contraseña debe tener al menos 6 caracteres.", "error");
        return;
    }
    setIsLoading(true);
    setConflictError(false);

    try {
        await createFirstAdmin(name, email, password);
        addToast('¡Cuenta de administrador creada! Ya puedes iniciar sesión.', 'success');
        window.location.reload();
    } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            setConflictError(true);
        } else {
            addToast('Ocurrió un error al crear la cuenta.', 'error');
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (conflictError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50 p-4">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-premium-lg border-t-4 border-amber-500">
            <div className="text-center">
                <i className="fa-solid fa-user-shield text-5xl text-amber-500 mb-4"></i>
                <h1 className="text-2xl font-extrabold text-slate-900">Conflicto de Usuario Detectado</h1>
                <p className="mt-2 text-md text-slate-600">
                    Ya existe un usuario con el correo electrónico <strong className="font-semibold">{email}</strong> en el sistema de autenticación de Firebase.
                </p>
            </div>
            
            <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg">
                <p className="font-bold"><i className="fa-solid fa-lightbulb mr-2"></i>¿Por qué ocurre esto?</p>
                <p className="text-sm mt-1">
                    Esto suele suceder si un intento anterior de crear el administrador falló después de crear el usuario de autenticación pero antes de crear su perfil en la base de datos de la aplicación.
                </p>
            </div>

            <p className="font-semibold pt-4 text-slate-800">Pasos para Solucionarlo:</p>
            <ol className="list-decimal list-inside space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700">
                <li>Abre la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">Consola de Firebase</a>.</li>
                <li>Ve a la sección <strong>Construir</strong> &gt; <strong>Authentication</strong>.</li>
                <li>En la pestaña <strong>Users</strong>, busca y elimina la cuenta con el correo <strong className="font-semibold">{email}</strong>.</li>
                <li>Vuelve aquí y haz clic en "Reintentar" para crear la cuenta de nuevo.</li>
            </ol>
            
            <div className="text-center pt-4">
                <button 
                    onClick={() => {
                        setConflictError(false);
                        setPassword('');
                    }} 
                    className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow-sm hover:bg-amber-700 transition-colors"
                >
                    <i className="fa-solid fa-arrow-rotate-left mr-2"></i>
                    Reintentar
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-premium-lg">
        <div className="text-center">
            <div className="inline-block w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-4xl mb-4 shadow-md">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Configuración Inicial</h1>
            <p className="mt-2 text-md text-slate-600">¡Bienvenido! Como esta es la primera vez que se ejecuta la aplicación, creemos tu cuenta de administrador.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
              <input type="text" placeholder="Nombre completo del Administrador" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800 mt-6">
            <p><i className="fa-solid fa-shield-halved mr-2"></i>
            Después de crear esta cuenta, te recomendamos <strong className="font-semibold">ajustar las reglas de seguridad</strong> en tu consola de Firebase para restringir el acceso.</p>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isLoading || !email || !password || !name} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta de Administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstAdminSetup;
