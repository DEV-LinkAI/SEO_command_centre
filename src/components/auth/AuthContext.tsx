'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authApi, UserProfile } from '@/lib/api';
import { authConfig } from '@/lib/auth-config';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Hard-disable auth flow for deployment stability
  useEffect(() => {
    // Minimal, safe default profile; no secrets stored
    const demo: UserProfile = {
      id: 'local-user',
      email: 'user@local',
      name: 'Gebruiker',
      company_id: 'demo-company',
      role: 'user',
    }
    authApi.setUserProfile(demo)
    setUser(null)
    setSession(null)
    setUserProfile(demo)
    setLoading(false)
  }, [])

  // NOTE: Original Supabase auth code kept below for future re-enable

  /**
   * Haal bedrijfsnaam op uit companies tabel
   */
  const fetchCompanyName = useCallback(async (companyId: string) => {
    try {
      console.log('Fetching company name for companyId:', companyId);
      
      const { data: company, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Error fetching company name:', error);
        return null;
      }

      console.log('Company name found:', company?.name);
      return company?.name || null;
    } catch (error) {
      console.error('Error in fetchCompanyName:', error);
      return null;
    }
  }, []);

  /**
   * Haal gebruikersprofiel en company_id op
   */
  const fetchUserProfileAndCompany = useCallback(async (userId: string, currentSession: Session) => {
    try {
      console.log('Fetching user profile for userId:', userId);
      
      // Probeer eerst de profiles tabel met de correcte kolomnamen
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)  // user_id in plaats van id
        .single();

      if (error) {
        console.error('Error fetching user profile from profiles table:', error);
        
        // Als de profiles tabel niet werkt, probeer de auth.users tabel direct
        console.log('Trying to get user info from auth metadata...');
        
        // Gebruik de session user data als fallback
        const fallbackProfile: UserProfile = {
          id: currentSession.user.id,
          email: currentSession.user.email || 'unknown@example.com',
          name: currentSession.user.user_metadata?.name || currentSession.user.user_metadata?.full_name || currentSession.user.email || 'Gebruiker',
          company_id: currentSession.user.user_metadata?.company_id || 'unknown',
          role: currentSession.user.user_metadata?.role || 'user'
        };
        
        console.log('Using fallback profile from session:', fallbackProfile);
        
        // Sla fallback profile op
        authApi.setUserProfile(fallbackProfile);
        setUserProfile(fallbackProfile);

        // Sla company_id op als het bestaat
        if (fallbackProfile.company_id) {
          authApi.setAuthData({ companyId: fallbackProfile.company_id });
        }

        console.log(`${authConfig.productName}: Using fallback profile for ${fallbackProfile.email}`);
        return;
      }

      if (profile) {
        // Haal company naam op als we een company_id hebben
        let companyName = profile.company_name;
        if (profile.company_id && !companyName) {
          companyName = await fetchCompanyName(profile.company_id);
        }

        // Map database kolommen naar ons UserProfile interface
        const mappedProfile: UserProfile = {
          id: profile.user_id || currentSession.user.id,
          email: profile.email || currentSession.user.email || 'unknown@example.com',
          name: profile.full_name || profile.email || 'Gebruiker',
          company_id: profile.company_id || 'unknown',
          role: profile.profile_role || 'user',
          // Extra velden kunnen we ook opslaan
          company_name: companyName || profile.company_name,
          phone_number: profile.phone_number,
          profile_role_name: profile.profile_role_name
        };

        console.log('Mapped profile from database:', mappedProfile);

        // Sla user profile op
        authApi.setUserProfile(mappedProfile);
        setUserProfile(mappedProfile);

        // Sla company_id op in sessionStorage (belangrijk!)
        if (mappedProfile.company_id) {
          authApi.setAuthData({ companyId: mappedProfile.company_id });
          console.log('Company ID saved to session:', mappedProfile.company_id);
        }

        console.log(`${authConfig.productName}: User profile loaded for ${mappedProfile.email} (Company: ${mappedProfile.company_name || mappedProfile.company_id})`);
      }
    } catch (error) {
      console.error('Error in fetchUserProfileAndCompany:', error);
      
      // Als alles faalt, gebruik basis info uit de sessie
      const basicProfile: UserProfile = {
        id: currentSession.user.id,
        email: currentSession.user.email || 'unknown@example.com',
        name: currentSession.user.email || 'Gebruiker',
        company_id: 'unknown',
        role: 'user'
      };
      
      console.log('Using basic profile as final fallback:', basicProfile);
      authApi.setUserProfile(basicProfile);
      setUserProfile(basicProfile);
    }
  }, [fetchCompanyName]);

  /**
   * Refresh user profile
   */
  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchUserProfileAndCompany(session.user.id, session);
    }
  };

  /**
   * Sign out functie
   */
  const signOut = async () => {
    try {
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear local storage
      authApi.clearAuthData();
      
      // Reset state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      console.log(`${authConfig.productName}: User signed out`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Haal initiële sessie op
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Sla auth data op
        authApi.setAuthData({
          userId: session.user.id,
          authToken: session.access_token,
        });
        
        // Haal user profile op
        fetchUserProfileAndCompany(session.user.id, session);
      } else {
        // Check of we al een profile hebben in storage
        const storedProfile = authApi.getUserProfile();
        if (storedProfile) {
          setUserProfile(storedProfile);
        }
      }
      
      setLoading(false);
    });

    // Luister naar auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`${authConfig.productName}: Auth event:`, event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          // Sla nieuwe auth data op
          authApi.setAuthData({
            userId: newSession.user.id,
            authToken: newSession.access_token,
          });
          
          // Haal user profile op
          await fetchUserProfileAndCompany(newSession.user.id, newSession);
        } else if (event === 'SIGNED_OUT') {
          // Clear alles
          authApi.clearAuthData();
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserProfileAndCompany]);

  const value = {
    user,
    session,
    userProfile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook om AuthContext te gebruiken
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook om te checken of gebruiker is ingelogd
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = authConfig.routes.login;
    }
  }, [user, loading]);
  
  return { user, loading };
} 
