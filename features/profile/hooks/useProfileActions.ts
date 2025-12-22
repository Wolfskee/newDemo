import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStore } from "../store/useProfileStore";

export const useProfileActions = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { fetchAppointments } = useProfileStore();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleBookingSuccess = () => {
        if (user?.id) {
            fetchAppointments(user.id);
        }
    };

    return {
        handleLogout,
        handleBookingSuccess,
    };
};
