import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import mongoose from "mongoose";


export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const normalizedRequirements = [
            ...new Set(
                requirements
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            )
        ];

        const job = await Job.create({
            title,
            description,
            requirements: normalizedRequirements,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getRecommendedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("profile.skills savedJobs");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        const skills = (user.profile?.skills || [])
            .map((skill) => skill?.trim())
            .filter(Boolean);

        if (skills.length === 0) {
            return res.status(200).json({
                jobs: [],
                matchMode: "none",
                message: "Add skills to your profile to unlock job recommendations.",
                success: true
            });
        }

        const applications = await Application.find({ applicant: userId }).select("job");
        const excludedJobIds = [
            ...(user.savedJobs || []),
            ...applications.map((application) => application.job)
        ];
        const jobs = await Job.aggregate([
            {
                $match: {
                    requirements: { $in: skills },
                    _id: { $nin: excludedJobIds }
                }
            },
            {
                $unwind: "$requirements"
            },
            {
                $match: {
                    requirements: { $in: skills }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    salary: { $first: "$salary" },
                    location: { $first: "$location" },
                    jobType: { $first: "$jobType" },
                    company: { $first: "$company" },
                    createdAt: { $first: "$createdAt" },
                    matchedSkills: { $push: "$requirements" },
                    matchCount: { $sum: 1 }
                }
            },
            {
                $sort: {
                    matchCount: -1,
                    createdAt: -1
                }
            },
            {
                $limit: 6
            }
        ]);

        const companyIds = [...new Set(jobs.map((job) => job.company?.toString()).filter(Boolean))];
        const companies = await Company.find({ _id: { $in: companyIds } }).select("name logo");
        const companyMap = new Map(companies.map((company) => [company._id.toString(), company]));

        const formattedJobs = jobs.map((job) => ({
            jobId: job._id,
            title: job.title,
            description: job.description,
            salary: job.salary,
            location: job.location,
            jobType: job.jobType,
            createdAt: job.createdAt,
            matchCount: job.matchCount,
            matchedSkills: job.matchedSkills,
            company: companyMap.get(job.company?.toString()) || null
        }));

        return res.status(200).json({
            jobs: formattedJobs,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getAdminJobAnalytics = async (req, res) => {
    try {
        const adminId = new mongoose.Types.ObjectId(req.id);
        const adminJobs = await Job.find({ created_by: adminId }).select("_id title company");
        const adminJobIds = adminJobs.map((job) => job._id);
        const companyIds = [...new Set(adminJobs.map((job) => job.company?.toString()).filter(Boolean))];
        const companies = await Company.find({ _id: { $in: companyIds } }).select("name");
        const companyMap = new Map(companies.map((company) => [company._id.toString(), company.name]));
        const adminJobMap = new Map(adminJobs.map((job) => [
            job._id.toString(),
            {
                title: job.title,
                companyName: companyMap.get(job.company?.toString()) || "Unknown company"
            }
        ]));

        const [jobOverview = { _id: null, totalJobs: 0, totalOpenPositions: 0 }] = await Job.aggregate([
            {
                $match: { created_by: adminId }
            },
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    totalOpenPositions: { $sum: "$position" }
                }
            }
        ]);

        const jobTypes = await Job.aggregate([
            {
                $match: { created_by: adminId }
            },
            {
                $group: {
                    _id: "$jobType",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1, _id: 1 }
            }
        ]);

        const topRequirements = await Job.aggregate([
            {
                $match: { created_by: adminId }
            },
            {
                $unwind: "$requirements"
            },
            {
                $group: {
                    _id: "$requirements",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1, _id: 1 }
            },
            {
                $limit: 5
            }
        ]);

        const applicationMatch = { job: { $in: adminJobIds } };
        const [applicationOverview = { _id: null, totalApplications: 0 }] = adminJobIds.length > 0
            ? await Application.aggregate([
                {
                    $match: applicationMatch
                },
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: 1 }
                    }
                }
            ])
            : [{ _id: null, totalApplications: 0 }];

        const statusBreakdownRaw = adminJobIds.length > 0
            ? await Application.aggregate([
                {
                    $match: applicationMatch
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1, _id: 1 }
                }
            ])
            : [];

        const topJobsRaw = adminJobIds.length > 0
            ? await Application.aggregate([
                {
                    $match: applicationMatch
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: "$job",
                        totalApplications: { $sum: 1 },
                        latestApplicationAt: { $first: "$createdAt" }
                    }
                },
                {
                    $sort: { totalApplications: -1, latestApplicationAt: -1 }
                },
                {
                    $limit: 5
                }
            ])
            : [];

        const statusCounts = statusBreakdownRaw.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        const acceptanceRate = applicationOverview.totalApplications > 0
            ? Math.round(((statusCounts.accepted || 0) / applicationOverview.totalApplications) * 100)
            : 0;

        return res.status(200).json({
            analytics: {
                overview: {
                    totalJobs: jobOverview.totalJobs || 0,
                    totalOpenPositions: jobOverview.totalOpenPositions || 0,
                    totalApplications: applicationOverview.totalApplications || 0,
                    acceptedCount: statusCounts.accepted || 0,
                    pendingCount: statusCounts.pending || 0,
                    rejectedCount: statusCounts.rejected || 0,
                    acceptanceRate
                },
                jobTypes: jobTypes.map((item) => ({
                    label: item._id,
                    count: item.count
                })),
                topRequirements: topRequirements.map((item) => ({
                    skill: item._id,
                    count: item.count
                })),
                statusBreakdown: statusBreakdownRaw.map((item) => ({
                    status: item._id,
                    count: item.count
                })),
                topJobs: topJobsRaw.map((item) => ({
                    jobId: item._id,
                    title: adminJobMap.get(item._id.toString())?.title || "Unknown job",
                    companyName: adminJobMap.get(item._id.toString())?.companyName || "Unknown company",
                    totalApplications: item.totalApplications
                }))
            },
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}

export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
