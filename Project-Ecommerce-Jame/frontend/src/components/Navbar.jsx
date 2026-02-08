import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BACKEND_ORIGIN } from '../config';
import { LogOut, User, ShoppingBag, PlusCircle, Shield, MessageCircle, Home as HomeIcon, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { t, language, changeLanguage } = useLanguage();
    const navigate = useNavigate();
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

    return (
        <nav className="glass-effect sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain transition-transform duration-200 group-hover:scale-105" />
                            <span className="text-2xl font-bold gradient-text hidden sm:block">DENCHAI MARKETPLACE</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button 
                            variant="ghost" 
                            onClick={toggleLanguage}
                            className="flex items-center px-2 py-1"
                        >
                            <Globe className="w-5 h-5 mr-1" />
                            <span className="font-medium">{language.toUpperCase()}</span>
                        </Button>

                        {user ? (
                            <>
                                <Link to="/" className="text-gray-700 hover:text-indigo-600 flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                                    <HomeIcon className="w-5 h-5 mr-2" />
                                    <span className="hidden sm:inline">{t('navbar.browse')}</span>
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className="text-purple-600 hover:text-purple-700 flex items-center px-3 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium">
                                        <Shield className="w-5 h-5 mr-2" />
                                        <span className="hidden sm:inline">{t('navbar.adminPanel')}</span>
                                    </Link>
                                )}
                                <Link to="/chat" className="text-gray-700 hover:text-indigo-600 flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    <span className="hidden sm:inline">{t('navbar.messages')}</span>
                                </Link>
                                <Link to="/my-items" className="text-gray-700 hover:text-indigo-600 flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                                    <ShoppingBag className="w-5 h-5 mr-2" />
                                    <span className="hidden sm:inline">{t('navbar.myItems')}</span>
                                </Link>
                                <Link to="/post-item" className="text-gray-700 hover:text-indigo-600 flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    <span className="hidden sm:inline">{t('navbar.post')}</span>
                                </Link>
                                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium">
                                    <div className="mr-2 flex items-center gap-1">
                                        <Avatar 
                                            name={user.name} 
                                            src={user.profileImage ? `${BACKEND_ORIGIN}${user.profileImage}` : null} 
                                            size="sm" 
                                            showOnlineStatus={false}
                                            className="w-6 h-6 text-xs" 
                                        />
                                        {user.role === 'ADMIN' && (
                                            <Shield className="w-3 h-3 text-purple-600" />
                                        )}
                                    </div>
                                    <span className="hidden sm:inline">{t('navbar.profile')}</span>
                                </Link>
                                <Button variant="outline" onClick={handleLogout} className="flex items-center text-sm">
                                    <LogOut className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">{t('navbar.logout')}</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/">
                                    <Button variant="secondary" className="text-sm">{t('navbar.browse')}</Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" className="text-sm">{t('navbar.login')}</Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="text-sm">{t('navbar.register')}</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                        <h3 className="text-lg font-semibold mb-2 text-center">
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
        </nav>
    );
}
