import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file;
        let cloudResponse = null;
        
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {}
        };
        
        if (cloudResponse) {
            userData.profile.profilePhoto = cloudResponse.secure_url;
        }
        
        await User.create(userData);

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
            savedJobs: user.savedJobs || []
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills, skillsToRemove } = req.body;
        
        const file = req.file;
        let cloudResponse = null;
        
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }
        const userId = req.id; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        const sanitizeArrayValues = (value) => {
            if (!value) return [];
            const values = Array.isArray(value) ? value : value.split(",");
            return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
        };

        const skillsToAdd = sanitizeArrayValues(skills);
        const removeSkills = sanitizeArrayValues(skillsToRemove);

        const baseSetOperations = {};

        if (fullname) baseSetOperations.fullname = fullname;
        if (email) baseSetOperations.email = email;
        if (phoneNumber) baseSetOperations.phoneNumber = phoneNumber;
        if (bio !== undefined) baseSetOperations["profile.bio"] = bio;

        if(cloudResponse && file){
            baseSetOperations["profile.resume"] = cloudResponse.secure_url;
            baseSetOperations["profile.resumeOriginalName"] = file.originalname;
        }

        const baseUpdate = {
            $currentDate: {
                "profile.lastUpdated": true
            }
        };

        if (Object.keys(baseSetOperations).length > 0) {
            baseUpdate.$set = baseSetOperations;
        }

        await User.findByIdAndUpdate(userId, baseUpdate, {
            runValidators: true
        });

        if (removeSkills.length > 0) {
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    "profile.skills": { $in: removeSkills }
                },
                $currentDate: {
                    "profile.lastUpdated": true
                }
            }, { runValidators: true });
        }

        if (skillsToAdd.length > 0) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    "profile.skills": { $each: skillsToAdd }
                },
                $currentDate: {
                    "profile.lastUpdated": true
                }
            }, { runValidators: true });
        }

        const updatedUser = await User.findById(userId);

        const userResponse = {
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
            profile: updatedUser.profile,
            savedJobs: updatedUser.savedJobs || []
        };

        return res.status(200).json({
            message:"Profile updated successfully.",
            user: userResponse,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
export const toggleSaveJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        const user = await User.findById(userId).select("savedJobs");
        if (!user) {
            return res.status(400).json({
                message: 'User not found.',
                success: false
            })
        }

        const isJobSaved = user.savedJobs.some((id) => id.toString() === jobId);
        if (isJobSaved) {
            await User.findByIdAndUpdate(userId, {
                $pull: { savedJobs: jobId },
                $currentDate: { "profile.lastUpdated": true }
            });
            return res.status(200).json({
                message: 'Job removed from saved list.',
                success: true,
                isSaved: false
            })
        } else {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { savedJobs: jobId },
                $currentDate: { "profile.lastUpdated": true }
            });
            return res.status(200).json({
                message: 'Job saved successfully.',
                success: true,
                isSaved: true
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error.',
            success: false
        })
    }
}

export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: {
                path: 'company',
                select: 'name logo'
            }
        });

        if (!user) {
            return res.status(400).json({
                message: 'User not found.',
                success: false
            })
        }

        return res.status(200).json({
            savedJobs: user.savedJobs || [],
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error.',
            success: false
        })
    }
}
