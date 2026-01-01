import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthForm from "./pages/AuthForm";
import Product from "./Product";
import ProtectedRoute from  './routes/ProtectedRoutes';

function AppContent() {
  // ✅ SAFE: inside AuthProvider
  return (
    <Routes>
      <Route path="/auth" element={<AuthForm />} />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Product />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<AuthForm />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
