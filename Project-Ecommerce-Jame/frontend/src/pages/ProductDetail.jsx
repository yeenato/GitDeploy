import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BACKEND_ORIGIN } from '../config';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SuccessModal } from '../components/ui/SuccessModal';
import { Package, User, MessageCircle, Tag, Edit, Trash2, X, ZoomIn, Shield } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { createPortal } from 'react-dom';

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

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    // Payment/Order state removed

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
            if (data.images) {
                try {
                    // Check if images is a valid JSON string
                    if (typeof data.images === 'string') {
                        const parsedImages = JSON.parse(data.images);
                        setImages(Array.isArray(parsedImages) ? parsedImages : []);
                    } else if (Array.isArray(data.images)) {
                        setImages(data.images);
                    } else {
                        setImages([]);
                    }
                } catch (e) {
                    console.error("Error parsing images", e);
                    setImages([]);
                }
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error('Failed to fetch product', error);
        } finally {
            setLoading(false);
        }
    };

    // Payment/Order helpers removed

    // Payment/Order handlers removed

    const handleChatWithOwner = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (product.ownerId === user.id) {
            alert(t('product.ownProductAlert'));
            return;
        }

        try {
            const { data } = await api.post('/chat/start', {
                targetUserId: product.ownerId,
            });
            navigate(`/chat/${data.id}`, { state: { product } });
        } catch (error) {
            console.error('Failed to start conversation', error);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/products/${id}`);
            setIsDeleteModalOpen(false);
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('Failed to delete product');
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    if (!product) return <Card className="text-center py-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('product.notFound')}</h3>
    </Card>;

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="space-y-6">
                    {/* Images */}
                    {images.length > 0 && (
                        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {images.map((img, index) => (
                                <div 
                                    key={index}
                                    className="relative group cursor-pointer"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={`${BACKEND_ORIGIN}${img}`}
                                        alt={`${product.title} ${index + 1}`}
                                        className="w-full h-64 object-contain bg-gray-50 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Video */}
                    {product.video && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                {t('items.video')}
                            </h2>
                            <video
                                src={product.video.startsWith('http') ? product.video : `${BACKEND_ORIGIN}${product.video}`}
                                controls
                                className="w-full max-h-[500px] object-contain rounded-xl shadow-md bg-black"
                            />
                        </div>
                    )}

                    {/* Header */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                                {/* ไม่แสดงราคา */}
                            </div>
                            {product.category && (
                                <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center">
                                    <Tag className="w-4 h-4 mr-2" />
                                    {categoryKeyMap[product.category.name] ? t(`categories.${categoryKeyMap[product.category.name]}`) : product.category.name}
                                </span>
                            )}
                        </div>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${product.status === 'available'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                            {t(`product.${product.status}`)}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-indigo-600" />
                            {t('product.description')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {product.description}
                        </p>
                    </div>

                    {/* Owner Info */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-600" />
                            {t('product.ownerInfo')}
                        </h2>
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                            <div className="flex items-start space-x-4">
                                <Avatar 
                                    name={product.owner?.name}
                                    src={product.owner?.profileImage ? `${BACKEND_ORIGIN}${product.owner.profileImage}` : null}
                                    size="xl"
                                    className="border-2 border-white shadow-lg"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-gray-900">{product.owner?.name}</h3>
                                        {product.owner?.role === 'ADMIN' && (
                                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1 rounded-full" title="Admin">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-3">{product.owner?.email}</p>
                                    {product.owner?.bio && (
                                        <p className="text-gray-700 italic">"{product.owner.bio}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        {user && product.ownerId !== user.id && product.status === 'available' && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleChatWithOwner}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-3"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    {t('product.chatWithOwner')}
                                </Button>
                            </div>
                        )}
                        {!user && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                                <Link to="/login" className="text-yellow-700 font-medium hover:underline">
                                    {t('product.loginToChat')}
                                </Link>
                            </div>
                        )}
                        {user && product.ownerId === user.id && (
                            <div className="flex flex-col gap-4">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                    <p className="text-blue-700 font-medium">
                                        {t('product.yourProduct')}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Link to={`/edit-item/${product.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Edit className="w-5 h-5 mr-2" />
                                            {t('items.editItem')}
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="danger" 
                                        className="flex-1"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        {t('common.delete')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Image Lightbox */}
            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img 
                        src={`${BACKEND_ORIGIN}${selectedImage}`} 
                        alt="Full view" 
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>,
                document.body
            )}

            {/* Modal ชำระเงินถูกถอดออก */}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('admin.confirmDeleteProduct')}
                message={t('admin.confirmDeleteProduct')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                isDestructive={true}
            />

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => navigate('/my-items')}
                title="ลบสินค้าสำเร็จ"
                message="สินค้าของคุณถูกลบออกจากระบบเรียบร้อยแล้ว"
                buttonText="ตกลง"
            />
        </div>
    );
}
