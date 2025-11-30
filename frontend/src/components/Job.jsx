import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { APPLICATION_API_END_POINT, USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '@/redux/authSlice'
import { setAllAppliedJobs, setSavedJobs } from '@/redux/jobSlice'

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const { allAppliedJobs } = useSelector(store => store.job);
    
    const [isApplied, setIsApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Check if user has applied for this job
    useEffect(() => {
        if (!user) {
            setIsApplied(false);
            return;
        }
        // Check if allAppliedJobs is an array and has items
        if (!Array.isArray(allAppliedJobs) || allAppliedJobs.length === 0) {
            setIsApplied(false);
            return;
        }
        const hasApplied = allAppliedJobs.some(
            appliedJob => {
                const appliedJobId = appliedJob.job?._id || appliedJob.job;
                return appliedJobId === job?._id || appliedJobId?.toString() === job?._id?.toString();
            }
        );
        setIsApplied(hasApplied);
    }, [allAppliedJobs, job?._id, user]);

    // Check if job is saved (from user's savedJobs if available)
    useEffect(() => {
        if (!user || !user.savedJobs) {
            setIsSaved(false);
            return;
        }
        const hasSaved = user.savedJobs.some(
            savedJobId => savedJobId === job?._id || savedJobId?._id === job?._id
        );
        setIsSaved(hasSaved);
    }, [user, job?._id]);

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    const applyJobHandler = async () => {
        if (isApplied || isApplying) return;
        
        setIsApplying(true);
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${job?._id}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsApplied(true);
                // Refresh applied jobs list to keep Redux in sync
                try {
                    const appliedRes = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
                        withCredentials: true
                    });
                    if (appliedRes.data.success) {
                        dispatch(setAllAppliedJobs(appliedRes.data.application));
                    }
                } catch (err) {
                    console.log('Failed to refresh applied jobs:', err);
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to apply for job');
        } finally {
            setIsApplying(false);
        }
    }

    const saveJobHandler = async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        try {
            const res = await axios.post(`${USER_API_END_POINT}/save/${job?._id}`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsSaved(res.data.isSaved);
                // Update user's savedJobs in Redux
                if (user) {
                    const updatedSavedJobs = res.data.isSaved
                        ? [...(user.savedJobs || []), job?._id]
                        : (user.savedJobs || []).filter(id => id !== job?._id && id?._id !== job?._id);
                    dispatch(setUser({ ...user, savedJobs: updatedSavedJobs }));
                }
                // Refresh saved jobs list to keep Redux in sync
                try {
                    const savedRes = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
                        withCredentials: true
                    });
                    if (savedRes.data.success) {
                        dispatch(setSavedJobs(savedRes.data.savedJobs));
                    }
                } catch (err) {
                    console.log('Failed to refresh saved jobs:', err);
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to save job');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <Button 
                    variant="outline" 
                    className={`rounded-full ${isSaved ? 'bg-[#6A38C2] text-white border-[#6A38C2]' : ''}`} 
                    size="icon" 
                    onClick={saveJobHandler}
                    disabled={isSaving}
                >
                    {isSaved ? <BookmarkCheck /> : <Bookmark />}
                </Button>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#6A38C2] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#6A38C2] font-bold'} variant="ghost">{job?.salary}LPA</Badge>
            </div>
            <div className='flex items-center gap-4 mt-4'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white">Details</Button>
                <Button 
                    className={`${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#6A38C2] hover:bg-[#5b30a6]'}`}
                    onClick={applyJobHandler}
                    disabled={isApplied || isApplying}
                >
                    {isApplying ? 'Applying...' : isApplied ? 'Already Applied' : 'Apply'}
                </Button>
            </div>
        </div>
    )
}

export default Job