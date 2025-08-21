import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, Play } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import toast from "react-hot-toast";
import type { Project } from "../types";
import apiService from "../services/api";

const videoSchema = z.object({
    title: z.string().min(1, "Video title is required"),
    description: z.string().optional(),
    playbackId: z.string().min(1, "Playback ID is required"),
    thumbnail: z.string().optional(),
    featured: z.boolean(),
    projectId: z.string().min(1, "Project is required"),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface VideoFormProps {
    mode: "create" | "edit";
}

const VideoForm: React.FC<VideoFormProps> = ({ mode }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<VideoFormData>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            featured: false,
        },
    });

    useEffect(() => {
        fetchProjects();
        if (mode === "edit" && id) {
            fetchVideo();
        }
    }, [mode, id]);

    const fetchProjects = async () => {
        try {
            const publishedProjects = await apiService.getPublishedProjects();
            setProjects(publishedProjects);
        } catch (error) {
            console.error("Failed to fetch published projects:", error);
        }
    };

    const fetchVideo = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const video = await apiService.getVideo(id);
            setValue("title", video.title);
            setValue("description", video.description || "");
            setValue("playbackId", video.playbackId);
            setValue("thumbnail", video.thumbnail);
            setValue("featured", video.featured);
            setValue("projectId", video.projectId);

            setThumbnailPreview(video.thumbnail);
        } catch (error) {
            console.error("Failed to fetch video:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setThumbnailFile(file);
                setThumbnailPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setThumbnailFile(null);
            setThumbnailPreview("");
        }
    };

    const uploadThumbnail = async (projectName: string, playbackId: string) => {
        if (thumbnailFile) {
            // Create video folder first
            await apiService.createVideoFolder(projectName, playbackId);

            // Upload thumbnail to the specific video folder
            const result = await apiService.uploadVideoThumbnail(
                thumbnailFile,
                projectName,
                playbackId
            );
            return result.url;
        }
        return undefined;
    };

    const onSubmit = async (data: VideoFormData) => {
        try {
            setLoading(true);

            // Prevent wasteful uploads if trying to exceed featured cap for videos
            if (data.featured) {
                try {
                    const counts = await apiService.getFeaturedCounts();
                    if (counts.videos >= 3 && mode === "create") {
                        toast.error(
                            "Only 3 featured videos are allowed. Please unfeature an existing video first."
                        );
                        setLoading(false);
                        return;
                    }
                    if (counts.videos >= 3 && mode === "edit") {
                        toast.error(
                            "Only 3 featured videos are allowed. Please unfeature an existing video first."
                        );
                        setLoading(false);
                        return;
                    }
                } catch {}
            }

            // Find the selected project to get its name
            const selectedProject = projects.find(
                (p) => p.id === data.projectId
            );
            if (!selectedProject) {
                throw new Error("Selected project not found");
            }

            // Upload thumbnail if any
            const thumbnailUrl = await uploadThumbnail(
                selectedProject.name,
                data.playbackId
            );

            const videoData = {
                ...data,
                thumbnail: thumbnailUrl || data.thumbnail,
            };

            if (mode === "create") {
                await apiService.createVideo(videoData);
                toast.success("Video created successfully");
            } else if (id) {
                await apiService.updateVideo(id, videoData);
                toast.success("Video updated successfully");
            }

            navigate("/videos");
        } catch (error) {
            console.error("Failed to save video:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && mode === "edit") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {mode === "create" ? "Add New Video" : "Edit Video"}
                    </h1>
                    <p className="text-gray-600">
                        {mode === "create"
                            ? "Add a new video to the Sui ecosystem directory"
                            : "Update video information"}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/videos")}
                    className="btn-secondary flex items-center"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Video Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Video Title *
                                    </label>
                                    <input
                                        {...register("title")}
                                        type="text"
                                        id="title"
                                        className="input-field"
                                        placeholder="Enter video title"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        {...register("description")}
                                        id="description"
                                        rows={3}
                                        className="input-field"
                                        placeholder="Describe the video content..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="playbackId"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Mux Playback ID *
                                    </label>
                                    <div className="relative">
                                        <Play className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            {...register("playbackId")}
                                            type="text"
                                            id="playbackId"
                                            className="input-field pl-10"
                                            placeholder="Enter Mux playback ID (e.g. aBcDeFgHiJkL01234567)"
                                        />
                                    </div>
                                    {errors.playbackId && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.playbackId.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Project Selection */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Project Association
                            </h3>

                            <div>
                                <label
                                    htmlFor="projectId"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Associated Project *
                                </label>
                                <select
                                    {...register("projectId")}
                                    id="projectId"
                                    className="input-field"
                                >
                                    <option value="">Select a project</option>
                                    {projects.map((project) => (
                                        <option
                                            key={project.id}
                                            value={project.id}
                                        >
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.projectId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.projectId.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Note about categories */}
                        <div className="card p-6 bg-blue-50 border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Categories
                            </h3>
                            <p className="text-sm text-blue-700">
                                Categories are automatically inherited from the
                                selected project. No manual selection needed.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Settings */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Settings
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        {...register("featured")}
                                        type="checkbox"
                                        id="featured"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="featured"
                                        className="ml-2 block text-sm text-gray-900"
                                    >
                                        Featured Video
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Thumbnail
                            </h3>

                            <div className="space-y-4">
                                {thumbnailPreview && (
                                    <div className="space-y-2">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="w-full h-32 rounded-lg object-cover border"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(
                                                e.target.files?.[0] || null
                                            )
                                        }
                                        className="input-field"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Recommended size: 1280x720px
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Video Preview */}
                        {watch("playbackId") && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Video Preview
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 break-all">
                                        Playback ID: {watch("playbackId")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        This video will be played using Mux
                                        Player
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <MuxPlayer
                                        style={{ width: "100%" }}
                                        playbackId={watch("playbackId")}
                                        poster={thumbnailPreview || undefined}
                                        autoPlay="muted"
                                        muted
                                        loop
                                        preload="auto"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save Video"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoForm;
