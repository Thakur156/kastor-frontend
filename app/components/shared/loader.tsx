import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  size?: number;
  color?: string;
}

const Loader = ({ size, color = "primary" }: LoaderProps) => {
  return (
    <div>
      <LoaderCircle
        size={size || 24}
        className={`animate-spin text-${color}`}
      />
    </div>
  );
};

export default Loader;
