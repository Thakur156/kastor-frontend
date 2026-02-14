import React from "react";

interface TwoColumnsProps {
  children: React.ReactNode;
  image: string;
}

const TwoColumns = ({ children, image }: TwoColumnsProps) => {
  return (
    <div className="flex h-full overflow-y-auto lg:overflow-hidden">
      <div className="w-full overflow-hidden rounded-r-[20px] hidden lg:block">
        <img src={image} alt="cover" className="h-full w-full object-cover" />
      </div>
      {children}
    </div>
  );
};

export default TwoColumns;
