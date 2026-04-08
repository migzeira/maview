import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import ProfilePage from "./pages/Profile.tsx";

import DashboardLayout from "./components/DashboardLayout.tsx";
import DashboardHome from "./pages/DashboardHome.tsx";

import DashboardProdutos from "./pages/DashboardProdutos.tsx";
import DashboardVendas from "./pages/DashboardVendas.tsx";
import DashboardMonetizacao from "./pages/DashboardMonetizacao.tsx";
import DashboardAudiencia from "./pages/DashboardAudiencia.tsx";
import DashboardAutomacoes from "./pages/DashboardAutomacoes.tsx";
import DashboardAparencia from "./pages/DashboardAparencia.tsx";
import DashboardConfiguracoes from "./pages/DashboardConfiguracoes.tsx";
import DashboardPagina from "./pages/DashboardPagina.tsx";
import DashboardIA from "./pages/DashboardIA.tsx";

const queryClient = new QueryClient();

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<DashboardPage><DashboardHome /></DashboardPage>} />
          <Route path="/dashboard/pagina" element={<DashboardPage><DashboardPagina /></DashboardPage>} />
          <Route path="/dashboard/monetizacao" element={<DashboardPage><DashboardMonetizacao /></DashboardPage>} />
          <Route path="/dashboard/produtos" element={<DashboardPage><DashboardProdutos /></DashboardPage>} />
          <Route path="/dashboard/vendas" element={<DashboardPage><DashboardVendas /></DashboardPage>} />
          <Route path="/dashboard/audiencia" element={<DashboardPage><DashboardAudiencia /></DashboardPage>} />
          <Route path="/dashboard/automacoes" element={<DashboardPage><DashboardAutomacoes /></DashboardPage>} />
          <Route path="/dashboard/aparencia" element={<DashboardPage><DashboardAparencia /></DashboardPage>} />
          <Route path="/dashboard/configuracoes" element={<DashboardPage><DashboardConfiguracoes /></DashboardPage>} />
          <Route path="/dashboard/ia" element={<DashboardPage><DashboardIA /></DashboardPage>} />
          <Route path="/:username" element={<ProfilePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
