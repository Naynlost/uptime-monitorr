import { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setIsLoading(true); 

    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-4">
      
      <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md shadow-lg border border-slate-700">
        
        <h2 className="text-slate-50 text-2xl font-semibold text-center mb-6">
          Giriş Yap
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-4 border border-red-500/30 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="flex flex-col mb-4">
            <label htmlFor="email" className="text-slate-300 text-sm mb-2">
              Email
            </label>
            <input 
              type="email" 
              id="email"
              placeholder="ornek@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-3 rounded-md border border-slate-600 bg-slate-900 text-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col mb-6">
            <label htmlFor="password" className="text-slate-300 text-sm mb-2">
              Şifre
            </label>
            <input 
              type="password" 
              id="password"
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-3 rounded-md border border-slate-600 bg-slate-900 text-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-slate-400 text-center mt-6 text-sm">
          Hesabın yok mu? <Link to="/register" className="text-blue-500 hover:underline">Kayıt Ol</Link>
        </p>
        
      </div>
    </div>
  );
};

export default Login;