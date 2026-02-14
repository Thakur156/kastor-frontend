import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Loader from "~/components/shared/loader";

interface CustomSelectProps {
  options: { title: string; value: string }[];
  placeholder?: string;
  loading?: boolean;
  onChange?: (value: string) => void;
  onClick?: () => void;
  defaultValue?: string;
}

const CustomSelect = ({
  options,
  placeholder,
  loading,
  onChange,
  onClick,
  defaultValue,
}: CustomSelectProps) => {
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={onChange}
      disabled={loading}
    >
      <SelectTrigger className="w-fit rounded-full" onClick={onClick}>
        <SelectValue
          placeholder={
            loading ? (
              <div className="flex items-center gap-2">
                <span>Loading</span>
                <Loader size={18} />
              </div>
            ) : (
              placeholder
            )
          }
        />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
