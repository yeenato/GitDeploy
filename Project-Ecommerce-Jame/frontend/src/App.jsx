import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyItems from './pages/MyItems';
import PostItem from './pages/PostItem';
import EditItem from './pages/EditItem';
import ProductDetail from './pages/ProductDetail';
import Chat from './pages/Chat';
import ShippingAddress from './pages/ShippingAddress';

// Admin imports
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import CategoryManagement from './admin/pages/CategoryManagement';
import AdminProducts from './admin/pages/AdminProducts';
import UserManagement from './admin/pages/UserManagement';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/addresses"
        element={
          <Layout>
            <ProtectedRoute>
              <ShippingAddress />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/my-items"
        element={
          <Layout>
            <ProtectedRoute>
              <MyItems />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/post-item"
        element={
          <Layout>
            <ProtectedRoute>
              <PostItem />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/edit-item/:id"
        element={
          <Layout>
            <ProtectedRoute>
              <EditItem />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/chat/:conversationId?"
        element={
          <Layout>
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          </Layout>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <CategoryManagement />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
