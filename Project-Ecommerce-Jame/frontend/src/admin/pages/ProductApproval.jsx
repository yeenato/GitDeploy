import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, X, Package } from 'lucide-react';
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

export default function ProductApproval() {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            const { data } = await api.get('/admin/products/pending');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch pending products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/products/${id}/approve`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to approve product', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.patch(`/admin/products/${id}/reject`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to reject product', error);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('admin.productApproval')}</h1>
                <p className="text-gray-600">{t('admin.reviewProductsDesc')}</p>
            </div>

            {products.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-3xl inline-block mb-6">
                        <Package className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.allCaughtUp')}</h3>
                    <p className="text-gray-600">{t('admin.noPendingDesc')}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="flex flex-col h-full">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{product.title}</h3>
                                    <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white whitespace-nowrap shadow-sm">
                                        {t('admin.pending')}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-700">
                                        <span className="font-semibold mr-2">{t('home.owner')}</span>
                                        <span>{product.owner.name}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <span className="font-semibold mr-2">{t('auth.email')}:</span>
                                        <span>{product.owner.email}</span>
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

                            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
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
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
