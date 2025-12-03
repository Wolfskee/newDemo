"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
      </NavbarContent>
      <NavbarContent justify="end">
        {user ? (
          <>
            <NavbarItem>
              <span className="text-sm">Welcome, {user.email}</span>
            </NavbarItem>
            <NavbarItem>
              <Button color="danger" variant="flat" onPress={logout}>
                Logout
              </Button>
            </NavbarItem>
          </>
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
