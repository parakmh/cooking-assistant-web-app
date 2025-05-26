
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="size-4" /> },
    { name: "Recipes History", path: "/recipes", icon: <Calendar className="size-4" /> },
    { name: "Profile", path: "/profile", icon: <User className="size-4" /> },
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
          {navLinks.map((link) => (
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
        </div>
        
        <div className="flex md:hidden ml-auto items-center space-x-1">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={`p-2 rounded-md ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
