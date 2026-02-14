import { cn } from "~/lib/utils";

interface CatalogItemProps {
  name: string;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const CatalogItem = ({
  name,
  active,
  icon,
  onClick,
  className,
}: CatalogItemProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "px-5 py-7 flex items-center gap-x-2 rounded-[20px]  transition-all",
        active ? "bg-Gray border-l-[3px] border-Blue" : "hover:bg-lightGray",
        className
      )}
    >
      {icon}
      <h3>{name}</h3>
    </div>
  );
};

export default CatalogItem;
