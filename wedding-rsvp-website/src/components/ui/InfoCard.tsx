import React from "react";
import { Card } from "./Card";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  animationDelay?: string;
}

export const InfoCard = ({
  icon,
  title,
  description,
  animationDelay,
}: InfoCardProps) => {
  return (
    <Card
      variant="glass"
      className="p-4 sm:p-6 hover-lift animate-fade-in"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="grid grid-cols-12 max-md:grid-cols-1 items-start sm:items-center gap-3">
        <div className="col-span-3 flex flex-row gap-3">
          <div className="w-6 h-6 bg-linear-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            {icon}
          </div>
          <p className="text-left font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
            {title}
          </p>
        </div>
        <div className="col-span-8 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <div className="text-left">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
