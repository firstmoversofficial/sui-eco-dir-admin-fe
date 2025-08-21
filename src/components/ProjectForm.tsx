import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, Globe, Twitter, Github, Check, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Category } from "../types";
import apiService from "../services/api";

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    tagline: z.string().min(1, "Project tagline is required"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    categories: z.array(z.string()).min(1, "At least one category is required"),

    // Optional fields with conditional validation
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    // Boolean fields
    isHiring: z.boolean(),
    careerPageUrl: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .or(z.literal("")),
    isOpenForBounty: z.boolean(),
    bountySubmissionUrl: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .or(z.literal("")),
    isOpenSource: z.boolean(),
    githubUrl: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .or(z.literal("")),

    // Social links
    includeSocialLinks: z.object({
        website: z.boolean(),
        twitter: z.boolean(),
        github: z.boolean(),
        discord: z.boolean(),
        telegram: z.boolean(),
    }),

    socialLinks: z.object({
        website: z
            .string()
            .url("Must be a valid URL")
            .optional()
            .or(z.literal("")),
        twitter: z
            .string()
            .url("Must be a valid URL")
            .optional()
            .or(z.literal("")),
        github: z
            .string()
            .url("Must be a valid URL")
            .optional()
            .or(z.literal("")),
        discord: z
            .string()
            .url("Must be a valid URL")
            .optional()
            .or(z.literal("")),
        telegram: z
            .string()
            .url("Must be a valid URL")
            .optional()
            .or(z.literal("")),
    }),

    featured: z.boolean(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
    mode: "create" | "edit";
}

const ProjectForm: React.FC<ProjectFormProps> = ({ mode }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // File uploads
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [projectImageFiles, setProjectImageFiles] = useState<File[]>([]);

    // Previews
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [heroImagePreview, setHeroImagePreview] = useState<string>("");
    const [projectImagePreviews, setProjectImagePreviews] = useState<string[]>(
        []
    );

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Note: Boolean field states are managed through react-hook-form watch

    // Social links states
    const [socialLinksSelection, setSocialLinksSelection] = useState({
        website: false,
        twitter: false,
        github: false,
        discord: false,
        telegram: false,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            featured: false,
            status: "UNPUBLISHED",
            isHiring: false,
            isOpenForBounty: false,
            isOpenSource: false,
            includeSocialLinks: {
                website: false,
                twitter: false,
                github: false,
                discord: false,
                telegram: false,
            },
            socialLinks: {
                website: "",
                twitter: "",
                github: "",
                discord: "",
                telegram: "",
            },
        },
    });

    const watchedIsHiring = watch("isHiring");
    const watchedIsOpenForBounty = watch("isOpenForBounty");
    const watchedIsOpenSource = watch("isOpenSource");

    // Ensure dependent URL boxes render immediately after we programmatically set values
    useEffect(() => {
        // no-op effect triggers re-render when we set values above
    }, [watchedIsHiring, watchedIsOpenForBounty, watchedIsOpenSource]);

    useEffect(() => {
        fetchCategories();
        if (mode === "edit" && id) {
            fetchProject();
        }
    }, [mode, id]);

    const fetchCategories = async () => {
        try {
            const categoriesData = await apiService.getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchProject = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const project = await apiService.getProject(id);

            // Set form values
            setValue("name", project.name);
            setValue("tagline", project.tagline);
            setValue("description", project.description);
            setValue("categories", project.categories);
            setValue("featured", project.featured);
            setValue("status", project.status);

            // Set boolean fields and ensure dropdowns reflect existing URLs
            setValue("isHiring", project.isHiring || !!project.careerPageUrl);
            setValue("careerPageUrl", project.careerPageUrl || "");
            setValue(
                "isOpenForBounty",
                project.isOpenForBounty || !!project.bountySubmissionUrl
            );
            setValue("bountySubmissionUrl", project.bountySubmissionUrl || "");
            setValue(
                "isOpenSource",
                project.isOpenSource || !!project.githubUrl
            );
            setValue("githubUrl", project.githubUrl || "");

            // Set image previews
            setLogoPreview(project.logo || "");
            setHeroImagePreview(project.heroImage || "");
            if (Array.isArray(project.images)) {
                setProjectImagePreviews(project.images);
            }

            // Set categories
            setSelectedCategories(project.categories);

            // Social links mapping into checkboxes + values if present
            const social = (project as any).socialLinks || ({} as any);
            const include = {
                website: !!social.website,
                twitter: !!social.twitter,
                github: !!social.github,
                discord: !!social.discord,
                telegram: !!social.telegram,
            };
            setSocialLinksSelection(include);
            setValue("includeSocialLinks.website", include.website);
            setValue("includeSocialLinks.twitter", include.twitter);
            setValue("includeSocialLinks.github", include.github);
            setValue("includeSocialLinks.discord", include.discord);
            setValue("includeSocialLinks.telegram", include.telegram);
            setValue("socialLinks.website", social.website || "");
            setValue("socialLinks.twitter", social.twitter || "");
            setValue("socialLinks.github", social.github || "");
            setValue("socialLinks.discord", social.discord || "");
            setValue("socialLinks.telegram", social.telegram || "");
        } catch (error) {
            console.error("Failed to fetch project:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (
        file: File | null,
        type: "logo" | "hero-image"
    ) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === "logo") {
                    setLogoFile(file);
                    setLogoPreview(e.target?.result as string);
                } else {
                    setHeroImageFile(file);
                    setHeroImagePreview(e.target?.result as string);
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (type === "logo") {
                setLogoFile(null);
                setLogoPreview("");
            } else {
                setHeroImageFile(null);
                setHeroImagePreview("");
            }
        }
    };

    const handleProjectImagesChange = (files: FileList | null) => {
        if (files) {
            const fileArray = Array.from(files);
            setProjectImageFiles((prev) => [...prev, ...fileArray]);

            // Create previews
            fileArray.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setProjectImagePreviews((prev) => [
                        ...prev,
                        e.target?.result as string,
                    ]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeProjectImage = (index: number) => {
        setProjectImageFiles((prev) => prev.filter((_, i) => i !== index));
        setProjectImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleCategory = (categoryName: string) => {
        const updatedCategories = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((cat) => cat !== categoryName)
            : [...selectedCategories, categoryName];

        setSelectedCategories(updatedCategories);
        setValue("categories", updatedCategories);
    };

    const toggleSocialLink = (platform: keyof typeof socialLinksSelection) => {
        setSocialLinksSelection((prev) => {
            const updated = { ...prev, [platform]: !prev[platform] };
            setValue(`includeSocialLinks.${platform}`, updated[platform]);
            return updated;
        });
    };

    const uploadFiles = async (projectName: string) => {
        const uploads: {
            logo?: string;
            heroImage?: string;
            projectImages?: string[];
        } = {};

        // Create project folders first
        await apiService.createProjectFolders(projectName);

        if (logoFile) {
            const result = await apiService.uploadFile(
                logoFile,
                "logo",
                projectName
            );
            uploads.logo = result.url;
        }

        if (heroImageFile) {
            const result = await apiService.uploadFile(
                heroImageFile,
                "project-hero-image",
                projectName
            );
            uploads.heroImage = result.url;
        }

        if (projectImageFiles.length > 0) {
            const results = await apiService.uploadMultipleFiles(
                projectImageFiles,
                "project-image",
                projectName
            );
            uploads.projectImages = results.map((r) => r.url);
        }

        return uploads;
    };

    const onSubmit = async (data: ProjectFormData) => {
        try {
            setLoading(true);

            // Prevent wasteful uploads if trying to exceed featured cap
            if (data.featured) {
                try {
                    const counts = await apiService.getFeaturedCounts();
                    if (counts.projects >= 3 && mode === "create") {
                        toast.error(
                            "Only 3 featured projects are allowed. Please unfeature an existing project first."
                        );
                        setLoading(false);
                        return;
                    }
                    if (counts.projects >= 3 && mode === "edit") {
                        toast.error(
                            "Only 3 featured projects are allowed. Please unfeature an existing project first."
                        );
                        setLoading(false);
                        return;
                    }
                } catch {}
            }

            // Upload files if any
            const uploads = await uploadFiles(data.name);

            // Prepare project data
            const projectData: any = {
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                categories: data.categories,
                featured: data.featured,
                status: data.status,

                // Boolean fields
                isHiring: data.isHiring,
                careerPageUrl: data.isHiring ? data.careerPageUrl : undefined,
                isOpenForBounty: data.isOpenForBounty,
                bountySubmissionUrl: data.isOpenForBounty
                    ? data.bountySubmissionUrl
                    : undefined,
                isOpenSource: data.isOpenSource,
                githubUrl: data.isOpenSource ? data.githubUrl : undefined,

                // File uploads
                ...uploads,

                // Social links
                socialLinks: Object.fromEntries(
                    Object.entries(data.socialLinks).filter(
                        ([key, value]) =>
                            data.includeSocialLinks[
                                key as keyof typeof data.includeSocialLinks
                            ] && value
                    )
                ),
            };

            if (mode === "create") {
                await apiService.createProject(projectData);
                toast.success("Project created successfully");
            } else if (id) {
                await apiService.updateProject(id, projectData);
                toast.success("Project updated successfully");
            }

            navigate("/projects");
        } catch (error) {
            console.error("Failed to save project:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {mode === "create" ? "Add New Project" : "Edit Project"}
                    </h1>
                    <p className="text-gray-600">
                        {mode === "create"
                            ? "Add a new project to the Sui ecosystem directory"
                            : "Update project information"}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/projects")}
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
                                Basic Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Project Name *
                                    </label>
                                    <input
                                        {...register("name")}
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter project name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="tagline"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Tagline *
                                    </label>
                                    <input
                                        {...register("tagline")}
                                        type="text"
                                        className="input-field"
                                        placeholder="Short, compelling tagline for the project"
                                        required
                                    />
                                    {errors.tagline && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.tagline.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Full Description *
                                    </label>
                                    <textarea
                                        {...register("description")}
                                        rows={4}
                                        className="input-field"
                                        placeholder="Detailed description of the project"
                                        required
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                {/* Removed duplicate Website URL; handled in Social Links */}
                            </div>
                        </div>

                        {/* Project Information */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Project Information
                            </h3>

                            <div className="space-y-6">
                                {/* Is Hiring */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Is your company hiring? *
                                    </label>
                                    <select
                                        {...register("isHiring", {
                                            setValueAs: (value) =>
                                                value === "true",
                                        })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>

                                    {watchedIsHiring && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Career Page URL *
                                            </label>
                                            <input
                                                {...register("careerPageUrl")}
                                                type="url"
                                                className="input-field"
                                                placeholder="https://yourcompany.com/careers"
                                                required={watchedIsHiring}
                                            />
                                            {errors.careerPageUrl && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {
                                                        errors.careerPageUrl
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Open for Bounty */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Are you open for bounty video
                                        submissions? *
                                    </label>
                                    <select
                                        {...register("isOpenForBounty", {
                                            setValueAs: (value) =>
                                                value === "true",
                                        })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>

                                    {watchedIsOpenForBounty && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bounty Submission Form URL *
                                            </label>
                                            <input
                                                {...register(
                                                    "bountySubmissionUrl"
                                                )}
                                                type="url"
                                                className="input-field"
                                                placeholder="https://yourcompany.com/bounty-submission"
                                                required={
                                                    watchedIsOpenForBounty
                                                }
                                            />
                                            {errors.bountySubmissionUrl && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {
                                                        errors
                                                            .bountySubmissionUrl
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Open Source */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Is this project open source? *
                                    </label>
                                    <select
                                        {...register("isOpenSource", {
                                            setValueAs: (value) =>
                                                value === "true",
                                        })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>

                                    {watchedIsOpenSource && (
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                GitHub Repository URL *
                                            </label>
                                            <input
                                                {...register("githubUrl")}
                                                type="url"
                                                className="input-field"
                                                placeholder="https://github.com/yourcompany/project"
                                                required={watchedIsOpenSource}
                                            />
                                            {errors.githubUrl && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.githubUrl.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Social Links
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Select which social platforms you want to
                                include and provide their URLs.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        key: "website",
                                        label: "Website",
                                        icon: Globe,
                                    },
                                    {
                                        key: "twitter",
                                        label: "Twitter",
                                        icon: Twitter,
                                    },
                                    {
                                        key: "github",
                                        label: "GitHub",
                                        icon: Github,
                                    },
                                    {
                                        key: "discord",
                                        label: "Discord",
                                        icon: Globe,
                                    },
                                    {
                                        key: "telegram",
                                        label: "Telegram",
                                        icon: Globe,
                                    },
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id={`include-${key}`}
                                                checked={
                                                    socialLinksSelection[
                                                        key as keyof typeof socialLinksSelection
                                                    ]
                                                }
                                                onChange={() =>
                                                    toggleSocialLink(
                                                        key as keyof typeof socialLinksSelection
                                                    )
                                                }
                                                className="rounded border-gray-300"
                                            />
                                            <Icon className="w-4 h-4 text-gray-500" />
                                            <label
                                                htmlFor={`include-${key}`}
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                {label}
                                            </label>
                                        </div>

                                        {socialLinksSelection[
                                            key as keyof typeof socialLinksSelection
                                        ] && (
                                            <input
                                                {...register(
                                                    `socialLinks.${key}` as any
                                                )}
                                                type="url"
                                                className="input-field ml-7"
                                                placeholder={`https://${
                                                    key === "website"
                                                        ? "yoursite.com"
                                                        : key +
                                                          ".com/yourproject"
                                                }`}
                                                required={
                                                    socialLinksSelection[
                                                        key as keyof typeof socialLinksSelection
                                                    ]
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Categories *
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Select at least one category that best describes
                                your project.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() =>
                                            toggleCategory(category.name)
                                        }
                                        className={`p-3 rounded-lg border text-left transition-colors ${
                                            selectedCategories.includes(
                                                category.name
                                            )
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {category.name}
                                            </span>
                                            {selectedCategories.includes(
                                                category.name
                                            ) && (
                                                <Check className="w-4 h-4 text-blue-600" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {category.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            {errors.categories && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.categories.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Status
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Do you want to publish this project
                                        immediately? *
                                    </label>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Published projects will be visible to
                                        users. You can change this later.
                                    </p>
                                    <select
                                        {...register("status")}
                                        className="input-field"
                                    >
                                        <option value="UNPUBLISHED">
                                            No, create as draft (Unpublished)
                                        </option>
                                        <option value="PUBLISHED">
                                            Yes, publish immediately (Published)
                                        </option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        {...register("featured")}
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Featured Project
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Images
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Logo
                                    </label>
                                    <div className="space-y-2">
                                        {logoPreview && (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-16 h-16 rounded-lg object-cover border"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleFileChange(
                                                    e.target.files?.[0] || null,
                                                    "logo"
                                                )
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hero Image
                                    </label>
                                    <div className="space-y-2">
                                        {heroImagePreview && (
                                            <img
                                                src={heroImagePreview}
                                                alt="Hero image preview"
                                                className="w-full h-32 rounded-lg object-cover border"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleFileChange(
                                                    e.target.files?.[0] || null,
                                                    "hero-image"
                                                )
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Images
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) =>
                                                handleProjectImagesChange(
                                                    e.target.files
                                                )
                                            }
                                            className="input-field"
                                        />

                                        {projectImagePreviews.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {projectImagePreviews.map(
                                                    (preview, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative"
                                                        >
                                                            <img
                                                                src={preview}
                                                                alt={`Project image ${
                                                                    index + 1
                                                                }`}
                                                                className="w-full h-20 rounded object-cover border"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeProjectImage(
                                                                        index
                                                                    )
                                                                }
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate("/projects")}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {mode === "create"
                            ? "Create Project"
                            : "Update Project"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
