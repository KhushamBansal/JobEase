import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const dispatch = useDispatch();
    const { allJobs } = useSelector(store => store.job);

    // Dynamically generate filter data from actual jobs
    const getFilterData = () => {
        if (!allJobs || allJobs.length === 0) {
            return [];
        }

        // Extract unique locations
        const locations = [...new Set(allJobs.map(job => job.location))].filter(Boolean);

        // Extract unique job types (using jobType field)
        const jobTypes = [...new Set(allJobs.map(job => job.jobType))].filter(Boolean);

        // Extract unique job titles for industry filter
        const industries = [...new Set(allJobs.map(job => job.title))].filter(Boolean);

        // Generate salary ranges based on actual salaries
        const salaries = allJobs.map(job => job.salary).filter(Boolean);
        const salaryRanges = [];

        if (salaries.length > 0) {
            const minSalary = Math.min(...salaries);
            const maxSalary = Math.max(...salaries);

            // Create dynamic salary ranges
            if (minSalary < 50000) salaryRanges.push("0-50k");
            if (maxSalary >= 50000 && minSalary < 100000) salaryRanges.push("50k-100k");
            if (maxSalary >= 100000 && minSalary < 150000) salaryRanges.push("100k-150k");
            if (maxSalary >= 150000) salaryRanges.push("150k+");
        }

        const filterData = [];

        if (locations.length > 0) {
            filterData.push({
                filterType: "Location",
                array: locations.slice(0, 10) // Limit to 10 locations
            });
        }

        if (jobTypes.length > 0) {
            filterData.push({
                filterType: "Job Type",
                array: jobTypes
            });
        }

        if (industries.length > 0) {
            filterData.push({
                filterType: "Industry",
                array: industries.slice(0, 10) // Limit to 10 industries
            });
        }

        if (salaryRanges.length > 0) {
            filterData.push({
                filterType: "Salary",
                array: salaryRanges
            });
        }

        return filterData;
    };

    const filterData = getFilterData();

    const changeHandler = (value) => {
        setSelectedValue(value);
    }

    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
    }, [selectedValue, dispatch]);

    return (
        <div className='w-full bg-white p-3 rounded-md'>
            <h1 className='font-bold text-lg'>Filter Jobs</h1>
            <hr className='mt-3' />
            {filterData.length === 0 ? (
                <p className='text-sm text-gray-500 mt-3'>No filters available</p>
            ) : (
                <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                    {
                        filterData.map((data, index) => (
                            <div key={index}>
                                <h1 className='font-bold text-lg mt-3'>{data.filterType}</h1>
                                {
                                    data.array.map((item, idx) => {
                                        const itemId = `id${index}-${idx}`
                                        return (
                                            <div key={itemId} className='flex items-center space-x-2 my-2'>
                                                <RadioGroupItem value={item} id={itemId} />
                                                <Label htmlFor={itemId}>{item}</Label>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        ))
                    }
                </RadioGroup>
            )}
        </div>
    )
}

export default FilterCard