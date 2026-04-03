import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PortalLayout } from '@/components/layout/PortalLayout';

import AuthPage from '@/pages/AuthPage';
import HomeExhibition from '@/pages/HomeExhibition';
import MuseumTour from '@/pages/MuseumTour';
import KnowledgeQA from '@/pages/KnowledgeQA';
import Scene3D from '@/pages/Scene3D';
import BlogPage from '@/pages/Blog';
import CityAtlas from '@/pages/CityAtlas';
import TreasureVoices from '@/pages/TreasureVoices';

import Index from '@/pages/Index';
import Setup from '@/pages/Setup';
import Chat from '@/pages/Chat';
import RoutePage from '@/pages/RoutePage';
import NodeDetail from '@/pages/NodeDetail';
import Bond from '@/pages/Bond';
import Report from '@/pages/Report';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: { retry: 1 },
  },
});

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/home' : '/auth'} replace />;
}

function AuthGuard({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function ProtectedShell() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <PortalLayout />;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/auth"
        element={
          <AuthGuard>
            <AuthPage />
          </AuthGuard>
        }
      />

      <Route element={<ProtectedShell />}>
        <Route path="/home" element={<HomeExhibition />} />

        <Route path="/guide" element={<Index />} />
        <Route path="/guide/setup" element={<Setup />} />
        <Route path="/guide/chat" element={<Chat />} />
        <Route path="/guide/route" element={<RoutePage />} />
        <Route path="/guide/node/:id" element={<NodeDetail />} />
        <Route path="/guide/bond" element={<Bond />} />
        <Route path="/guide/report" element={<Report />} />

        <Route path="/museum" element={<MuseumTour />} />
        <Route path="/atlas" element={<CityAtlas />} />
        <Route path="/treasure" element={<TreasureVoices />} />
        <Route path="/qa" element={<KnowledgeQA />} />
        <Route path="/scene3d" element={<Scene3D />} />
        <Route path="/blog" element={<BlogPage />} />

        <Route path="/setup" element={<Navigate to="/guide/setup" replace />} />
        <Route path="/chat" element={<Navigate to="/guide/chat" replace />} />
        <Route path="/route" element={<Navigate to="/guide/route" replace />} />
        <Route path="/node/:id" element={<Navigate to="/guide/setup" replace />} />
        <Route path="/bond" element={<Navigate to="/guide/bond" replace />} />
        <Route path="/report" element={<Navigate to="/guide/report" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <Toaster />
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </AuthProvider>
        </AppErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
