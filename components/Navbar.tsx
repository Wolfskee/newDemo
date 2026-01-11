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
} from "@heroui/react";
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
      {/* 移动端布局 */}
      <NavbarContent className="md:hidden gap-2" justify="start">
        <NavbarItem>
          <Link
            as={NextLink}
            color={pathname === "/" ? "primary" : "foreground"}
            href="/"
            className="font-bold"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button
            color="secondary"
            variant="flat"
            size="sm"
            onPress={() => {
              if (user) {
                router.push("/profile#booking");
              } else {
                if (pathname === "/") {
                  // 如果在首页，滚动到 Calendar
                  const element = document.getElementById("booking-calendar");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                } else {
                  // 如果不在首页，跳转到首页的 Calendar 锚点
                  router.push("/#booking-calendar");
                }
              }
            }}
          >
            Book Service
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* 桌面端布局 - 左侧链接 */}
      <NavbarContent className="hidden md:flex gap-4" justify="start">
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
                if (pathname === "/") {
                  // 如果在首页，滚动到 Calendar
                  const element = document.getElementById("booking-calendar");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                } else {
                  // 如果不在首页，跳转到首页的 Calendar 锚点
                  router.push("/#booking-calendar");
                }
              }
            }}
          >
            Book a Service
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* 移动端和桌面端 - 右侧操作 */}
      <NavbarContent justify="end">
        {/* 移动端汉堡菜单 */}
        <NavbarItem className="md:hidden">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                aria-label="Menu"
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
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Navigation Menu" variant="flat">
              <DropdownItem
                key="products"
                color={pathname === "/products" ? "primary" : "default"}
                onPress={() => router.push("/products")}
              >
                Products
              </DropdownItem>
              <DropdownItem
                key="services"
                color={pathname === "/services" ? "primary" : "default"}
                onPress={() => router.push("/services")}
              >
                Services
              </DropdownItem>
              <DropdownItem
                key="about"
                color={pathname === "/about" ? "primary" : "default"}
                onPress={() => router.push("/about")}
              >
                About Us
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

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
            {/* 移动端 Login 按钮 */}
            <NavbarItem className="md:hidden">
              <Button
                as={NextLink}
                color="primary"
                href="/login"
                variant="flat"
                size="sm"
              >
                Login
              </Button>
            </NavbarItem>
            {/* 桌面端 Login 和 Sign Up 按钮 */}
            <NavbarItem className="hidden md:flex">
              <Button as={NextLink} color="primary" href="/login" variant="flat">
                Login
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden md:flex">
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
