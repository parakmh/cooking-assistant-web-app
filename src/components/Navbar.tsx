import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User, LogIn, LogOut, UserPlus, ChefHat } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="size-4" />, show: 'always' },
    { name: "Inventory", path: "/inventory", icon: <ChefHat className="size-4" />, show: 'auth' },
    { name: "Recipes History", path: "/recipes", icon: <Calendar className="size-4" />, show: 'auth' },
    { name: "Profile", path: "/profile", icon: <User className="size-4" />, show: 'auth' },
  ];

  const authLinks = [
    { name: "Login", path: "/login", icon: <LogIn className="size-4" />, show: 'noAuth' },
    { name: "Register", path: "/register", icon: <UserPlus className="size-4" />, show: 'noAuth' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-kitchen-green mr-2">KitchenAI</span>
            <span className="hidden md:inline text-xl font-bold">Assistant</span>
          </Link>
        </div>

        <div className="hidden md:flex ml-auto items-center space-x-4">
          {navLinks.filter(link => link.show === 'always' || (link.show === 'auth' && isAuthenticated)).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {link.icon}
              <span className="ml-2">{link.name}</span>
            </Link>
          ))}
          {!isAuthenticated && authLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {link.icon}
              <span className="ml-2">{link.name}</span>
            </Link>
          ))}
          {isAuthenticated && (
            <Button onClick={handleLogout} variant="ghost" className="px-3 py-2 text-sm font-medium flex items-center hover:bg-muted">
              <LogOut className="size-4" />
              <span className="ml-2">Logout</span>
            </Button>
          )}
        </div>
        
        <div className="flex md:hidden ml-auto items-center space-x-1">
          {navLinks.filter(link => link.show === 'always' || (link.show === 'auth' && isAuthenticated)).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`p-2 rounded-md ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title={link.name}
            >
              {link.icon}
            </Link>
          ))}
          {!isAuthenticated && authLinks.map((link) => (
             <Link
              key={link.path}
              to={link.path}
              className={`p-2 rounded-md ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title={link.name}
            >
              {link.icon}
            </Link>
          ))}
          {isAuthenticated && (
            <Button onClick={handleLogout} variant="ghost" size="icon" className="p-2 hover:bg-muted" title="Logout">
              <LogOut className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
