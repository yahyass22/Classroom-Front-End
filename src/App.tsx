import { GitHubBanner, Refine, ErrorComponent, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import {BrowserRouter, Outlet, Route, Routes, Navigate} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import AuthPage from "@/pages/auth.tsx";
import Dashboard from "@/pages/dashboard.tsx";
import {BookOpen, Clock, GraduationCap, Home, MessageSquare} from "lucide-react";
import {Layout} from "@/components/refine-ui/layout/layout.tsx";
import SubjectsList from "@/pages/subjects/list.tsx";
import SubjectsCreate from "@/pages/subjects/create.tsx";
import ClassesList from "@/pages/classes/list.tsx";
import ClassesCreate from "@/pages/classes/create.tsx";
import ClassesShow from "@/pages/classes/show.tsx";
import DiscussionsListPage from "@/pages/discussions/list.tsx";
import DiscussionsShowPage from "@/pages/discussions/show.tsx";
import DiscussionsNewPage from "@/pages/discussions/new.tsx";
import SchedulePage from "@/pages/schedule.tsx";

// Custom Logo Component
function Logo() {
  return (
    <img
      src="/logo.png?v=1"
      alt="Classroom Logo"
      className="h-8 w-auto object-contain"
    />
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
      <RefineKbarProvider>
        <ThemeProvider>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            notificationProvider={useNotificationProvider()}
            routerProvider={routerProvider}
            title={<Logo />}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "QVd5OO-hUOFVS-XolpMx",
            }}

              resources={[
                  {
                      name: 'Dashboard' ,
                      list:'/' ,
                      meta : {label: 'Dashboard' , icon: <Home/>}
                  },
                  {
                      name: 'schedule',
                      list: '/schedule',
                      meta: { label: 'Schedule', icon: <Clock /> }
                  },
                  {
                      name: 'discussions',
                      list: '/discussions',
                      create: '/discussions/new',
                      meta: {label: 'Discussions' , icon: <MessageSquare /> }
                  },
                  {
                      name: 'subjects',
                      list: '/subjects',
                      create: '/subjects/create',
                      meta: {label: 'Subjects' , icon: <BookOpen /> }
                  },
                  {
                      name: 'classes',
                      list: '/classes',
                      create: '/classes/create',
                      show:'/classes/show/:id',
                      meta: {label: 'Classes' , icon: <GraduationCap /> }
                  }
              ]}
            >
              <Routes>
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route element = {
                      <Authenticated fallback={<Navigate to="/login" /> }>
                          <Layout>
                              <Outlet/>
                          </Layout>
                      </Authenticated>
                  }>
                      <Route path = "/" element={<Dashboard/>} />
                      <Route path = "/schedule" element={<SchedulePage/>} />
                      <Route path = "discussions">
                          <Route index element ={<DiscussionsListPage />} />
                          <Route path = "new" element ={<DiscussionsNewPage/>} />
                          <Route path = ":discussionId" element ={<DiscussionsShowPage/>} />
                      </Route>
                      <Route path = "subjects">
                          <Route index element ={<SubjectsList />} />
                          <Route path = "create" element ={<SubjectsCreate/>} />
                      </Route>
                      <Route path = "classes">
                          <Route index element ={<ClassesList />} />
                          <Route path = "create" element ={<ClassesCreate/>} />
                          <Route path = "show/:id" element ={<ClassesShow/>} />
                          <Route path = ":id/discussions">
                              <Route index element ={<DiscussionsListPage />} />
                              <Route path = "new" element ={<DiscussionsNewPage/>} />
                              <Route path = ":discussionId" element ={<DiscussionsShowPage/>} />
                          </Route>
                      </Route>
                  </Route>
                  <Route path="*" element={<ErrorComponent />} />
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
        </ThemeProvider>
      </RefineKbarProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;






