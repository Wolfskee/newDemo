"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Don't show navbar on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="gap-4" justify="start">
        <NavbarItem>
          <Link
            as={NextLink}
            color={pathname === "/" ? "primary" : "foreground"}
            href="/"
            className="font-bold text-lg"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            as={NextLink}
            color={pathname === "/products" ? "primary" : "foreground"}
            href="/products"
          >
            Products
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            as={NextLink}
            color={pathname === "/services" ? "primary" : "foreground"}
            href="/services"
          >
            Services
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            as={NextLink}
            color={pathname === "/about" ? "primary" : "foreground"}
            href="/about"
          >
            About Us
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button
            color="secondary"
            variant="flat"
            onPress={() => {
              if (user) {
                router.push("/profile#booking");
              } else {
                router.push("/login");
              }
            }}
          >
            Book a Service
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {user ? (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform cursor-pointer"
                  name={user.username || user.email}
                  size="sm"
                  fallback="👤"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  onPress={() => router.push("/profile")}
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={handleLogout}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem>
              <Button as={NextLink} color="primary" href="/login" variant="flat">
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={NextLink} color="primary" href="/register" variant="solid">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
}
