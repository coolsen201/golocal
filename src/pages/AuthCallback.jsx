import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying email...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the current session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !sessionData?.session) {
                    console.error('Session error:', sessionError);
                    navigate('/login');
                    return;
                }

                // Fetch the user's profile to ensure it's loaded before redirect
                setStatus('Loading your profile...');
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', sessionData.session.user.id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                }

                // Check if we need to update the role from user metadata
                // This handles cases where the trigger created profile with wrong role
                const metadataRole = sessionData.session.user.user_metadata?.role;
                if (profile && metadataRole && profile.role !== metadataRole) {
                    console.log(`Updating role from ${profile.role} to ${metadataRole}`);
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ role: metadataRole })
                        .eq('id', sessionData.session.user.id);

                    if (updateError) {
                        console.error('Role update error:', updateError);
                    } else {
                        console.log('Role updated successfully to:', metadataRole);
                    }
                }

                // Small delay to ensure AuthContext picks up the session change
                await new Promise(resolve => setTimeout(resolve, 500));

                // Navigate to dashboard - profile should be available now
                navigate('/dashboard');
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ background: '#1E3A8A' }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-white font-medium">{status}</p>
            </div>
        </div>
    );
};

export default AuthCallback;
