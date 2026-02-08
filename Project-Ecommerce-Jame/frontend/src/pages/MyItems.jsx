import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BACKEND_ORIGIN } from '../config';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SuccessModal } from '../components/ui/SuccessModal';
import { Package, Edit, PlusCircle, Trash2 } from 'lucide-react';

export default function MyItems() {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products/my-items');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, productId: id });
    };

    const handleConfirmDelete = async () => {
        const id = deleteModal.productId;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
            setDeleteModal({ isOpen: false, productId: null });
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('Failed to delete product');
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">{t('items.myItemsTitle')}</h1>
                    <p className="text-gray-600">{t('items.manageItems')}</p>
                </div>
                <Link to="/post-item">
                    <Button className="w-full sm:w-auto">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        {t('items.postNewItem')}
                    </Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-3xl inline-block mb-6">
                        <Package className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('items.noItems')}</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('items.noItemsDesc')}</p>
                    <Link to="/post-item">
                        <Button>
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {t('items.postFirstItem')}
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                        let firstImage = null;
                        if (product.images) {
                            try {
                                let imgs = product.images;
                                if (typeof imgs === 'string') {
                                    imgs = JSON.parse(imgs);
                                }
                                if (Array.isArray(imgs) && imgs.length > 0) firstImage = imgs[0];
                            } catch (e) {
                                console.error("Error parsing images for product", product.id, e);
                            }
                        }
                        return (
                            <Card key={product.id} hover className="flex flex-col h-full">
                                {firstImage && (
                                    <div className="-mx-6 -mt-6 mb-4">
                                        <img
                                            src={`${BACKEND_ORIGIN}${firstImage}`}
                                            alt={product.title}
                                            className="w-full h-48 object-contain bg-gray-50 rounded-t-2xl"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">{product.title}</h3>
                                    <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-sm ${product.status === 'available' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                        product.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                                        product.status === 'exchanged' ? 'bg-gray-100 text-gray-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {t(`product.${product.status}`)}
                                    </span>
                                </div>
                                {/* ไม่แสดงราคา */}
                                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                                <Link to={`/edit-item/${product.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full flex justify-center items-center">
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('items.editItem')}
                                    </Button>
                                </Link>
                                <Button 
                                    variant="danger" 
                                    className="flex-1 flex justify-center items-center"
                                    onClick={() => handleDeleteClick(product.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('common.delete')}
                                </Button>
                            </div>
                        </Card>
                    );
                    })}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, productId: null })}
                onConfirm={handleConfirmDelete}
                title={t('admin.confirmDeleteProduct')}
                message={t('admin.confirmDeleteProduct')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isDestructive={true}
            />

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title="ลบสินค้าสำเร็จ"
                message="สินค้าของคุณถูกลบออกจากระบบเรียบร้อยแล้ว"
                buttonText="ตกลง"
            />
        </div>
    );
}
