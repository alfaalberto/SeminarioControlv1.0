
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../App';
import { db, auth } from '../firebase/config';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-premium">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [name, setName] = useState(user?.name || '');
    const [isNameSaving, setIsNameSaving] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    const handleNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) {
            addToast('El nombre no puede estar vacío.', 'error');
            return;
        }
        setIsNameSaving(true);
        try {
            await db.collection('users').doc(user.id).update({ name: name.trim() });
            addToast('Nombre actualizado exitosamente.', 'success');
        } catch (error) {
            console.error("Error updating name:", error);
            addToast('Error al actualizar el nombre.', 'error');
        } finally {
            setIsNameSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            addToast('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            addToast('Las contraseñas no coinciden.', 'error');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            addToast('No se pudo encontrar el usuario actual.', 'error');
            return;
        }

        setIsPasswordSaving(true);
        try {
            await currentUser.updatePassword(password);
            setPassword('');
            setConfirmPassword('');
            addToast('Contraseña actualizada exitosamente.', 'success');
        } catch (error: any) {
            console.error("Error updating password:", error);
            addToast(`Error al actualizar la contraseña. Es posible que deba volver a iniciar sesión.`, 'error');
        } finally {
            setIsPasswordSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <SettingsCard title="Información del Perfil">
                <form onSubmit={handleNameUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre Completo</label>
                    <div className="sm:col-span-2 flex items-center gap-4">
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" disabled={isNameSaving || name === user?.name} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed whitespace-nowrap">
                            {isNameSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </SettingsCard>

            <SettingsCard title="Seguridad">
                <form onSubmit={handlePasswordUpdate}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-4">
                         <label htmlFor="new-password" className="text-sm font-medium text-slate-700">Nueva Contraseña</label>
                         <div className="sm:col-span-2">
                            <input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                         </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
                        <div className="sm:col-span-2">
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                         <button type="submit" disabled={isPasswordSaving || !password || !confirmPassword} className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isPasswordSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </SettingsCard>
        </div>
    );
};

export default SettingsPage;
