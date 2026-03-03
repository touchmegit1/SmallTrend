import { useState } from 'react';
import posService from '../../services/posService';
import { useAuth } from '../../context/AuthContext';

export default function DebugAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const testAPI = async () => {
    setLoading(true);
    try {
      const data = await posService.getAllProducts();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>🔧 Debug API Connection</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
        <strong>Auth Status:</strong><br/>
        Authenticated: {isAuthenticated ? '✅' : '❌'}<br/>
        User: {user ? JSON.stringify(user, null, 2) : 'null'}<br/>
        Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
      </div>

      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      <pre style={{ 
        marginTop: '20px', 
        padding: '10px', 
        background: '#f8f9fa', 
        border: '1px solid #ddd',
        borderRadius: '5px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {result || 'Click "Test API" to check connection'}
      </pre>
    </div>
  );
}