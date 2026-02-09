import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const categoryKeyMap = {
    'Electronics': 'electronics',
    'Fashion': 'fashion',
    'Books': 'books',
    'Home & Living': 'homeLiving',
    'Beauty & Personal Care': 'beautyPersonalCare',
    'Sports & Outdoors': 'sportsOutdoors',
    'Toys & Games': 'toysGames',
    'Automotive': 'automotive',
    'Health & Wellness': 'healthWellness',
    'Collectibles & Art': 'collectiblesArt',
    'Pets': 'pets',
    'Food & Beverages': 'foodBeverages',
    'Stationery': 'stationery'
};

export default function CategoryManagement() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
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

    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/categories');
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/categories', formData);
            setFormData({ name: '', description: '' });
            fetchCategories();
            setSuccessMessage('เพิ่มหมวดหมู่สำเร็จ');
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to create category', error);
        }
    };

    const handleEdit = async (id) => {
        try {
            const category = categories.find(c => c.id === id);
            await api.put(`/admin/categories/${id}`, category);
            setEditingId(null);
            fetchCategories();
            setSuccessMessage('แก้ไขหมวดหมู่สำเร็จ');
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to update category', error);
        }
    };

    const handleCloseModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.action) return;
        
        setActionLoading(true);
        try {
            if (confirmModal.action === 'delete') {
                const { id } = confirmModal.data;
                await api.delete(`/admin/categories/${id}`);
                fetchCategories();
                setSuccessMessage('ลบหมวดหมู่สำเร็จ');
                setSuccessModalOpen(true);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Action failed', error);
        } finally {
            setActionLoading(false);
        }
    };

    const initiateDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: t('admin.confirmDeleteCategory'),
            message: t('admin.actionCannotUndone'),
            action: 'delete',
            data: { id },
            isDestructive: true
        });
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('admin.categoryManagement')}</h1>
                <p className="text-gray-600">{t('admin.manageCategoriesDesc')}</p>
            </div>

            {/* Add Category Form */}
            <Card className="mb-8">
                <h3 className="text-xl font-bold mb-4">{t('admin.addNewCategory')}</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={t('admin.categoryName')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g., Electronics"
                        />
                        <Input
                            label={t('product.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="e.g., Electronic devices and gadgets"
                        />
                    </div>
                    <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('admin.addNewCategory')}
                    </Button>
                </form>
            </Card>

            {/* Categories Table */}
            <Card>
                <h3 className="text-xl font-bold mb-4">{t('home.allCategories')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-4 font-semibold">{t('admin.name')}</th>
                                <th className="text-left p-4 font-semibold">{t('product.description')}</th>
                                <th className="text-left p-4 font-semibold">{t('admin.product')}</th>
                                <th className="text-right p-4 font-semibold">{t('admin.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4">
                                        {editingId === category.id ? (
                                            <input
                                                className="px-3 py-2 border-2 border-indigo-500 rounded-lg w-full"
                                                value={category.name}
                                                onChange={(e) => setCategories(cats => cats.map(c => c.id === category.id ? { ...c, name: e.target.value } : c))}
                                            />
                                        ) : (
                                            <span className="font-medium">
                                                {categoryKeyMap[category.name] ? t(`categories.${categoryKeyMap[category.name]}`) : category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === category.id ? (
                                            <input
                                                className="px-3 py-2 border-2 border-indigo-500 rounded-lg w-full"
                                                value={category.description}
                                                onChange={(e) => setCategories(cats => cats.map(c => c.id === category.id ? { ...c, description: e.target.value } : c))}
                                            />
                                        ) : (
                                            <span className="text-gray-600">{category.description}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                            {category._count?.products || 0}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end space-x-2">
                                            {editingId === category.id ? (
                                                <>
                                                    <Button variant="primary" onClick={() => handleEdit(category.id)} className="text-sm py-1.5">
                                                        <Save className="w-4 h-4 mr-1" />
                                                        {t('common.save')}
                                                    </Button>
                                                    <Button variant="secondary" onClick={() => setEditingId(null)} className="text-sm py-1.5">
                                                        <X className="w-4 h-4 mr-1" />
                                                        {t('common.cancel')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button variant="outline" onClick={() => setEditingId(category.id)} className="text-sm py-1.5">
                                                        <Edit2 className="w-4 h-4 mr-1" />
                                                        {t('common.edit')}
                                                    </Button>
                                                    <Button variant="danger" onClick={() => initiateDelete(category.id)} className="text-sm py-1.5">
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        {t('common.delete')}
                                                    </Button>
                                                </>
                                            )}
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
