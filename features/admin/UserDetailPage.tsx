"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination } from "@heroui/react";
import { apiGet } from "@/lib/api-client";
import { User, Appointment, Order } from "@/types/api";
import NotFoundCard from "./components/NotFoundCard";
import UserInfoCard from "./components/UserInfoCard";
import BookingCalendar from "@/components/BookingCalendar";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  
  // 计算分页数据
  const totalPages = Math.ceil(allOrders.length / itemsPerPage);
  const paginatedOrders = allOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // Check for admin session
    const stored = localStorage.getItem("adminUser");
    if (!stored) {
      router.push("/admin");
    } else {
      fetchUserData();
    }
  }, [router, userId]);

  const fetchUserData = async () => {
    try {
      // 获取用户信息
      try {
        const userData: User = await apiGet<User>(`user/${userId}`);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setLoading(false);
        return;
      }

      // 获取用户的预约
      try {
        const sanitizedUserId = encodeURIComponent(userId.trim());
        const endpoint = `appointment/user/${sanitizedUserId}`;
        const appointmentsData: Appointment[] = await apiGet<Appointment[]>(endpoint);
        const userAppointments = (appointmentsData || []).filter(
          (apt) => apt.customerId === userId && apt.status !== "CANCELLED"
        );
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      }

      // 获取用户的订单历史
      await fetchOrders();

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // 尝试获取订单，如果 API 不存在则使用空数组
      const sanitizedUserId = encodeURIComponent(userId.trim());
      const endpoint = `order/user/${sanitizedUserId}`;
      
      try {
        // 获取所有订单（前端分页）
        const ordersData: Order[] = await apiGet<Order[]>(endpoint);
        
        // 如果返回的是数组
        if (Array.isArray(ordersData)) {
          // 按创建时间降序排序
          const sortedOrders = ordersData.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAllOrders(sortedOrders);
        }
      } catch (orderError) {
        // 如果订单 API 不存在或失败，设置为空数组
        console.warn("Order API not available or failed:", orderError);
        setAllOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAllOrders([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <NotFoundCard
            message="User not found"
            backLabel="← Back to Users"
            onBack={() => router.push("/admin/users")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Appointment history for {user.username || user.email}
            </p>
          </div>
          <Button
            color="default"
            variant="flat"
            onPress={() => router.push("/admin/users")}
          >
            ← Back to Users
          </Button>
        </div>

        <UserInfoCard user={user} bookingsCount={appointments.length} />
        
        {/* 订单历史 */}
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Order History</h2>
          </CardHeader>
          <CardBody>
            {allOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No history
              </p>
            ) : (
              <>
                <Table aria-label="Order history table">
                  <TableHeader>
                    <TableColumn>ORDER ID</TableColumn>
                    <TableColumn>ITEMS</TableColumn>
                    <TableColumn>TOTAL</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>DATE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {order.items?.length || 0} item(s)
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${order.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={
                                order.status === "COMPLETED" ? "success" :
                                order.status === "PENDING" ? "warning" :
                                order.status === "CANCELLED" ? "danger" :
                                "default"
                              }
                              size="sm"
                              variant="flat"
                            >
                              {order.status}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      total={totalPages}
                      page={currentPage}
                      onChange={(page) => setCurrentPage(page as number)}
                      color="primary"
                    />
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* 预约日历 */}
        <div className="mt-6">
          <BookingCalendar appointments={appointments} />
        </div>
      </div>
    </div>
  );
}
