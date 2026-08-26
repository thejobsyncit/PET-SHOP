import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-6">
      <div className="w-20 h-20 bg-primary/5 rounded-full flex justify-center items-center mx-auto text-primary animate-pulse">
        <ShieldAlert size={40} />
      </div>
      
      <div className="space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">
          Looks like this paw wandered off.
        </h1>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
          The page or product category you are looking for has been relocated or does not exist. Browse our signature collections instead.
        </p>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button 
          onClick={() => navigate('/shop')} 
          className="btn-premium py-2.5 text-xs"
        >
          BACK TO SHOP
        </button>
        <button 
          onClick={() => navigate('/')} 
          className="btn-secondary-premium py-2.5 text-xs"
        >
          GO HOME
        </button>
      </div>
    </div>
  );
};

export default NotFound;
