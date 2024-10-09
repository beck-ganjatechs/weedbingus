import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import AuthPage from './components/AuthPage';
import StrainList from './components/StrainList';
import StrainForm from './components/StrainForm';
import { Strain } from './types';

const pb = new PocketBase('http://127.0.0.1:8090'); // Replace with your PocketBase URL

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStrain, setEditingStrain] = useState<Strain | null>(null);

  useEffect(() => {
    const loadStrains = async () => {
      if (isAuthenticated) {
        try {
          const records = await pb.collection('strains').getFullList<Strain>();
          setStrains(records);
        } catch (error) {
          console.error('Error loading strains:', error);
        }
      }
    };

    loadStrains();
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password });
      await pb.collection('users').authWithPassword(email, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
  };

  const handleAddStrain = async (newStrain: Omit<Strain, 'id'>) => {
    try {
      const record = await pb.collection('strains').create(newStrain);
      setStrains([...strains, record]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding strain:', error);
    }
  };

  const handleUpdateStrain = async (updatedStrain: Strain) => {
    try {
      const record = await pb.collection('strains').update(updatedStrain.id, updatedStrain);
      setStrains(strains.map((strain) => (strain.id === record.id ? record : strain)));
      setEditingStrain(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating strain:', error);
    }
  };

  const handleEdit = (id: string) => {
    const strainToEdit = strains.find((strain) => strain.id === id);
    if (strainToEdit) {
      setEditingStrain(strainToEdit);
      setShowForm(true);
    }
  };

  const handleShare = (id: string) => {
    const strain = strains.find((s) => s.id === id);
    if (strain) {
      const shareText = `Check out ${strain.name} from our menu!`;
      const shareUrl = `${window.location.origin}?strain=${id}`;
      if (navigator.share) {
        navigator.share({
          title: strain.name,
          text: shareText,
          url: shareUrl,
        }).catch((error) => console.log('Error sharing', error));
      } else {
        prompt('Copy this link to share:', `${shareText} ${shareUrl}`);
      }
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/auth" element={
            isAuthenticated ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
          } />
          <Route path="/" element={
            isAuthenticated ? (
              <div className="p-4">
                <header className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Cannabis Strain Menu</h1>
                  <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                </header>
                <main className="bg-white rounded-b-lg shadow-md p-4">
                  <StrainList
                    strains={strains}
                    onEdit={handleEdit}
                    onShare={handleShare}
                  />
                  {showForm && (
                    <StrainForm
                      strain={editingStrain || undefined}
                      onSubmit={editingStrain ? handleUpdateStrain : handleAddStrain}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingStrain(null);
                      }}
                    />
                  )}
                  <button
                    onClick={() => setShowForm(true)}
                    className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg"
                  >
                    +
                  </button>
                </main>
              </div>
            ) : (
              <Navigate to="/auth" />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;