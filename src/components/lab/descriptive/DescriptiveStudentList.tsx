import React from 'react';
import { DescriptiveStudent } from './types';
import DescriptiveOverviewCard from './DescriptiveOverviewCard';

interface Props {
  students: DescriptiveStudent[];
  onRemoveStudent: (id: string) => void;
  onViewDetails: (student: DescriptiveStudent) => void;
}

export default function DescriptiveStudentList({ students, onRemoveStudent, onViewDetails }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {students.map((student) => (
        <DescriptiveOverviewCard 
          key={student.id} 
          student={student} 
          onRemove={onRemoveStudent}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}