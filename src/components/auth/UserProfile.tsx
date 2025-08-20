'use client';

import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { authUrls } from '@/lib/auth-config';

export function UserProfile() {
  const { user, userProfile, signOut } = useAuth();

  if (!user) return null;

  const displayName = userProfile?.name || user.email || 'Gebruiker';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await signOut();
    // Redirect naar LinkAI logout om ook daar uit te loggen
    window.location.href = authUrls.getLogoutUrl();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {initials}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
            {(userProfile?.company_name || userProfile?.company_id) && (
              <p className="text-xs text-muted-foreground">
                Company: {userProfile?.company_name || userProfile?.company_id}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profiel
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Instellingen
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Uitloggen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 