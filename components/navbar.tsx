"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Home, Menu, User, Plus, Search, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  currentPath?: string;
}

export function Navbar({ currentPath = '/' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  const menuItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/search', label: 'Rechercher', icon: Search },
  ];

  // Ajouter des éléments selon le rôle de l'utilisateur
  if (user) {
    if (user.role === 'admin') {
      menuItems.push({ href: '/admin', label: 'Administration', icon: Shield });
    }
    menuItems.push(
      { href: '/publish', label: 'Publier', icon: Plus },
      { href: '/profile', label: 'Mon profil', icon: User }
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentPath === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {user && (
          <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user.firstName}
              </span>
              {user.role === 'admin' && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span>UAD Deukouway</span>
            </SheetTitle>
          </SheetHeader>
          
          {user && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {user.role === 'student' ? 'Étudiant' : 
                       user.role === 'landlord' ? 'Propriétaire' : 'Administrateur'}
                    </p>
                    {user.role === 'admin' && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPath === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            {user ? (
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            ) : (
              <Link href="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Se connecter
                </Button>
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}