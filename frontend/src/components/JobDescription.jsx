import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const [isApplied, setIsApplied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    // Check if user has applied for this job
    const checkAppliedStatus = () => {
        if (!singleJob || !user || !singleJob.applications) return false;
        return singleJob.applications.some(application => 
            application.applicant === user._id || application.applicant?._id === user._id
        );
    };

    // Sync isApplied state when singleJob or user changes
    useEffect(() => {
        setIsApplied(checkAppliedStatus());
    }, [singleJob, user]);

    const applyJobHandler = async () => {
        if (isApplied || isLoading) return;
        
        setIsLoading(true);
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});
            
            if(res.data.success){
                setIsApplied(true);
                // Update Redux state with new application
                const updatedApplications = singleJob?.applications || [];
                const newApplication = { applicant: user?._id };
                const updatedSingleJob = {
                    ...singleJob, 
                    applications: [...updatedApplications, newApplication]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to apply for job');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId, dispatch]);

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.postion} Positions</Badge>
                        <Badge className={'text-[#6A38C2] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#6A38C2] font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
                    </div>
                </div>
                <Button
                    onClick={applyJobHandler}
                    disabled={isApplied || isLoading}
                    className={`rounded-lg ${isApplied || isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#6A38C2] hover:bg-[#5b30a6]'}`}>
                    {isLoading ? 'Applying...' : isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt.split("T")[0]}</span></h1>
            </div>
        </div>
    )
}

export default JobDescription