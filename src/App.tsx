import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import VideosPage from "./pages/VideosPage";
import ProjectForm from "./components/ProjectForm";
import VideoForm from "./components/VideoForm";
import VideoDetailPage from "./pages/VideoDetailPage";

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route
                        path="projects/new"
                        element={<ProjectForm mode="create" />}
                    />
                    <Route
                        path="projects/:id"
                        element={<ProjectDetailPage />}
                    />
                    <Route
                        path="projects/:id/edit"
                        element={<ProjectForm mode="edit" />}
                    />

                    {/* Video routes */}
                    <Route path="videos" element={<VideosPage />} />
                    <Route
                        path="videos/new"
                        element={<VideoForm mode="create" />}
                    />
                    <Route path="videos/:id" element={<VideoDetailPage />} />
                    <Route
                        path="videos/:id/edit"
                        element={<VideoForm mode="edit" />}
                    />

                    {/* Add more routes as needed */}
                    <Route
                        path="settings"
                        element={<div>Settings Page (Coming Soon)</div>}
                    />
                </Route>

                {/* Catch all route */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;
