import React from 'react';
import { DescriptiveStudent } from './types';
import DescriptiveResultCard from './DescriptiveResultCard';

interface Props {
  students: DescriptiveStudent[];
  onRemoveStudent: (id: string) => void;
}

export default function DescriptiveStudentList({ students, onRemoveStudent }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {students.map((student, idx) => (
        <DescriptiveResultCard 
          key={student.id} 
          student={student} 
          index={idx} 
          onRemove={onRemoveStudent}
        />
      ))}
    </div>
  );
}