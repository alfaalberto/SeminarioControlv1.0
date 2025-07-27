import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NavItem: React.FC<{ to: string; icon: string; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => {
    const baseClasses = "flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors duration-200";
    const activeClass = "bg-slate-700 text-white font-semibold shadow-md";
    const inactiveClass = "text-slate-600 hover:bg-slate-200 hover:text-slate-800";

    return (
        <NavLink
            to={to}
            end
            onClick={onClick}
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClass : inactiveClass}`}
        >
            <i className={`fa-solid ${icon} w-6 text-center text-lg`}></i>
            <span className="mx-4 text-sm font-medium">{label}</span>
        </NavLink>
    );
};

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();

    const handleNavClick = () => {
        if (window.innerWidth < 1024) { // Tailwind's 'lg' breakpoint
            setIsOpen(false);
        }
    };
    
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside className={`flex flex-col w-64 h-screen py-6 bg-white border-r border-slate-200 fixed top-0 left-0 lg:static z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between px-6 mb-8">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-md">
                            S
                        </div>
                        <div className='ml-3'>
                            <h2 className="text-md font-bold text-slate-800">Seminario SEPI</h2>
                            <p className='text-xs text-slate-500'>M.C. Ing. Electrónica</p>
                        </div>
                    </div>
                     <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                <div className="flex flex-col justify-between flex-1 mt-4">
                    <nav className='space-y-2'>
                        <NavItem to="/" icon="fa-table-columns" label="Panel" onClick={handleNavClick} />
                        <NavItem to="/evaluar" icon="fa-file-pen" label="Evaluar" onClick={handleNavClick} />
                        <NavItem to="/reportes" icon="fa-chart-pie" label="Reportes" onClick={handleNavClick} />
                        {user?.role === 'admin' && (
                            <>
                                <div className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Administración
                                </div>
                                <NavItem to="/estudiantes" icon="fa-user-graduate" label="Estudiantes" onClick={handleNavClick} />
                                <NavItem to="/profesores" icon="fa-user-tie" label="Profesores" onClick={handleNavClick} />
                            </>
                        )}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;