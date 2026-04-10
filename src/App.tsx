import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import DashboardLayout from "./components/DashboardLayout.tsx";

/* ── Lazy-loaded pages (code splitting) ── */
const Login = lazy(() => import("./pages/Login.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const ProfilePage = lazy(() => import("./pages/Profile.tsx"));
const DashboardHome = lazy(() => import("./pages/DashboardHome.tsx"));
const DashboardPagina = lazy(() => import("./pages/DashboardPagina.tsx"));
const DashboardProdutos = lazy(() => import("./pages/DashboardProdutos.tsx"));
const DashboardVendas = lazy(() => import("./pages/DashboardVendas.tsx"));
const DashboardMonetizacao = lazy(() => import("./pages/DashboardMonetizacao.tsx"));
const DashboardAudiencia = lazy(() => import("./pages/DashboardAudiencia.tsx"));
const DashboardAutomacoes = lazy(() => import("./pages/DashboardAutomacoes.tsx"));
const DashboardAparencia = lazy(() => import("./pages/DashboardAparencia.tsx"));
const DashboardConfiguracoes = lazy(() => import("./pages/DashboardConfiguracoes.tsx"));
const DashboardBlocos = lazy(() => import("./pages/DashboardBlocos.tsx"));
const DashboardIA = lazy(() => import("./pages/DashboardIA.tsx"));

const queryClient = new QueryClient();

/* ── Loading spinner (shown while chunks load) ── */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--dash-bg))]">
    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/dashboard/blocos" element={<DashboardPage><DashboardBlocos /></DashboardPage>} />
            <Route path="/dashboard/ia" element={<DashboardPage><DashboardIA /></DashboardPage>} />
            <Route path="/:username" element={<ProfilePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
