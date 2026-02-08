import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BACKEND_ORIGIN } from '../config';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SuccessModal } from '../components/ui/SuccessModal';
import { User, Mail, Edit2, Check, X, Camera, MapPin, Phone, Shield } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

export default function Dashboard() {
    const { user, loading } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phoneNumber: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                bio: user.bio || '',
                phoneNumber: user.phoneNumber || '',
            });
            setImagePreview(user.profileImage ? `${BACKEND_ORIGIN}${user.profileImage}` : null);
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const initiateSubmit = (e) => {
        e.preventDefault();
        setConfirmModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('bio', formData.bio);
            data.append('phoneNumber', formData.phoneNumber);
            if (imageFile) {
                data.append('profileImage', imageFile);
            }

            await api.put('/users/me', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsEditing(false);
            setConfirmModalOpen(false);
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('dashboard.myProfile')}</h1>
                <p className="text-gray-600">{t('dashboard.manageAccount')}</p>
            </div>

            <Card>
                {!isEditing ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                            <Avatar 
                                name={user?.name} 
                                src={user?.profileImage ? `${BACKEND_ORIGIN}${user.profileImage}` : null} 
                                size="3xl" 
                                className="mb-4 shadow-xl"
                            />
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                                {user?.role === 'ADMIN' && (
                                    <Shield className="w-6 h-6 text-purple-600" />
                                )}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mt-2">
                                {user?.role}
                            </span>
                        </div>

                        <div className="flex items-start space-x-4 pb-6 border-b border-gray-100">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 rounded-2xl">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.fullName')}</h3>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{user?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 pb-6 border-b border-gray-100">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.email')}</h3>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 pb-6 border-b border-gray-100">
                            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 rounded-2xl">
                                <Phone className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.phoneNumber') || 'Phone Number'}</h3>
                                <p className="text-xl font-semibold text-gray-900 mt-1">{user?.phoneNumber || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl">
                                <Edit2 className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.bio')}</h3>
                                <p className="text-lg text-gray-700 mt-1">{user?.bio || t('dashboard.noBio')}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                                <Edit2 className="w-4 h-4 mr-2" />
                                {t('dashboard.editProfile')}
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/addresses')} className="w-full sm:w-auto">
                                <MapPin className="w-4 h-4 mr-2" />
                                {t('address.manageAddresses')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={initiateSubmit} className="space-y-6">
                        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                            <div 
                                className="relative group cursor-pointer" 
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar 
                                    name={formData.name} 
                                    src={imagePreview} 
                                    size="3xl" 
                                    className="mb-4 shadow-xl group-hover:opacity-75 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <p className="text-sm text-gray-500">{t('dashboard.changePhoto')}</p>
                        </div>

                        <Input
                            label={t('dashboard.fullName')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label={t('dashboard.phoneNumber') || 'Phone Number'}
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            required
                            placeholder="0xx-xxx-xxxx"
                        />
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('dashboard.bio')}
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 resize-none"
                                placeholder={t('dashboard.tellUs')}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button type="submit" className="flex-1 sm:flex-initial">
                                <Check className="w-4 h-4 mr-2" />
                                {t('dashboard.saveChanges')}
                            </Button>
                            <Button variant="secondary" onClick={() => setIsEditing(false)} type="button" className="flex-1 sm:flex-initial">
                                <X className="w-4 h-4 mr-2" />
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmUpdate}
                title={t('dashboard.confirmUpdate')}
                message={t('dashboard.confirmUpdateDesc')}
                confirmText={t('common.save')}
                cancelText={t('common.cancel')}
                isLoading={isSubmitting}
            />

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => {
                    setSuccessModalOpen(false);
                    window.location.reload();
                }}
                title="แก้ไขข้อมูลสำเร็จ"
                message="ข้อมูลส่วนตัวของคุณถูกอัปเดตเรียบร้อยแล้ว"
                buttonText="ตกลง"
            />
        </div>
    );
}
