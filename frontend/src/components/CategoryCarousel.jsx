import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';
import { Code, Database, BarChart3, Palette, Layers } from 'lucide-react';

const categories = [
    { name: "Frontend Developer", icon: Code, color: "from-blue-500 to-cyan-500" },
    { name: "Backend Developer", icon: Database, color: "from-green-500 to-emerald-500" },
    { name: "Data Science", icon: BarChart3, color: "from-purple-500 to-pink-500" },
    { name: "Graphic Designer", icon: Palette, color: "from-orange-500 to-red-500" },
    { name: "FullStack Developer", icon: Layers, color: "from-indigo-500 to-purple-500" }
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='py-12 bg-gray-50/50'>
            <div className='max-w-7xl mx-auto px-4'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                        Explore by <span className='text-[#6A38C2]'>Category</span>
                    </h2>
                    <p className='text-gray-600'>Browse jobs by your area of expertise</p>
                </div>
                <Carousel className="w-full mx-auto">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {
                            categories.map((cat, index) => {
                                const IconComponent = cat.icon;
                                return (
                                    <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                        <div 
                                            onClick={() => searchJobHandler(cat.name)}
                                            className="group relative p-6 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <IconComponent className="h-7 w-7 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#6A38C2] transition-colors duration-300">
                                                {cat.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-2">Explore opportunities</p>
                                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6A38C2] to-[#5b30a6] flex items-center justify-center">
                                                    <span className="text-white text-sm">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                )
                            })
                        }
                    </CarouselContent>
                    <CarouselPrevious className="left-0 bg-white shadow-lg border border-gray-200 hover:bg-gray-50" />
                    <CarouselNext className="right-0 bg-white shadow-lg border border-gray-200 hover:bg-gray-50" />
                </Carousel>
            </div>
        </div>
    )
}

export default CategoryCarousel