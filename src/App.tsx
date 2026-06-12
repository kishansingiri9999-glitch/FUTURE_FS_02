import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ContactForm } from './components/ContactForm';
import { SignInPage } from './components/SignInPage';
import { SignUpPage } from './components/SignUpPage';
import { AdminLayout } from './components/AdminLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<ContactForm />} />
      <Route
        path="/signin"
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <SignInPage />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <SignUpPage />
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
