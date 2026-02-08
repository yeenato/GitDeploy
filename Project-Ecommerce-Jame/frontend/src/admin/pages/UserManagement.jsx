import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

export default function UserManagement() {
    const { t, language } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        action: null,
        data: null,
        isDestructive: false
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            console.log('Admin UserManagement fetched:', data);
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error('API returned non-array data:', data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.action) return;
        
        setActionLoading(true);
        try {
            if (confirmModal.action === 'toggleRole') {
                const { userId, role } = confirmModal.data;
                await api.patch(`/admin/users/${userId}/role`, { role });
                setSuccessMessage(role === 'ADMIN' ? 'เปลี่ยนสิทธิ์ผู้ใช้เป็นแอดมินสำเร็จ' : 'เปลี่ยนสิทธิ์ผู้ใช้เป็นสมาชิกทั่วไปสำเร็จ');
            } else if (confirmModal.action === 'delete') {
                const { userId } = confirmModal.data;
                await api.delete(`/admin/users/${userId}`);
                setSuccessMessage('ลบผู้ใช้สำเร็จ');
            }
            await fetchUsers();
            handleCloseModal();
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Action failed', error);
            if (error.response?.status === 400) {
                alert(error.response.data.message);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const initiateToggleRole = (userId, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        setConfirmModal({
            isOpen: true,
            title: t('admin.confirmChangeRole'),
            message: `${t('admin.confirmChangeRole')} ${newRole}?`,
            action: 'toggleRole',
            data: { userId, role: newRole },
            isDestructive: false
        });
    };

    const initiateDelete = (userId) => {
        setConfirmModal({
            isOpen: true,
            title: t('admin.confirmDeleteUser'),
            message: t('admin.confirmDeleteUser'),
            action: 'delete',
            data: { userId },
            isDestructive: true
        });
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('admin.userManagement')}</h1>
                <p className="text-gray-600">{t('admin.manageUserRoles')}</p>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-4 font-semibold">{t('admin.id')}</th>
                                <th className="text-left p-4 font-semibold">{t('admin.name')}</th>
                                <th className="text-left p-4 font-semibold">{t('auth.email')}</th>
                                <th className="text-left p-4 font-semibold">{t('admin.role')}</th>
                                <th className="text-left p-4 font-semibold">{t('admin.product')}</th>
                                <th className="text-left p-4 font-semibold">{t('admin.joined')}</th>
                                <th className="text-right p-4 font-semibold">{t('admin.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4">
                                        <span className="font-medium text-gray-600">#{user.id}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <div className={`p-2 rounded-lg ${user.role === 'ADMIN' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}>
                                                {user.role === 'ADMIN' ? (
                                                    <Shield className="w-4 h-4 text-white" />
                                                ) : (
                                                    <UserIcon className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-gray-600">{user.email}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${user.role === 'ADMIN'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                            {user._count?.products || 0}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-gray-600 text-sm">
                                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: language === 'th' ? th : enUS })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => initiateToggleRole(user.id, user.role)}
                                                className="text-sm py-1.5"
                                            >
                                                <Shield className="w-4 h-4 mr-1" />
                                                {user.role === 'ADMIN' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => initiateDelete(user.id)}
                                                className="text-sm py-1.5"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                {t('common.delete')}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                isLoading={actionLoading}
            />

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title="ดำเนินการสำเร็จ"
                message={successMessage}
                buttonText="ตกลง"
            />
        </div>
    );
}
