import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || t('auth.loginFailed'));
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[85vh]">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold gradient-text">{t('auth.welcomeBack')}</h2>
                    <p className="text-gray-600 mt-2">{t('auth.signInTitle')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t('auth.emailPlaceholder')}
                    />
                    <Input
                        label={t('auth.password')}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={t('auth.passwordPlaceholder')}
                    />
                    <Button type="submit" className="w-full mt-6">
                        {t('auth.signInButton')}
                    </Button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    {t('auth.noAccount')}{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                        {t('auth.signUpButton')}
                    </Link>
                </p>
            </Card>
        </div>
    );
}
