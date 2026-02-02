import { create } from 'zustand';

export interface Order {
    id: number;
    customer: string;
    product: string;
    status: string;
    date: string;
}

interface RecentOrdersStore {
    recentOrders: Order[];
}

export const useRecentOrdersStore = create<RecentOrdersStore>((set) => ({
    recentOrders: [
        { id: 1, customer: "John Doe", product: "Premium Product 1", status: "Completed", date: "2024-01-15" },
        { id: 2, customer: "Jane Smith", product: "Premium Product 2", status: "Pending", date: "2024-01-15" },
        { id: 3, customer: "Bob Johnson", product: "Consulting Service", status: "In Progress", date: "2024-01-14" },
        { id: 4, customer: "Alice Brown", product: "Basic Subscription", status: "Completed", date: "2024-01-13" },
        { id: 5, customer: "Charlie Davis", product: "Advanced Analytics", status: "Cancelled", date: "2024-01-12" },
        { id: 6, customer: "Diana Evans", product: "Premium Support", status: "Completed", date: "2024-01-12" },
        { id: 7, customer: "Frank Green", product: "Enterprise Plan", status: "Pending", date: "2024-01-11" },
        { id: 8, customer: "Grace Hill", product: "Custom Integration", status: "In Progress", date: "2024-01-11" },
        { id: 9, customer: "Henry Irving", product: "Data Migration", status: "Completed", date: "2024-01-10" },
        { id: 10, customer: "Ivy Jackson", product: "Cloud Hosting", status: "Completed", date: "2024-01-09" },
        { id: 11, customer: "Jack King", product: "Security Audit", status: "Pending", date: "2024-01-08" },
        { id: 12, customer: "Kelly Lewis", product: "UI/UX Design", status: "In Progress", date: "2024-01-08" },
        { id: 13, customer: "Liam Moore", product: "API Access", status: "Completed", date: "2024-01-07" },
        { id: 14, customer: "Mia Nelson", product: "Storage Upgrade", status: "Completed", date: "2024-01-07" },
        { id: 15, customer: "Noah Olson", product: "Dedicated Server", status: "Cancelled", date: "2024-01-06" },
        { id: 16, customer: "Olivia Parker", product: "Load Balancing", status: "Pending", date: "2024-01-05" },
        { id: 17, customer: "Paul Quinn", product: "Backup Service", status: "In Progress", date: "2024-01-05" },
        { id: 18, customer: "Quinn Roberts", product: "SSL Certificate", status: "Completed", date: "2024-01-04" },
        { id: 19, customer: "Rachel Scott", product: "Domain Registration", status: "Completed", date: "2024-01-03" },
        { id: 20, customer: "Sam Taylor", product: "Email Marketing", status: "Pending", date: "2024-01-02" },
    ],
}));
