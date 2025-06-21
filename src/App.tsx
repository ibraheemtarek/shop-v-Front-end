
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import setupAdminAccount from "./utils/setupAdminAccount";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/Auth/AdminProtectedRoute";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Category from "./pages/Category";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import OrderSuccess from "./pages/OrderSuccess";
import FAQs from "./pages/FAQs";
import Policy from "./pages/Policy";
import ShippingReturns from "./pages/ShippingReturns";
import Deals from "./pages/Deals";
import TestLogin from "./pages/TestLogin";
import CreateAdmin from "./pages/CreateAdmin";

const queryClient = new QueryClient();

const App = () => {
  // Set up admin account for development/testing
  // useEffect(() => {
  //   setupAdminAccount();
  // }, []);
  
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin/*" element={<Admin />} />
              </Route>
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category" element={<Category />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/test-login" element={<TestLogin />} />
              <Route path="/create-admin" element={<CreateAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
