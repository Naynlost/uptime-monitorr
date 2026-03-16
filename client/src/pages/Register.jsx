import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const { email, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Şifreler birbiriyle uyuşmuyor.');
    }

    if (password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır.');
    }

    setIsLoading(true);

    try {
      await API.post('/auth/register', { email, password }); [cite,7]

      alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-4">
      <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md shadow-lg border border-slate-700">
        
        <h2 className="text-slate-50 text-2xl font-semibold text-center mb-6">
          Yeni Hesap Oluştur
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-4 border border-red-500/30 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col mb-4">
            <label className="text-slate-300 text-sm mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="ornek@email.com" 
              value={email} 
              onChange={onChange} 
              required 
              className="w-full p-3 rounded-md border border-slate-600 bg-slate-900 text-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-slate-300 text-sm mb-2">Şifre</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={password} 
              onChange={onChange} 
              required 
              className="w-full p-3 rounded-md border border-slate-600 bg-slate-900 text-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col mb-6">
            <label className="text-slate-300 text-sm mb-2">Şifre Tekrar</label>
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={onChange} 
              required 
              className="w-full p-3 rounded-md border border-slate-600 bg-slate-900 text-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-slate-400 text-center mt-6 text-sm">
          Zaten hesabın var mı? <Link to="/login" className="text-blue-500 hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;