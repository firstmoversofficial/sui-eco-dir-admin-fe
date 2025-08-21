export interface User {
    id: string;
    username: string;
    email: string;
    role: "admin" | "moderator";
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    tagline: string;
    description: string;
    categories: string[];
    website?: string;
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
    logo?: string;
    heroImage?: string;
    images?: string[];

    // New boolean fields
    isHiring: boolean;
    careerPageUrl?: string;
    isOpenForBounty: boolean;
    bountySubmissionUrl?: string;
    isOpenSource: boolean;
    githubUrl?: string;

    featured: boolean;
    status: "PUBLISHED" | "UNPUBLISHED";
    createdAt: string;
    updatedAt: string;

    // Optional nested social links from backend responses
    socialLinks?: {
        website: string | null;
        github: string | null;
        twitter: string | null;
        discord: string | null;
        telegram: string | null;
        medium?: string | null;
        youtube?: string | null;
    };
}

export interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    projectCount: number;
    createdAt: string;
}

export interface Video {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    playbackId: string;
    thumbnail: string;
    featured: boolean;
    categories: string[];
    createdAt: string;
    updatedAt: string;
    projectName?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    totalCategories: number;
    totalVideos: number;
    featuredProjectCount?: number;
    featuredVideoCount?: number;
    monthlyProjectCounts?: { month: string; count: number }[];
    categoryCounts?: { name: string; projectCount: number }[];
    recentProjects: Project[];
    topCategories: Category[];
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
