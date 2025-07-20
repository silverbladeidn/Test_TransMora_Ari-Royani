import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import RegisterPage from './Pages/Register';
import DashboardUser from './Pages/Dashboard';
import ProdukPage from './Pages/Produk';
import Penjualan from './Pages/Penjualan';
import Pemasukan from './Pages/Pemasukan';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/halouser" element={<DashboardUser />} />
          <Route path="/produk" element={<ProdukPage />} />
          <Route path="/pemasukan" element={<Pemasukan />} />
          <Route path="/penjualan" element={<Penjualan />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
