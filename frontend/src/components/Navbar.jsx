import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../contexts/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Check if user is logged in
  const { user, logout } = useAuth();
  const isLoggedIn = user !== null;

  const getDashboardLink = () => {
    switch (user?.role) {
      case "Teacher":
        return "/teacher";
      case "Parent":
        return "/parent";
      case "School_Admin":
        return "/school";
      case "EduConnect_Admin":
        return "/admin";
      default:
        return "/login";
    }
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/#features" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/#about" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <HeroNavbar
      onMenuOpenChange={setIsMenuOpen}
      className="border-b border-divider"
      maxWidth="xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <Icon icon="lucide:book-open" className="text-primary text-2xl" />
            <p className="font-bold text-inherit text-xl">EduConnect</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={location.pathname === "/"}>
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "text-primary font-medium"
                : "text-foreground"
            }
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            to="/pricing"
            className={
              location.pathname === "/pricing"
                ? "text-primary font-medium"
                : "text-foreground"
            }
          >
            Pricing
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link to="/#features" className="text-foreground">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link to="/#about" className="text-foreground">
            About
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {isLoggedIn ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button
                as={Link}
                to={getDashboardLink()}
                variant="flat"
                color="primary"
                startContent={<Icon icon="lucide:layout-dashboard" />}
              >
                Dashboard
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                onPress={handleLogout}
                variant="light"
                startContent={<Icon icon="lucide:log-out" />}
              >
                Logout
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button as={Link} to="/login" variant="flat">
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} to="/register" color="primary">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              to={item.path}
              className={`w-full ${
                location.pathname === item.path
                  ? "text-primary font-medium"
                  : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {isLoggedIn && (
          <NavbarMenuItem>
            <Link
              to={getDashboardLink()}
              className="w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
};
