import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { PageTransition } from '@/components/PageTransition';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import Index from './pages/Index';
import Setup from './pages/Setup';
import Chat from './pages/Chat';
import RoutePage from './pages/RoutePage';
import NodeDetail from './pages/NodeDetail';
import Bond from './pages/Bond';
import Report from './pages/Report';
import NotFound from './pages/NotFound';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppErrorBoundary>
          <Toaster />
          <BrowserRouter>
            <AnimatedRoutes>
              <Route
                path="/"
                data-genie-title="首页"
                data-genie-key="Home"
                element={
                  <PageTransition transition="fade">
                    <Index />
                  </PageTransition>
                }
              />
              <Route
                path="/setup"
                data-genie-title="研学设置"
                data-genie-key="Setup"
                element={
                  <PageTransition transition="slide-up">
                    <Setup />
                  </PageTransition>
                }
              />
              <Route
                path="/chat"
                data-genie-title="导师对话"
                data-genie-key="Chat"
                element={
                  <PageTransition transition="fade">
                    <Chat />
                  </PageTransition>
                }
              />
              <Route
                path="/route"
                data-genie-title="研学路线"
                data-genie-key="Route"
                element={
                  <PageTransition transition="slide-up">
                    <RoutePage />
                  </PageTransition>
                }
              />
              <Route
                path="/node/:id"
                data-genie-title="节点详情"
                data-genie-key="NodeDetail"
                element={
                  <PageTransition transition="slide-up">
                    <NodeDetail />
                  </PageTransition>
                }
              />
              <Route
                path="/bond"
                data-genie-title="学习画像"
                data-genie-key="Bond"
                element={
                  <PageTransition transition="slide-up">
                    <Bond />
                  </PageTransition>
                }
              />
              <Route
                path="/report"
                data-genie-title="研学报告"
                data-genie-key="Report"
                element={
                  <PageTransition transition="fade">
                    <Report />
                  </PageTransition>
                }
              />
              <Route
                path="*"
                data-genie-key="NotFound"
                data-genie-title="Not Found"
                element={
                  <PageTransition transition="fade">
                    <NotFound />
                  </PageTransition>
                }
              />
            </AnimatedRoutes>
          </BrowserRouter>
        </AppErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
