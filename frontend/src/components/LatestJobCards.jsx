import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, Clock, TrendingUp } from 'lucide-react'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    
    // Truncate description if too long
    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    return (
        <div 
            onClick={() => navigate(`/description/${job._id}`)} 
            className='group p-6 rounded-2xl shadow-md bg-white border border-gray-200 cursor-pointer hover:shadow-2xl hover:border-[#6A38C2]/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden'
        >
            {/* Gradient overlay on hover */}
            <div className='absolute inset-0 bg-gradient-to-br from-purple-50/0 to-blue-50/0 group-hover:from-purple-50/50 group-hover:to-blue-50/50 transition-all duration-300 pointer-events-none'></div>
            
            <div className='relative z-10'>
                {/* Company Info */}
                <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#6A38C2] to-[#5b30a6] flex items-center justify-center text-white font-bold text-sm'>
                                {job?.company?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h1 className='font-semibold text-lg text-gray-900 group-hover:text-[#6A38C2] transition-colors duration-300'>
                                    {job?.company?.name || 'Company Name'}
                                </h1>
                                <div className='flex items-center gap-1 text-sm text-gray-500'>
                                    <MapPin className='h-3 w-3' />
                                    <span>India</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <TrendingUp className='h-5 w-5 text-[#6A38C2]' />
                    </div>
                </div>

                {/* Job Title */}
                <div className='mb-3'>
                    <h2 className='font-bold text-xl text-gray-900 mb-2 group-hover:text-[#6A38C2] transition-colors duration-300'>
                        {job?.title || 'Job Title'}
                    </h2>
                    <p className='text-sm text-gray-600 leading-relaxed line-clamp-2'>
                        {truncateDescription(job?.description)}
                    </p>
                </div>

                {/* Badges */}
                <div className='flex flex-wrap items-center gap-2 mt-4'>
                    {job?.position && (
                        <Badge 
                            className='bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 font-semibold px-3 py-1' 
                            variant="outline"
                        >
                            <Briefcase className='h-3 w-3 mr-1' />
                            {job.position} {Number(job.position) > 1 ? 'Positions' : 'Position'}
                        </Badge>
                    )}
                    {job?.jobType && (
                        <Badge 
                            className='bg-purple-50 text-[#6A38C2] hover:bg-purple-100 border-purple-200 font-semibold px-3 py-1' 
                            variant="outline"
                        >
                            <Clock className='h-3 w-3 mr-1' />
                            {job.jobType}
                        </Badge>
                    )}
                    {job?.salary && (
                        <Badge 
                            className='bg-purple-50 text-[#6A38C2] hover:bg-purple-100 border-purple-200 font-semibold px-3 py-1' 
                            variant="outline"
                        >
                            ₹{job.salary} LPA
                        </Badge>
                    )}
                </div>

                {/* View Details CTA */}
                <div className='mt-4 pt-4 border-t border-gray-200'>
                    <span className='text-sm font-medium text-[#6A38C2] group-hover:underline'>
                        View Details →
                    </span>
                </div>
            </div>
        </div>
    )
}

export default LatestJobCards