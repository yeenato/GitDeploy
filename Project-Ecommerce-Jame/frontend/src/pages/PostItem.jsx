import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SuccessModal } from '../components/ui/SuccessModal';
import { PlusCircle, X } from 'lucide-react';

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

export default function PostItem() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
    });
    // Combined state for files and their previews to ensure synchronization
    // Cover Image State
    const [coverImage, setCoverImage] = useState(null); // { file: File, preview: string }

    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const navigate = useNavigate();

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

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Revoke previous preview if exists
            if (coverImage) {
                URL.revokeObjectURL(coverImage.preview);
            }
            setCoverImage({
                file,
                preview: URL.createObjectURL(file)
            });
            e.target.value = '';
        }
    };

    const removeCover = () => {
        if (coverImage) {
            URL.revokeObjectURL(coverImage.preview);
            setCoverImage(null);
        }
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
        
        // Append Cover Image if present
        if (coverImage) {
            data.append('coverImage', coverImage.file);
        }

        if (video) {
            data.append('video', video);
        }

        try {
            await api.post('/products', data);
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to create product', error);
            alert(t('common.error') + ': ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('items.postNewItem')}</h1>
                <p className="text-gray-600">{t('items.shareItem')}</p>
            </div>

            <Card>
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-900 font-medium">
                        💡 <strong>{t('items.tip')}</strong> {t('items.tipDesc')}
                    </p>
                </div>

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
                            placeholder={t('items.descPlaceholder')}
                        />
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('items.itemCoverImage') || "Product Image"}
                        </label>
                        <div className="flex flex-col gap-3">
                            {!coverImage ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300"
                                />
                            ) : (
                                <div className="relative group w-fit">
                                    <img src={coverImage.preview} alt="Cover Preview" className="w-48 h-48 object-cover rounded-xl border-2 border-indigo-100 shadow-md" />
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button type="submit" className="flex-1 sm:flex-initial">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {t('items.postNewItem')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/my-items')}
                            className="flex-1 sm:flex-initial"
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </form>
            </Card>

            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => navigate('/my-items')}
                title="เพิ่มสินค้าสำเร็จ"
                message="สินค้าของคุณถูกเพิ่มลงในระบบเรียบร้อยแล้ว"
                buttonText="ตกลง"
            />
        </div>
    );
}
