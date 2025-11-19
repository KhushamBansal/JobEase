import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search, Briefcase, TrendingUp, Users } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate, Link } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchJobHandler();
        }
    }

    return (
        <div className='relative overflow-hidden'>
            {/* Background gradient */}
            <div className='absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 -z-10'></div>
            <div className='absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
            <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000'></div>
            
            <div className='text-center relative z-10'>
                <div className='flex flex-col gap-6 py-16 px-4 max-w-5xl mx-auto'>
                    <span className='mx-auto px-5 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-[#6A38C2] font-semibold text-sm shadow-sm border border-purple-200/50'>
                        ✨ No. 1 JobEase Platform
                    </span>
                    <h1 className='text-6xl md:text-7xl font-extrabold leading-tight'>
                        Search, Apply & <br /> 
                        Get Your <span className='bg-gradient-to-r from-[#6A38C2] to-[#9333EA] bg-clip-text text-transparent'>Dream Jobs</span>
                    </h1>
                    <p className='text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
                        Discover thousands of opportunities from top companies. Find your perfect match and take the next step in your career journey.
                    </p>
                    
                    {/* Login/Signup CTA for non-logged in users */}
                    {!user && (
                        <div className='flex items-center justify-center gap-4 mb-4'>
                            <Link to="/signup">
                                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" className="border-2 border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white font-semibold px-8 py-6 text-lg transition-all duration-300">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    )}
                    
                    {/* Search Bar */}
                    <div className='flex w-full max-w-2xl shadow-2xl border-2 border-gray-200 pl-6 pr-2 rounded-full items-center gap-4 mx-auto bg-white hover:border-purple-300 transition-all duration-300'>
                        <Search className='h-5 w-5 text-gray-400' />
                        <input
                            type="text"
                            placeholder='Search for jobs, companies, or skills...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='outline-none border-none w-full py-4 text-gray-700 placeholder-gray-400'
                        />
                        <Button 
                            onClick={searchJobHandler} 
                            className="rounded-full bg-gradient-to-r from-[#6A38C2] to-[#5b30a6] hover:from-[#5b30a6] hover:to-[#4a2580] px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Search className='h-5 w-5 mr-2' />
                            Search
                        </Button>
                    </div>

                    {/* Stats Section */}
                    <div className='flex flex-wrap justify-center gap-8 mt-12'>
                        <div className='flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-gray-100'>
                            <div className='p-3 bg-purple-100 rounded-lg'>
                                <Briefcase className='h-6 w-6 text-[#6A38C2]' />
                            </div>
                            <div className='text-left'>
                                <p className='text-2xl font-bold text-gray-900'>10K+</p>
                                <p className='text-sm text-gray-600'>Active Jobs</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-gray-100'>
                            <div className='p-3 bg-blue-100 rounded-lg'>
                                <Users className='h-6 w-6 text-blue-600' />
                            </div>
                            <div className='text-left'>
                                <p className='text-2xl font-bold text-gray-900'>5K+</p>
                                <p className='text-sm text-gray-600'>Companies</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md border border-gray-100'>
                            <div className='p-3 bg-green-100 rounded-lg'>
                                <TrendingUp className='h-6 w-6 text-green-600' />
                            </div>
                            <div className='text-left'>
                                <p className='text-2xl font-bold text-gray-900'>50K+</p>
                                <p className='text-sm text-gray-600'>Job Seekers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection