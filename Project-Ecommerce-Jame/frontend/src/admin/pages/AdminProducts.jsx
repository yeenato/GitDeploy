import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { Check, X, Package, Trash2, Edit, Eye, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BACKEND_ORIGIN } from '../../config';

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

export default function AdminProducts() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
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
        fetchProducts();
    }, [activeTab]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'pending'
                ? '/admin/products/pending'
                : '/admin/products';
            const { data } = await api.get(endpoint);
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/products/${id}/approve`);
            setProducts(products.filter(p => p.id !== id));
            if (selectedProduct?.id === id) setSelectedProduct(null);
            setSuccessMessage('อนุมัติสินค้าสำเร็จ');
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to approve product', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.patch(`/admin/products/${id}/reject`);
            setProducts(products.filter(p => p.id !== id));
            if (selectedProduct?.id === id) setSelectedProduct(null);
            setSuccessMessage('ปฏิเสธสินค้าสำเร็จ');
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to reject product', error);
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
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
                if (selectedProduct?.id === id) setSelectedProduct(null);
                setSuccessMessage('ลบสินค้าสำเร็จ');
                setSuccessModalOpen(true);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Action failed', error);
            alert('Failed to delete product');
        } finally {
            setActionLoading(false);
        }
    };

    const initiateDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: t('admin.confirmDeleteProduct'),
            message: t('admin.actionCannotUndone'),
            action: 'delete',
            data: { id },
            isDestructive: true
        });
    };

    const handleEdit = (id) => {
        navigate(`/edit-item/${id}`);
    };

    const getProductImages = (product) => {
        if (!product.images) return [];
        try {
            let imgs = product.images;
            if (typeof imgs === 'string') {
                imgs = JSON.parse(imgs);
            }
            return Array.isArray(imgs) ? imgs : [];
        } catch (e) {
            console.error("Error parsing images", e);
            return [];
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('admin.manageProducts')}</h1>
                <p className="text-gray-600">{t('admin.reviewProductsDesc')}</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-1">
                <button
                    className={`pb-3 px-4 font-medium transition-colors relative ${
                        activeTab === 'pending'
                            ? 'text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('pending')}
                >
                    {t('admin.pending')}
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                    )}
                </button>
                <button
                    className={`pb-3 px-4 font-medium transition-colors relative ${
                        activeTab === 'all'
                            ? 'text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    {t('admin.allProducts')}
                    {activeTab === 'all' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : products.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 rounded-3xl inline-block mb-6">
                        <Package className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.allCaughtUp')}</h3>
                    <p className="text-gray-600">{t('admin.noPendingDesc')}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="flex flex-col h-full relative group">
                             {/* Status Badge for All Products View */}
                            {activeTab === 'all' && (
                                <div className="absolute top-4 right-4 z-10">
                                     <span className={`px-3 py-1 text-xs font-bold rounded-full text-white shadow-sm ${
                                        product.status === 'available' ? 'bg-green-500' :
                                        product.status === 'PENDING_APPROVAL' ? 'bg-yellow-500' :
                                        product.status === 'cancelled' ? 'bg-red-500' :
                                        'bg-gray-500'
                                     }`}>
                                        {t(`product.${product.status}`) || product.status}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-8">{product.title}</h3>
                                    {activeTab === 'pending' && (
                                        <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white whitespace-nowrap shadow-sm">
                                            {t('admin.pending')}
                                        </span>
                                    )}
                                </div>
                                {/* ไม่แสดงราคาในหน้าผู้ดูแลระบบ */}
                                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-700">
                                        <span className="font-semibold mr-2">{t('home.owner')}:</span>
                                        <div className="flex items-center gap-1">
                                            <span>{product.owner?.name}</span>
                                            {product.owner?.role === 'ADMIN' && (
                                                <Shield className="w-3 h-3 text-purple-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <span className="font-semibold mr-2">{t('auth.email')}:</span>
                                        <span>{product.owner?.email}</span>
                                    </div>
                                    {product.category && (
                                        <div className="flex items-center text-gray-700">
                                            <span className="font-semibold mr-2">{t('admin.category')}:</span>
                                            <span>
                                                {categoryKeyMap[product.category.name] 
                                                    ? t(`categories.${categoryKeyMap[product.category.name]}`) 
                                                    : product.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedProduct(product)}
                                    className="w-full flex justify-center items-center"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t('home.viewDetails') || 'View Details'}
                                </Button>
                                <div className="flex gap-2">
                                    {activeTab === 'pending' ? (
                                        <>
                                            <Button
                                                onClick={() => handleApprove(product.id)}
                                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                {t('admin.approve')}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleReject(product.id)}
                                                className="flex-1"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                {t('admin.reject')}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleEdit(product.id)}
                                                className="flex-1"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                {t('common.edit')}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => initiateDelete(product.id)}
                                                className="flex-1"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {t('common.delete')}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.title}</h2>
                                <button 
                                    onClick={() => setSelectedProduct(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Images */}
                                {getProductImages(selectedProduct).length > 0 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {getProductImages(selectedProduct).map((img, idx) => (
                                            <img 
                                                key={idx}
                                                src={`${BACKEND_ORIGIN}${img}`} 
                                                alt={`Product ${idx + 1}`}
                                                className="w-full h-48 object-cover rounded-xl bg-gray-50"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Video */}
                                {selectedProduct.video && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{t('items.video') || 'Video'}</h3>
                                        <video 
                                            src={`${BACKEND_ORIGIN}${selectedProduct.video}`}
                                            controls
                                            className="w-full rounded-xl bg-black"
                                        />
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{t('product.description')}</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedProduct.description}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <p className="text-sm text-gray-500">{t('admin.category')}</p>
                                        <p className="font-medium text-gray-900">{selectedProduct.category?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{t('items.itemStatus')}</p>
                                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mt-1 ${
                                            selectedProduct.status === 'available' ? 'bg-green-100 text-green-700' :
                                            selectedProduct.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
                                            selectedProduct.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {t(`product.${selectedProduct.status}`) || selectedProduct.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">{t('product.ownerInfo')}</p>
                                        <div className="flex items-center mt-1">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-2">
                                                {selectedProduct.owner?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedProduct.owner?.name}</p>
                                                <p className="text-xs text-gray-500">{selectedProduct.owner?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {activeTab === 'pending' && (
                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <Button
                                            onClick={() => handleApprove(selectedProduct.id)}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            {t('admin.approve')}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleReject(selectedProduct.id)}
                                            className="flex-1"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            {t('admin.reject')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
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
