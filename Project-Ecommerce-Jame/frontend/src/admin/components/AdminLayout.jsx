import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
