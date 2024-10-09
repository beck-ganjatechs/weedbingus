import React from 'react';
import StrainCard from './StrainCard';
import { Strain } from '../types';

interface StrainListProps {
  strains: Strain[];
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
}

const StrainList: React.FC<StrainListProps> = ({ strains, onEdit, onShare }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {strains.map((strain) => (
        <StrainCard
          key={strain.id}
          strain={strain}
          onEdit={onEdit}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default StrainList;