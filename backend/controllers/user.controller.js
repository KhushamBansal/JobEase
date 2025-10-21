import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
        if(!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        const user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ fullname, email, phoneNumber, password: hashedPassword, role });
        
        return res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if(!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        let user = await User.findOne({ email, role });
        if(!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found',
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password',
            });
        };
        if(user.role !== role) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }
        const tokenData={
            userId: user._id
        }
        const token=await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        user={
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 }).json({
            success: true,
            message: 'Login successful',
            user
        });
    } catch (error) { 
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
export const logout = async (req, res) => {
    try {
        res.status(200).cookie('token', '', { httpOnly: true, sameSite: 'strict', maxAge: 0 }).json({
            success: true,
            message: 'Logout successful'
        });
        } catch (error) {
            console.log(error);
        }
    }
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills}= req.body;
        const file= req.file;



        if(skills){
            skillsArray = skills.split(',');
        }

        const userId = req.id;
        let user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        if(fullname) user.fullname = fullname;
        if(email) user.email = email;
        if(phoneNumber) user.phoneNumber = phoneNumber;
        if(bio) user.profile.bio = bio;
        if(skills) user.profile.skills = skillsArray;
        

        await user.save();

        user={
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        })

    } catch (error) {
        console.log(error);
    }
}