import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'

const SavedJobsTable = () => {
    const {savedJobs} = useSelector(store=>store.job);
    const navigate = useNavigate();
    
    return (
        <div>
            <Table>
                <TableCaption>A list of your saved jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Job Type</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        !savedJobs || savedJobs.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    You haven't saved any jobs yet.
                                </TableCell>
                            </TableRow>
                        ) : savedJobs.map((job) => (
                            <TableRow key={job._id}>
                                <TableCell className="font-medium">{job?.title}</TableCell>
                                <TableCell>{job?.company?.name || 'N/A'}</TableCell>
                                <TableCell>{job?.location || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[#6A38C2]">
                                        ₹{job?.salary} LPA
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{job?.jobType || 'N/A'}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        onClick={() => navigate(`/description/${job._id}`)}
                                        variant="outline"
                                        size="sm"
                                        className="border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default SavedJobsTable

