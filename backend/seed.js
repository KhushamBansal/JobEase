import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./utils/db.js";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { Application } from "./models/application.model.js";

dotenv.config({});

const plainPassword = "password123";

const printSection = (title) => {
    console.log(`\n=== ${title} ===`);
};

const seedDatabase = async () => {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection is not ready. Check MONGO_URI before running seed.");
    }

    printSection("Resetting collections");
    await Application.deleteMany({});
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    printSection("Creating users");
    const users = await User.insertMany([
        {
            fullname: "Aarav Recruiter",
            email: "aarav.recruiter@jobease.dev",
            phoneNumber: 900000001,
            password: hashedPassword,
            role: "recruiter",
            profile: {
                bio: "Tech recruiter hiring across data and platform roles."
            }
        },
        {
            fullname: "Diya Recruiter",
            email: "diya.recruiter@jobease.dev",
            phoneNumber: 900000002,
            password: hashedPassword,
            role: "recruiter",
            profile: {
                bio: "Product and analytics hiring lead."
            }
        },
        {
            fullname: "Rohan Student",
            email: "rohan.student@jobease.dev",
            phoneNumber: 900000003,
            password: hashedPassword,
            role: "student",
            profile: {
                bio: "Backend developer interested in data tooling.",
                skills: ["Node.js", "MongoDB", "Express", "Aggregation"],
                resume: "https://example.com/resumes/rohan.pdf",
                resumeOriginalName: "rohan-resume.pdf"
            }
        },
        {
            fullname: "Sneha Student",
            email: "sneha.student@jobease.dev",
            phoneNumber: 900000004,
            password: hashedPassword,
            role: "student",
            profile: {
                bio: "Frontend engineer expanding into analytics.",
                skills: ["React", "JavaScript", "MongoDB", "Data Visualization"],
                resume: "https://example.com/resumes/sneha.pdf",
                resumeOriginalName: "sneha-resume.pdf"
            }
        },
        {
            fullname: "Kabir Student",
            email: "kabir.student@jobease.dev",
            phoneNumber: 900000005,
            password: hashedPassword,
            role: "student",
            profile: {
                bio: "Data engineering learner.",
                skills: ["Python", "SQL", "ETL"],
                resume: "https://example.com/resumes/kabir.pdf",
                resumeOriginalName: "kabir-resume.pdf"
            }
        }
    ]);

    const [aarav, diya, rohan, sneha, kabir] = users;

    printSection("Creating companies");
    const companies = await Company.insertMany([
        {
            name: "DataForge",
            description: "Builds data platforms and internal analytics systems.",
            website: "https://dataforge.example.com",
            location: "Bengaluru",
            logo: "https://placehold.co/80x80?text=DF",
            userId: aarav._id
        },
        {
            name: "InsightLoop",
            description: "Analytics and experimentation platform for modern teams.",
            website: "https://insightloop.example.com",
            location: "Pune",
            logo: "https://placehold.co/80x80?text=IL",
            userId: diya._id
        }
    ]);

    const [dataForge, insightLoop] = companies;

    printSection("Creating jobs");
    const jobs = await Job.insertMany([
        {
            title: "Backend Engineer",
            description: "Build APIs and services for recruiter workflows.",
            requirements: ["Node.js", "Express", "MongoDB"],
            salary: 14,
            experienceLevel: 2,
            location: "Bengaluru",
            jobType: "Full-time",
            position: 3,
            company: dataForge._id,
            created_by: aarav._id
        },
        {
            title: "Data Engineer",
            description: "Design ETL pipelines and warehouse models.",
            requirements: ["Python", "SQL", "MongoDB", "ETL"],
            salary: 18,
            experienceLevel: 3,
            location: "Hyderabad",
            jobType: "Full-time",
            position: 2,
            company: dataForge._id,
            created_by: aarav._id
        },
        {
            title: "Analytics Engineer",
            description: "Own reporting pipelines and product metrics.",
            requirements: ["SQL", "MongoDB", "Aggregation", "Data Visualization"],
            salary: 16,
            experienceLevel: 2,
            location: "Pune",
            jobType: "Hybrid",
            position: 2,
            company: insightLoop._id,
            created_by: diya._id
        },
        {
            title: "Frontend Developer",
            description: "Build dashboards and job search experiences.",
            requirements: ["React", "JavaScript", "MongoDB"],
            salary: 12,
            experienceLevel: 1,
            location: "Remote",
            jobType: "Remote",
            position: 4,
            company: insightLoop._id,
            created_by: diya._id
        },
        {
            title: "Platform Engineer",
            description: "Maintain developer tooling and deployment systems.",
            requirements: ["Node.js", "MongoDB", "CI/CD"],
            salary: 20,
            experienceLevel: 4,
            location: "Bengaluru",
            jobType: "Full-time",
            position: 1,
            company: dataForge._id,
            created_by: aarav._id
        }
    ]);

    const [backendEngineer, dataEngineer, analyticsEngineer, frontendDeveloper, platformEngineer] = jobs;

    printSection("Applying array operators");
    await User.updateOne(
        { _id: rohan._id },
        {
            $addToSet: {
                "profile.skills": { $each: ["Indexes", "MongoDB", "Node.js"] }
            },
            $push: {
                savedJobs: { $each: [backendEngineer._id, analyticsEngineer._id] }
            }
        }
    );

    await User.updateOne(
        { _id: sneha._id },
        {
            $addToSet: {
                "profile.skills": { $each: ["Aggregation", "React"] }
            },
            $push: {
                savedJobs: { $each: [frontendDeveloper._id, analyticsEngineer._id] }
            }
        }
    );

    await User.updateOne(
        { _id: kabir._id },
        {
            $push: {
                savedJobs: { $each: [dataEngineer._id, platformEngineer._id] }
            }
        }
    );

    await User.updateOne(
        { _id: kabir._id },
        {
            $pull: {
                savedJobs: platformEngineer._id
            }
        }
    );

    await Job.updateOne(
        { _id: backendEngineer._id },
        {
            $push: {
                requirements: { $each: ["REST APIs", "Debugging"] }
            }
        }
    );

    await Job.updateOne(
        { _id: analyticsEngineer._id },
        {
            $addToSet: {
                requirements: { $each: ["Aggregation", "Dashboards"] }
            }
        }
    );

    await Job.updateOne(
        { _id: frontendDeveloper._id },
        {
            $pull: {
                requirements: "MongoDB"
            }
        }
    );

    printSection("Creating applications");
    const applications = await Application.insertMany([
        {
            job: backendEngineer._id,
            applicant: rohan._id,
            status: "pending"
        },
        {
            job: dataEngineer._id,
            applicant: kabir._id,
            status: "accepted"
        },
        {
            job: analyticsEngineer._id,
            applicant: sneha._id,
            status: "pending"
        },
        {
            job: frontendDeveloper._id,
            applicant: sneha._id,
            status: "accepted"
        },
        {
            job: backendEngineer._id,
            applicant: sneha._id,
            status: "rejected"
        },
        {
            job: analyticsEngineer._id,
            applicant: rohan._id,
            status: "accepted"
        }
    ]);

    const applicationIdsByJob = applications.reduce((acc, application) => {
        const jobId = application.job.toString();
        if (!acc[jobId]) acc[jobId] = [];
        acc[jobId].push(application._id);
        return acc;
    }, {});

    await Promise.all(
        Object.entries(applicationIdsByJob).map(([jobId, applicationIds]) =>
            Job.updateOne(
                { _id: jobId },
                {
                    $push: {
                        applications: { $each: applicationIds }
                    }
                }
            )
        )
    );

    printSection("Syncing and showing indexes");
    await Job.syncIndexes();
    await Application.syncIndexes();
    console.log("Job indexes:", await Job.collection.indexes());
    console.log("Application indexes:", await Application.collection.indexes());

    printSection("Comparison and logical operator examples");
    const comparisonJobs = await Job.find({
        $and: [
            { salary: { $gte: 14 } },
            { experienceLevel: { $lte: 3 } }
        ]
    }).select("title salary experienceLevel");
    console.log("Jobs with salary >= 14 and experience <= 3:", comparisonJobs);

    const logicalJobs = await Job.find({
        $or: [
            { location: "Remote" },
            { requirements: { $in: ["Aggregation", "MongoDB"] } }
        ]
    }).select("title location requirements");
    console.log("Jobs matching logical query:", logicalJobs);

    printSection("Aggregation examples");
    const jobTypeMix = await Job.aggregate([
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
    console.log("Job type mix:", jobTypeMix);

    const topRequirements = await Job.aggregate([
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
    console.log("Top requirements:", topRequirements);

    const applicationStatuses = await Application.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1, _id: 1 }
        }
    ]);
    console.log("Application status breakdown:", applicationStatuses);

    const remoteJobCount = await Job.aggregate([
        {
            $match: {
                location: "Remote"
            }
        },
        {
            $count: "remoteJobs"
        }
    ]);
    console.log("Remote job count using $count:", remoteJobCount);

    const recommendationPreview = await Job.aggregate([
        {
            $match: {
                requirements: { $in: rohan.profile.skills }
            }
        },
        {
            $unwind: "$requirements"
        },
        {
            $match: {
                requirements: { $in: rohan.profile.skills }
            }
        },
        {
            $group: {
                _id: "$title",
                matchedSkills: { $push: "$requirements" },
                matchCount: { $sum: 1 }
            }
        },
        {
            $sort: { matchCount: -1, _id: 1 }
        },
        {
            $limit: 3
        }
    ]);
    console.log("Recommendation preview for Rohan:", recommendationPreview);

    printSection("Seed complete");
    console.log("Demo login emails:");
    console.log("- Recruiter:", aarav.email, "/", plainPassword);
    console.log("- Recruiter:", diya.email, "/", plainPassword);
    console.log("- Student:", rohan.email, "/", plainPassword);
    console.log("- Student:", sneha.email, "/", plainPassword);
    console.log("- Student:", kabir.email, "/", plainPassword);
};

seedDatabase()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
