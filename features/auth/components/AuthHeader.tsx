interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    return (
        <div className="flex flex-col gap-1 items-center pt-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
        </div>
    );
}


