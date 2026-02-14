import React from "react";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
}

const SearchInput = ({ placeholder }: SearchInputProps) => {
  return (
    <div className="relative">
      <Input placeholder={placeholder || "Search"} className="pr-12" />
      <Search className="absolute right-5 top-1/2 -translate-y-1/2" />
    </div>
  );
};

export default SearchInput;
