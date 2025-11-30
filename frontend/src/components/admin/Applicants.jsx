import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const Applicants = () => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {applicants} = useSelector(store=>store.application);
    const {allAdminJobs} = useSelector(store=>store.job);
    const [selectedJobId, setSelectedJobId] = useState(params.id || '');
    
    useGetAllAdminJobs();

    useEffect(() => {
        if (selectedJobId) {
            const fetchAllApplicants = async () => {
                try {
                    const res = await axios.get(`${APPLICATION_API_END_POINT}/${selectedJobId}/applicants`, { withCredentials: true });
                    dispatch(setAllApplicants(res.data.job));
                } catch (error) {
                    console.log(error);
                }
            }
            fetchAllApplicants();
        }
    }, [selectedJobId, dispatch]);

    useEffect(() => {
        if (params.id) {
            setSelectedJobId(params.id);
        }
    }, [params.id]);

    const handleJobChange = (jobId) => {
        setSelectedJobId(jobId);
        navigate(`/admin/jobs/${jobId}/applicants`);
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto'>
                <div className='flex items-center justify-between my-5'>
                    <h1 className='font-bold text-xl'>Applicants {applicants?.applications?.length || 0}</h1>
                    <div className='w-64'>
                        <Select value={selectedJobId} onValueChange={handleJobChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a job title" />
                            </SelectTrigger>
                            <SelectContent>
                                {allAdminJobs && allAdminJobs.length > 0 ? (
                                    allAdminJobs.map((job) => (
                                        <SelectItem key={job._id} value={job._id}>
                                            {job.title}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-jobs" disabled>No jobs available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <ApplicantsTable />
            </div>
        </div>
    )
}

export default Applicants