import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SignUp, SignIn } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const role = searchParams.get('role');
  const isSignIn = window.location.pathname === '/signin';
  
  console.log('AUTH COMPONENT RENDERED');
  console.log('Role from URL:', role);
  console.log('Is SignIn:', isSignIn);
  console.log('Current URL:', window.location.href);
  console.log('User loaded:', isLoaded, 'Signed in:', isSignedIn);

  // Handle post-signup role assignment and redirect
  useEffect(() => {
  console.log('=== AUTH DEBUG ===');
  console.log('Auth useEffect:', { isLoaded, isSignedIn, user: !!user, role });

  if (isLoaded && isSignedIn && user) {
    const userRole = user.publicMetadata?.role;
    console.log('Current user role:', userRole);
    console.log('User metadata:', user.publicMetadata);

    // Prepare user data for MongoDB
    const userData = {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName:user.lastName,
      role: userRole || role, // Use existing role or role from signup URL
    };

    // Send user info to backend to store/update in MongoDB
    fetch('http://localhost:3000/api/clerk/create-or-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('User stored in MongoDB:', data.user);
        } else {
          console.error('Failed to store user in MongoDB:', data.message);
        }
      })
      .catch(err => console.error('MongoDB save error:', err));

    // If user has no role and role is provided in URL, set it in Clerk
    if (!userRole && role) {
      console.log('=== SETTING ROLE IN CLERK ===', role);

      fetch('http://localhost:3000/api/user/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: role
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('=== ROLE SET SUCCESS ===');
            user.reload().then(() => {
              if (role === 'donor') {
                navigate('/home', { replace: true });
              } else if (role === 'ngo') {
                navigate('/campaign-application', { replace: true });
              }
            });
          } else {
            console.error('Failed to set role in Clerk:', data.message);
          }
        })
        .catch(error => {
          console.error('Error setting role in Clerk:', error);
        });
    }
    // If user already has a role, redirect accordingly
    else if (userRole) {
      console.log('=== USER HAS ROLE ===');
      if (userRole === 'donor') {
        navigate('/home', { replace: true });
      } else if (userRole === 'ngo') {
        navigate('/campaign-application', { replace: true });
      }
    }
  }
}, [isLoaded, isSignedIn, user, role, navigate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignIn ? 'Welcome Back' : 'Welcome to AidVerify'}
          </h1>
          {role && !isSignIn && (
            <p className="text-gray-600">
              Join as a {role === 'donor' ? 'Donor' : 'NGO'}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {isSignIn ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full"
                }
              }}
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full"
                }
              }}
            />
          )}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => navigate(isSignIn ? '/' : '/signin')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}