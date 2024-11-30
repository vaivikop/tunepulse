'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // For getting the token from the URL
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Use this to read query params (token)
  const token = searchParams.get('token'); // Get token from the URL
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    if (token) {
      const verifyAccount = async () => {
        try {
          setLoading(true);

          // Send token to the backend to verify the user
          const response = await fetch('/api/verifyAccount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }), // Send token to backend
          });

          const data = await response.json();

          if (data?.success) {
            setVerificationStatus('Verified');
            toast.success('Your account has been successfully verified!');
            // Optionally, you can redirect the user to another page
            setTimeout(() => {
              router.push('/settings'); // Redirect to account page after successful verification
            }, 2000);
          } else {
            setVerificationStatus('Token Expired or Invalid');
            toast.error(data?.message || 'Verification failed!');
          }
        } catch (error) {
          console.error('Error during email verification:', error);
          setVerificationStatus('Error occurred');
          toast.error('Error occurred during verification.');
        } finally {
          setLoading(false);
        }
      };

      verifyAccount(); // Call verification function
    } else {
      setVerificationStatus('No token found');
      setLoading(false);
    }
  }, [token, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-32 h-32 border-4 border-t-transparent border-cyan-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8 rounded-lg shadow-xl max-w-md mx-auto mt-20">
      <h2 className="text-3xl font-bold text-center mb-6">Email Verification Status</h2>
      <div className="text-center">
        <p className={`text-xl font-semibold ${verificationStatus === 'Verified' ? 'text-green-500' : 'text-red-500'}`}>
          {verificationStatus}
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => router.push('/login')}
          className="bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-6 rounded-lg shadow-md transition duration-300"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
