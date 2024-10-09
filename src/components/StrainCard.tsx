import React from 'react';
import { Strain } from '../types';
import { Edit, Share2 } from 'lucide-react';

interface StrainCardProps {
  strain: Strain;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
}

const StrainCard: React.FC<StrainCardProps> = ({ strain, onEdit, onShare }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img src={strain.images[0]} alt={strain.name} className="w-full h-48 object-cover" />
        <div className="absolute top-0 right-0 p-2 flex space-x-2">
          <button onClick={() => onEdit(strain.id)} className="p-1 bg-blue-500 text-white rounded-full">
            <Edit size={16} />
          </button>
          <button onClick={() => onShare(strain.id)} className="p-1 bg-green-500 text-white rounded-full">
            <Share2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{strain.name}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-semibold">Batch Date:</p>
            <p>{strain.batchDate}</p>
          </div>
          <div>
            <p className="font-semibold">Best By:</p>
            <p>{strain.bestByDate}</p>
          </div>
          <div>
            <p className="font-semibold">Remaining:</p>
            <p>{strain.remainingGrams}g / {strain.totalGrams}g</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Lab Results:</h3>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="font-bold text-lg">{strain.labResults.thc}%</p>
              <p className="text-xs">THC</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{strain.labResults.cbd}%</p>
              <p className="text-xs">CBD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrainCard;