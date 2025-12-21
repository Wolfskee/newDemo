import { motion } from "framer-motion";
import { FlyingItem } from "@/types/api";

interface FlyingAnimationProps {
    flyingItem: FlyingItem;
}

export default function FlyingAnimation( { flyingItem }: FlyingAnimationProps) {
    return (
        <motion.div
            key={flyingItem.id}
            className="fixed z-50 pointer-events-none"
            initial={{
                x: flyingItem.startX - 20,
                y: flyingItem.startY - 20,
                scale: 1,
                opacity: 1,
            }}
            animate={{
                x: flyingItem.endX - 20,
                y: flyingItem.endY - 20,
                scale: 0.3,
                opacity: 0.8,
            }}
            exit={{
                scale: 0,
                opacity: 0,
            }}
            transition={{
                duration: 0.8,
                ease: "easeInOut",
            }}
        >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                </svg>
            </div>
        </motion.div>
    )
}