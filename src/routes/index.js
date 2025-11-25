import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
const Home = lazy(() => import('../pages/lazy/Home'))
const About = lazy(() => import('../pages/lazy/About'))
const NotFound = lazy(() => import('../pages/lazy/NotFound'))
const Customers = lazy(() => import('../pages/Customers'))
const Products = lazy(() => import('../pages/Products'))
export const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/products/:type" element={<Products />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
)