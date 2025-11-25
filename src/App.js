import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout';

// Lazy Load Pages
const Home = lazy(() => import('./pages/lazy/Home'));
const About = lazy(() => import('./pages/lazy/About'));
const NotFound = lazy(() => import('./pages/lazy/NotFound'));
const Customers = lazy(() => import('./pages/Customers'));
const Products = lazy(() => import('./pages/Products'));
const Login = lazy(() => import('./pages/Login')); 

const MainLayoutWrapper = ({ children }) => (
  <MainLayout>{children}</MainLayout>
);

// ตัวเช็คสิทธิ์: ถ้าไม่มี ID ในเครื่อง ให้ดีดไปหน้า Login เสมอ
const PrivateRoute = ({ children }) => {
  const auth = localStorage.getItem("auth_user_id");
  return auth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Suspense fallback={<div className="text-center mt-5 text-white">Loading...</div>}>
      <Routes>
        {/* หน้า Login เข้าได้เลย */}
        <Route path="/login" element={<Login />} />
        
        {/* หน้าอื่นๆ ต้องล็อกอินก่อน */}
        <Route path="/" element={<Navigate to="/login" />} /> {/* เข้า root ดีดไป login ก่อนเพื่อความชัวร์ */}
        
        <Route path="/home" element={<PrivateRoute><MainLayoutWrapper><Home /></MainLayoutWrapper></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><MainLayoutWrapper><Customers /></MainLayoutWrapper></PrivateRoute>} />
        <Route path="/products/:type" element={<PrivateRoute><MainLayoutWrapper><Products /></MainLayoutWrapper></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><MainLayoutWrapper><About /></MainLayoutWrapper></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}

export default App;