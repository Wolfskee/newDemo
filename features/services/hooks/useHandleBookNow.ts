import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Service } from "@/types/api";


export const useHandleBookNow = () => {
    const router = useRouter();
    const { user } = useAuth();

    const handleBookNow = (service: Service) => {
        if (!user) {
            router.push("/login");
            return;
        }

        router.push("/profile#booking");
    };

    return { handleBookNow };
};
