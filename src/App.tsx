import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AssetDetail } from './pages/AssetDetail';
import { WeeklyReview } from './pages/WeeklyReview';
import { Settings } from './pages/Settings';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="asset/:symbol" element={<AssetDetail />} />
          <Route path="review" element={<WeeklyReview />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
