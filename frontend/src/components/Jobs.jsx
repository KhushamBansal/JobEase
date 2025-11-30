import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';

const Jobs = () => {
    useGetAppliedJobs(); // Fetch applied jobs when Jobs component loads
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                // Check if it's a salary range filter
                if (searchedQuery.includes('k') || searchedQuery.includes('+')) {
                    // Parse salary range
                    if (searchedQuery === "0-50k") {
                        return job.salary >= 0 && job.salary < 50000;
                    } else if (searchedQuery === "50k-100k") {
                        return job.salary >= 50000 && job.salary < 100000;
                    } else if (searchedQuery === "100k-150k") {
                        return job.salary >= 100000 && job.salary < 150000;
                    } else if (searchedQuery === "150k+") {
                        return job.salary >= 150000;
                    }
                }

                // Regular text filtering for title, description, location, and jobType
                return job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    (job.jobType && job.jobType.toLowerCase().includes(searchedQuery.toLowerCase()));
            })
            setFilterJobs(filteredJobs)
        } else {
            setFilterJobs(allJobs)
        }
    }, [allJobs, searchedQuery]);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-20%'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? <span>Job not found</span> : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                                <div className='grid grid-cols-3 gap-4'>
                                    {
                                        filterJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>


        </div>
    )
}

export default Jobs