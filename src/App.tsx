import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AssetDetail } from './pages/AssetDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="asset/:symbol" element={<AssetDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
