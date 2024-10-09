import React, { useState, useEffect, useRef } from 'react';
import { Strain } from '../types';
import { Camera } from 'lucide-react';

interface StrainFormProps {
  strain?: Strain;
  onSubmit: (strain: Omit<Strain, 'id'>) => void;
  onCancel: () => void;
}

const StrainForm: React.FC<StrainFormProps> = ({ strain, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Strain, 'id'>>({
    name: '',
    batchDate: '',
    totalGrams: 0,
    remainingGrams: 0,
    bestByDate: '',
    images: [],
    videos: [],
    labResults: {
      thc: 0,
      cbd: 0,
      terpenes: {},
    },
  });

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (strain) {
      setFormData(strain);
    }
  }, [strain]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLabResultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      labResults: { ...prev.labResults, [name]: value ? parseFloat(value) : 0 },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bestByDate = new Date(formData.batchDate);
    bestByDate.setMonth(bestByDate.getMonth() + 6);
    const newStrain = {
      ...formData,
      bestByDate: bestByDate.toISOString().split('T')[0],
      remainingGrams: formData.totalGrams,
      totalGrams: parseFloat(formData.totalGrams.toString()) || 0,
      labResults: {
        thc: parseFloat(formData.labResults.thc.toString()) || 0,
        cbd: parseFloat(formData.labResults.cbd.toString()) || 0,
        terpenes: formData.labResults.terpenes,
      },
    };
    onSubmit(newStrain);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageDataUrl],
        }));
        setShowCamera(false);
        if (videoRef.current.srcObject instanceof MediaStream) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">Strain Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="batchDate" className="block mb-1">Batch Date</label>
        <input
          type="date"
          id="batchDate"
          name="batchDate"
          value={formData.batchDate}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="totalGrams" className="block mb-1">Total Grams</label>
        <input
          type="number"
          id="totalGrams"
          name="totalGrams"
          value={formData.totalGrams || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="thc" className="block mb-1">THC %</label>
        <input
          type="number"
          id="thc"
          name="thc"
          value={formData.labResults.thc || ''}
          onChange={handleLabResultsChange}
          step="0.1"
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="cbd" className="block mb-1">CBD %</label>
        <input
          type="number"
          id="cbd"
          name="cbd"
          value={formData.labResults.cbd || ''}
          onChange={handleLabResultsChange}
          step="0.1"
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Images</label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
          >
            <Camera size={20} className="mr-2" /> Use Camera
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
          >
            Upload Image
          </label>
        </div>
        {showCamera && (
          <div className="mt-2">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-md" />
            <button
              type="button"
              onClick={captureImage}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Capture
            </button>
          </div>
        )}
        <canvas ref={canvasRef} width="320" height="240" className="hidden" />
        <div className="mt-2 flex flex-wrap">
          {formData.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Strain image ${index + 1}`}
              className="w-24 h-24 object-cover m-1 rounded"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          {strain ? 'Update' : 'Add'} Strain
        </button>
      </div>
    </form>
  );
};

export default StrainForm;