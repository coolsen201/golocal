
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars manually since we are running with node
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
console.log('Loaded config:', envConfig);
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_KEY || envConfig.VITE_SUPABASE_ANON_KEY;
// const siteUrl = envConfig.VITE_SITE_URL || 'http://localhost:5173';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = `test_user_${Date.now()}@example.com`;
    const password = 'password123';
    const fullName = 'Test User';
    const role = 'seller';

    console.log(`Attempting to sign up user: ${email} with role: ${role}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
            // emailRedirectTo: `${siteUrl}/auth/callback` 
        },
    });

    if (error) {
        console.error('❌ SignUp Authentication Error:', error.message);
        console.error('Full Error:', error);
    } else {
        console.log('✅ SignUp Authentication Initialized.');
        console.log('User ID:', data.user?.id);
        console.log('Session:', data.session ? 'Created (Auto-confirm OFF)' : 'Null (Auto-confirm ON)');

        // Check profile creation if session exists
        if (data.user?.id) {
            console.log('Checking profile creation...');
            // Wait a bit for trigger
            await new Promise(resolve => setTimeout(resolve, 2000));

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('❌ Profile Fetch Error:', profileError.message);
            } else {
                console.log('✅ Profile Found:', profile);
                if (profile.role === role) {
                    console.log('✅ Role matches metadata!');
                } else {
                    console.error(`⚠️ Role Mismatch! Expected ${role}, got ${profile.role}`);
                }
            }
        }
    }
}

testSignup();
