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
  Badge,
} from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

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
          <>
            <NavbarItem>
              <Badge content={cartItemCount} color="danger" isInvisible={cartItemCount === 0}>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => router.push("/cart")}
                  aria-label="Shopping Cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </Button>
              </Badge>
            </NavbarItem>
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
