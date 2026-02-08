import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BACKEND_ORIGIN } from '../config';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function Home() {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, selectedCategory, pagination.page]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
            });

            if (search) params.append('search', search);
            if (selectedCategory) params.append('category', selectedCategory);

            const { data } = await api.get(`/products?${params}`);
            setProducts(data.products);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
            }));
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div>
            {/* Search Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('home.title')}</h1>
                <p className="text-gray-600 mb-6">{t('home.subtitle')}</p>

                <Card className="mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('home.searchPlaceholder')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit">
                                <Search className="w-5 h-5 mr-2" />
                                {t('home.searchButton')}
                            </Button>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory('');
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedCategory === ''
                                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {t('home.allCategories')}
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(category.id.toString());
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedCategory === category.id.toString()
                                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {categoryKeyMap[category.name] ? t(`categories.${categoryKeyMap[category.name]}`) : category.name}
                                </button>
                            ))}
                        </div>
                    </form>
                </Card>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : products.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 rounded-3xl inline-block mb-6">
                        <Package className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('home.noProducts')}</h3>
                    <p className="text-gray-600">{t('home.noProductsDesc')}</p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {products.map((product) => {
                            let firstImage = null;
                            if (product.images) {
                                try {
                                    let imgs = product.images;
                                    if (typeof imgs === 'string') {
                                        imgs = JSON.parse(imgs);
                                    }
                                    // Always show the first image (index 0) as the thumbnail, not the latest one
                                    if (Array.isArray(imgs) && imgs.length > 0) {
                                        firstImage = imgs[0];
                                    }
                                } catch (e) {
                                    console.error('Error parsing images for product', product.id, e);
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
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                                                {product.title}
                                            </h3>
                                            {product.category && (
                                                <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
                                                    {categoryKeyMap[product.category.name] ? t(`categories.${categoryKeyMap[product.category.name]}`) : product.category.name}
                                                </span>
                                            )}
                                        </div>
                                        {/* ไม่แสดงราคา */}
                                        <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                                        <div className="text-sm text-gray-500">
                                            <span className="font-semibold">{t('home.owner')}</span> {product.owner.name}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Link to={`/products/${product.id}`} className="block">
                                            <Button variant="outline" className="w-full">
                                                {t('home.viewDetails')}
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                {t('home.previous')}
                            </Button>
                            <span className="text-gray-700 font-medium">
                                {t('home.pageInfo')} {pagination.page} {t('home.of')} {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                {t('home.next')}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
