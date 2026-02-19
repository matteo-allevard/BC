import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Assets } from "./pages/Assets";
import { AssetDetail } from "./pages/AssetDetail";
import { Tokenize } from "./pages/Tokenize";
import { Trade } from "./pages/Trade";
import { Admin } from "./pages/Admin";
import { appConfig } from "./config/appConfig";

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/:assetId" element={<AssetDetail />} />
        <Route path="/tokenize" element={<Tokenize />} />
        <Route path="/trade" element={<Trade />} />
        {appConfig.features.enableAdmin && <Route path="/admin" element={<Admin />} />}
      </Routes>
    </Layout>
  </BrowserRouter>
);
