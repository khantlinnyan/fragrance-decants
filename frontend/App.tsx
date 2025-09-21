import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

export default function App() {
  return (
    <div className="dark min-h-screen bg-black text-white">
      <AuthProvider>
        <CartProvider>
          <Router>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </main>
            <Toaster />
          </Router>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}
