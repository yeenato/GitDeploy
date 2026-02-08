import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SuccessModal } from '../components/ui/SuccessModal';
import { Plus, MapPin, Edit2, Trash2, Star, Phone, Home } from 'lucide-react';

export default function ShippingAddress() {
    const { t } = useLanguage();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        subdistrict: '',
        district: '',
        province: '',
        zipCode: '',
        isDefault: false
    });
    const [modalConfig, setModalConfig] = useState({
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
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const { data } = await api.get('/addresses');
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const handleConfirmAction = async () => {
        if (!modalConfig.action) return;
        
        setActionLoading(true);
        try {
            if (modalConfig.action === 'save') {
                if (editingAddress) {
                    await api.put(`/addresses/${editingAddress.id}`, formData);
                    setSuccessMessage('แก้ไขที่อยู่สำเร็จ');
                } else {
                    await api.post('/addresses', formData);
                    setSuccessMessage('เพิ่มที่อยู่สำเร็จ');
                }
                fetchAddresses();
                resetForm();
            } else if (modalConfig.action === 'delete') {
                await api.delete(`/addresses/${modalConfig.data}`);
                fetchAddresses();
                setSuccessMessage('ลบที่อยู่สำเร็จ');
            }
            handleCloseModal();
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Action failed', error);
            alert('Action failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const initiateSubmit = (e) => {
        e.preventDefault();
        setModalConfig({
            isOpen: true,
            title: editingAddress ? t('address.edit') : t('address.addNew'),
            message: editingAddress ? 'Are you sure you want to update this address?' : 'Are you sure you want to add this address?',
            action: 'save',
            isDestructive: false
        });
    };

    const initiateDelete = (id) => {
        setModalConfig({
            isOpen: true,
            title: t('address.delete'),
            message: t('address.confirmDelete'),
            action: 'delete',
            data: id,
            isDestructive: true
        });
    };

    const handleEdit = (address) => {
        setFormData({
            fullName: address.fullName,
            phoneNumber: address.phoneNumber,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            subdistrict: address.subdistrict,
            district: address.district,
            province: address.province,
            zipCode: address.zipCode,
            isDefault: address.isDefault
        });
        setEditingAddress(address);
        setIsAdding(true);
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            phoneNumber: '',
            addressLine1: '',
            addressLine2: '',
            subdistrict: '',
            district: '',
            province: '',
            zipCode: '',
            isDefault: false
        });
        setEditingAddress(null);
        setIsAdding(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">{t('address.title')}</h1>
                    <p className="text-gray-600">{t('address.manageAddresses')}</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                        <Plus size={20} />
                        {t('address.addNew')}
                    </Button>
                )}
            </div>

            {isAdding ? (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingAddress ? t('address.edit') : t('address.addNew')}
                    </h2>
                    <form onSubmit={initiateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.fullName')}</label>
                                <Input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('address.fullName')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.phoneNumber')}</label>
                                <Input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('address.phoneNumber')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.addressLine1')}</label>
                            <Input
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                required
                                placeholder={t('address.addressLine1')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.addressLine2')}</label>
                            <Input
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                placeholder={t('address.addressLine2')}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.subdistrict')}</label>
                                <Input
                                    name="subdistrict"
                                    value={formData.subdistrict}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('address.subdistrict')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.district')}</label>
                                <Input
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('address.district')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.province')}</label>
                                <Input
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('address.province')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address.zipCode')}</label>
                                <Input
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('address.zipCode')}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">
                                {t('address.isDefault')}
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit">
                                {t('common.save')}
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {addresses.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">
                            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{t('address.noAddresses')}</p>
                        </Card>
                    ) : (
                        addresses.map((address) => (
                            <Card key={address.id} className="p-6 hover:shadow-lg transition-shadow relative overflow-hidden">
                                {address.isDefault && (
                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg flex items-center gap-1">
                                        <Star size={12} fill="currentColor" />
                                        {t('address.default')}
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{address.fullName}</h3>
                                            <span className="text-gray-500 text-sm flex items-center gap-1">
                                                <Phone size={14} />
                                                {address.phoneNumber}
                                            </span>
                                        </div>
                                        <div className="text-gray-600 space-y-1">
                                            <p className="flex items-start gap-2">
                                                <Home size={16} className="mt-1 flex-shrink-0" />
                                                <span>{address.addressLine1} {address.addressLine2 && <span className="text-gray-500">({address.addressLine2})</span>}</span>
                                            </p>
                                            <p className="pl-6 text-sm">
                                                {address.subdistrict}, {address.district}, {address.province} {address.zipCode}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:self-center">
                                        <Button variant="secondary" onClick={() => handleEdit(address)} className="px-3 py-2">
                                            <Edit2 size={18} />
                                        </Button>
                                        <Button variant="danger" onClick={() => initiateDelete(address.id)} className="px-3 py-2">
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Modal Components */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                isDestructive={modalConfig.isDestructive}
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
