// src/components/StarRating.tsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  totalStars?: number;
  initialRating?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  initialRating = 0,
  onRate,
  readOnly = false,
  size = 24,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (ratingValue: number) => {
    if (readOnly) return;
    setRating(ratingValue);
    if (onRate) {
      onRate(ratingValue);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        const isActive = ratingValue <= (hover || rating);
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => handleClick(ratingValue)}
              className="hidden"
              disabled={readOnly}
            />
            <Star
              size={size}
              className={cn(
                "cursor-pointer transition-all",
                isActive
                  ? "text-yellow-400 fill-current drop-shadow-md"
                  : "text-neutral-400",
                !readOnly && "hover:text-yellow-500 hover:scale-110",
                readOnly && "cursor-default"
              )}
              onMouseEnter={() => !readOnly && setHover(ratingValue)}
              onMouseLeave={() => !readOnly && setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
};
