import { Card } from '../../components/ui/Card';
import { Users, Package, FolderKanban, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingProducts: 0,
        totalCategories: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [users, pendingProducts, categories] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/products/pending'),
                api.get('/admin/categories'),
            ]);

            setStats({
                totalUsers: users.data.length,
                pendingProducts: pendingProducts.data.length,
                totalCategories: categories.data.length,
            });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const statCards = [
        {
            title: t('admin.totalUsers'),
            value: stats.totalUsers,
            icon: Users,
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            title: t('admin.pendingApprovals'),
            value: stats.pendingProducts,
            icon: Package,
            gradient: 'from-orange-500 to-yellow-500',
        },
        {
            title: t('admin.categories'),
            value: stats.totalCategories,
            icon: FolderKanban,
            gradient: 'from-purple-500 to-pink-500',
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('admin.adminDashboard')}</h1>
                <p className="text-gray-600">{t('admin.welcomeMessage')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <Card key={index} hover className="relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium mb-1">{stat.title}</p>
                                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient}`}>
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
                    {t('admin.quickActions')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/admin/products" className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group">
                        <Package className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-gray-900">{t('admin.reviewProducts')}</h4>
                        <p className="text-sm text-gray-600">{t('admin.reviewProductsDesc')}</p>
                    </a>
                    <a href="/admin/categories" className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group">
                        <FolderKanban className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-gray-900">{t('admin.manageCategories')}</h4>
                        <p className="text-sm text-gray-600">{t('admin.manageCategoriesDesc')}</p>
                    </a>
                    <a href="/admin/users" className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
                        <Users className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-gray-900">{t('admin.userManagement')}</h4>
                        <p className="text-sm text-gray-600">{t('admin.manageUserRoles')}</p>
                    </a>
                </div>
            </Card>
        </div>
    );
}
