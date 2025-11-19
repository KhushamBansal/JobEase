import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// const randomJobs = [1, 2, 3, 4, 5, 6, 7, 8];

const LatestJobs = () => {
    const {allJobs} = useSelector(store=>store.job);
    const navigate = useNavigate();
   
    return (
        <div className='max-w-7xl mx-auto py-16 px-4'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-4xl md:text-5xl font-bold mb-2'>
                        <span className='text-[#6A38C2]'>Latest & Top </span> 
                        <span className='text-gray-900'>Job Openings</span>
                    </h1>
                    <p className='text-gray-600 text-lg'>Discover the most recent opportunities from top companies</p>
                </div>
                <Button 
                    onClick={() => navigate('/browse')}
                    variant="outline" 
                    className="hidden md:flex items-center gap-2 border-2 border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white transition-all duration-300"
                >
                    View All
                    <ArrowRight className='h-4 w-4' />
                </Button>
            </div>
            {allJobs.length <= 0 ? (
                <div className='text-center py-16'>
                    <div className='inline-block p-6 bg-gray-100 rounded-full mb-4'>
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>No Jobs Available</h3>
                    <p className='text-gray-600'>Check back later for new opportunities</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {allJobs?.slice(0,6).map((job) => (
                        <LatestJobCards key={job._id} job={job}/>
                    ))}
                </div>
            )}
            <div className='text-center mt-8 md:hidden'>
                <Button 
                    onClick={() => navigate('/browse')}
                    variant="outline" 
                    className="items-center gap-2 border-2 border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white transition-all duration-300"
                >
                    View All Jobs
                    <ArrowRight className='h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}

export default LatestJobs