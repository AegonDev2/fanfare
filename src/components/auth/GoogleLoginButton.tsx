import React from 'react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GoogleLoginButton: React.FC = () => {
  const signIn = async () => {
    try {
      const user = await GoogleAuth.signIn();
      console.log(user);
      // Handle user info here (e.g., send to backend, update UI, etc.)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={signIn} style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '4px', background: '#4285F4', color: '#fff', border: 'none', cursor: 'pointer' }}>
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton; 