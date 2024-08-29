import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color = "text-primary",
}) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className={`h-${size} w-${size} animate-spin ${color}`} />
    </div>
  );
};

export default LoadingSpinner;
