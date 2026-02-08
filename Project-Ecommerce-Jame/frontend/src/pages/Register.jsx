import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SuccessModal } from '../components/ui/SuccessModal';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        bio: '',
    });
    const [error, setError] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                bio: formData.bio
            });
            setSuccessModalOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || t('auth.registrationFailed'));
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[85vh] py-8">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold gradient-text">{t('auth.createAccount')}</h2>
                    <p className="text-gray-600 mt-2">{t('auth.joinMessage')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label={t('auth.fullName')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t('auth.namePlaceholder')}
                    />
                    <Input
                        label={t('auth.email')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t('auth.emailPlaceholder')}
                    />
                    <Input
                        label={t('auth.password')}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder={t('auth.createPasswordPlaceholder')}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('auth.bio')}
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 resize-none"
                            placeholder={t('auth.bioPlaceholder')}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-6">
                        {t('auth.createAccountButton')}
                    </Button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    {t('auth.hasAccount')}{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                        {t('auth.signInButton')}
                    </Link>
                </p>
            </Card>

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => navigate('/login')}
                title="สมัครสมาชิกสำเร็จ"
                message="บัญชีของคุณถูกสร้างเรียบร้อยแล้ว กรุณาเข้าสู่ระบบเพื่อใช้งาน"
                buttonText="ตกลง"
            />
        </div>
    );
}
