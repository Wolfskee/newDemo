"use client";

import { useState } from "react";
import { Button, Drawer, DrawerContent, DrawerBody } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
  email: string;
  role: string; // 改为 string 以支持 "ADMIN" 或 "admin"
}

interface QuickActionsCardProps {
  adminUser: AdminUser;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function QuickActionsCard({ adminUser, isExpanded, onToggle }: QuickActionsCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // 检查是否为 ADMIN（忽略大小写）
  const isAdmin = adminUser.role?.toUpperCase() === "ADMIN";

  // 检查当前路径是否激活
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/products", label: "Products", icon: "📦" },
    { path: "/admin/services", label: "Services", icon: "🔧" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    ...(isAdmin ? [{ path: "/admin/employees", label: "Employees", icon: "👔" }] : []),
    { path: "/admin/Scheduling", label: "Scheduling", icon: "📅" },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  const NavigationContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          color={isActive(item.path) ? "primary" : "default"}
          variant={isActive(item.path) ? "solid" : "flat"}
          onPress={() => handleNavigation(item.path)}
          className={`justify-start ${isExpanded || isMobile ? '' : 'justify-center'} text-sm`}
          size="md"
          isIconOnly={!isExpanded && !isMobile}
          title={!isExpanded && !isMobile ? item.label : undefined}
        >
          <span className="text-lg">{item.icon}</span>
          {(isExpanded || isMobile) && <span className="ml-2">{item.label}</span>}
        </Button>
      ))}
    </nav>
  );

  return (
    <>
      {/* 桌面端左侧导航栏 */}
      <aside
        className={`
          hidden lg:flex flex-col
          h-screen
          sticky top-0
          bg-gray-800 border-r border-gray-700
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        {/* 头部和切换按钮 */}
        <div className={`p-4 border-b border-gray-700 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && (
            <h2 className="text-lg font-bold text-white">Admin</h2>
          )}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onToggle}
            className={isExpanded ? '' : 'mx-auto'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`text-white transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Button>
        </div>

        {/* 导航内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          <NavigationContent />
        </div>

        {/* 底部用户信息 */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 truncate">{adminUser.email}</p>
            <p className="text-xs text-gray-500 mt-1">{isAdmin ? "Admin" : "Employee"}</p>
          </div>
        )}
      </aside>

      {/* 移动端左上角汉堡菜单按钮 */}
      <Button
        isIconOnly
        variant="flat"
        onPress={() => setIsDrawerOpen(!isDrawerOpen)}
        className={`
          lg:hidden fixed left-3 top-3 z-50
          bg-gray-800/90 backdrop-blur-sm
          border border-gray-700
          shadow-lg
          min-w-[44px] min-h-[44px]
        `}
        aria-label="Toggle menu"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`text-white transition-transform duration-300 ${isDrawerOpen ? 'rotate-90' : ''}`}
        >
          {isDrawerOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </Button>

      {/* 移动端 Drawer */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
        placement="left"
        size="sm"
        classNames={{
          base: "lg:hidden",
          backdrop: "lg:hidden",
        }}
      >
        <DrawerContent className="bg-gray-800">
          <DrawerBody className="p-4 pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">Navigation</h2>
            </div>
            <NavigationContent isMobile={true} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
