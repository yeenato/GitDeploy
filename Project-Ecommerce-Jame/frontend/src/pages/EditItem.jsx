import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BACKEND_ORIGIN } from '../config';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SuccessModal } from '../components/ui/SuccessModal';
import { Save, X } from 'lucide-react';

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

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'available',
        categoryId: '',
    });
    // Cover Image State
    const [coverState, setCoverState] = useState(null); // { file: File|null, preview: string, isNew: boolean }

    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error('Categories data is not an array:', data);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Failed to fetch categories', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Fetch product directly by ID
                const { data } = await api.get(`/products/${id}`);
                const product = data;

                // Check authorization
                if (!user) return;

                const isAdmin = user.role === 'ADMIN';
                const isOwner = product.ownerId === user.id;

                if (!isOwner && !isAdmin) {
                    navigate('/');
                    return;
                }

                if (product) {
                    setFormData({
                        title: product.title,
                        description: product.description,
                        status: product.status,
                        categoryId: product.categoryId || '',
                    });
                    if (product.images) {
                        try {
                            let imgs = product.images;
                            if (typeof imgs === 'string') {
                                imgs = JSON.parse(imgs);
                            }
                            if (Array.isArray(imgs) && imgs.length > 0) {
                                // First image is cover
                                setCoverState({
                                    file: null,
                                    preview: imgs[0],
                                    isNew: false
                                });
                            } else {
                                setCoverState(null);
                            }
                        } catch (e) {
                            console.error("Error parsing images", e);
                            setCoverState(null);
                        }
                    }
                    if (product.video) {
                        setVideoPreview(product.video.startsWith('http') ? product.video : `${BACKEND_ORIGIN}${product.video}`);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product', error);
                navigate('/my-items');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProduct();
        }
    }, [id, navigate, user]);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Revoke previous preview if it was new
            if (coverState && coverState.isNew) {
                URL.revokeObjectURL(coverState.preview);
            }
            setCoverState({
                file,
                preview: URL.createObjectURL(file),
                isNew: true
            });
            e.target.value = '';
        }
    };

    const removeCover = () => {
        if (coverState && coverState.isNew) {
            URL.revokeObjectURL(coverState.preview);
        }
        setCoverState(null);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        if (formData.categoryId) {
            data.append('categoryId', formData.categoryId);
        }
        
        // Handle Cover Image
        if (coverState) {
            if (coverState.isNew) {
                data.append('coverImage', coverState.file);
            } else {
                data.append('existingCoverImage', coverState.preview);
            }
        }

        if (video) {
            data.append('video', video);
        }

        try {
            await api.put(`/products/${id}`, data);
            if (formData.status) {
                await api.patch(`/products/${id}/status`, { status: formData.status });
            }
            
            // Show success modal
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to update product', error);
            alert(t('common.error') + ': ' + (error.response?.data?.message || error.message));
        }
    };

    const statusOptions = ['available', 'exchanged', 'cancelled'];

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('items.editItem')}</h1>
                <p className="text-gray-600">{t('items.updateInfo')}</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label={t('items.itemTitle')}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder={t('items.titlePlaceholder')}
                    />

                    {/* ราคาไม่ได้ใช้ในเวอร์ชันนี้ */}

                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('admin.category') || 'Category'}
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300"
                            required
                        >
                            <option value="">{t('home.allCategories') || 'Select Category'}</option>
                            {Array.isArray(categories) && categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {categoryKeyMap[category.name] ? t(`categories.${categoryKeyMap[category.name]}`) : category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('items.itemDescription')}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows="6"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 resize-none"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('items.itemCoverImage') || "Main Cover Image"}
                        </label>
                        <div className="flex flex-col gap-3">
                            {!coverState ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300"
                                />
                            ) : (
                                <div className="relative group w-fit">
                                    <img 
                                        src={coverState.isNew ? coverState.preview : (coverState.preview.startsWith('http') ? coverState.preview : `${BACKEND_ORIGIN}${coverState.preview}`)}
                                        alt="Cover Preview" 
                                        className="w-48 h-48 object-cover rounded-xl border-2 border-indigo-100 shadow-md" 
                                    />
                                    <button
                                        type="button"
                                        onClick={removeCover}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional images section removed */}
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('items.videoOptional')}
                        </label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300"
                        />
                        {videoPreview && (
                            <div className="mt-2">
                                <video src={videoPreview} controls className="w-full max-h-60 object-contain rounded-md bg-black" />
                            </div>
                        )}
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('items.itemStatus')}
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300"
                        >
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button type="submit" className="flex-1 sm:flex-initial">
                            <Save className="w-5 h-5 mr-2" />
                            {t('dashboard.saveChanges')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            className="flex-1 sm:flex-initial"
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </form>
            </Card>

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => {
                    if (user && user.role === 'ADMIN') {
                        navigate('/admin/products');
                    } else {
                        navigate('/my-items');
                    }
                }}
                title="แก้ไขสินค้าสำเร็จ"
                message="ข้อมูลสินค้าของคุณถูกอัปเดตเรียบร้อยแล้ว"
                buttonText="ตกลง"
            />
        </div>
    );
}
