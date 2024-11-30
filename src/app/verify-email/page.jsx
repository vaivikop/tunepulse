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
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl text-cyan-400 font-semibold mb-6 text-center">Email Verification Status</h2>
      <div className="text-center">
        <p className={`text-${verificationStatus === 'Verified' ? 'green' : 'red'}-500`}>
          {verificationStatus}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
