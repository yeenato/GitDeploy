import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, FolderKanban, LogOut, ArrowLeft, Globe } from 'lucide-react';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';

export default function AdminSidebar() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t, language, changeLanguage } = useLanguage();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    const toggleLanguage = () => {
        changeLanguage(language === 'en' ? 'th' : 'en');
    };

    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), end: true },
        { to: '/admin/categories', icon: FolderKanban, label: t('admin.categories') },
        { to: '/admin/products', icon: Package, label: t('admin.manageProducts') },
        { to: '/admin/users', icon: Users, label: t('admin.users') },
    ];

    return (
        <div className="w-64 min-h-screen glass-effect border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold gradient-text">{t('admin.panelTitle')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('admin.marketplaceManagement')}</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-indigo-50'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                    onClick={toggleLanguage}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                    <Globe className="w-5 h-5" />
                    <span>{language === 'en' ? 'ภาษาไทย' : 'English'}</span>
                </button>
                <Link
                    to="/"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>{t('admin.backToSite')}</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span>{t('navbar.logout')}</span>
                </button>
            </div>
            
            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                        <h3 className="text-lg font-semibold mb-2 text-center text-gray-900">
                            {t('navbar.confirmLogoutTitle')}
                        </h3>
                        <p className="text-gray-600 text-center mb-6 text-sm">
                            {t('navbar.confirmLogoutMessage')}
                        </p>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1 justify-center"
                                onClick={() => setIsLogoutModalOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button 
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white justify-center border-red-600"
                                onClick={confirmLogout}
                            >
                                {t('common.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
