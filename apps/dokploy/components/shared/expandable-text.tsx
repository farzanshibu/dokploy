import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface ExpandableTextProps {
  text: string | null | undefined;
  className?: string;
  charLimit?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  className,
  charLimit = 320,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateText = (text: string, limit: number): string => {
    if (text.length <= limit) return text;
    const adjustedLimit = Math.floor(limit / 5) * 5;
    const lastSpaceIndex = text.lastIndexOf(" ", adjustedLimit);
    const cutoffIndex = lastSpaceIndex > 0 ? lastSpaceIndex : adjustedLimit;

    return text.slice(0, cutoffIndex);
  };

  const longText = text || "";

  const renderText = () => {
    if (longText.length <= charLimit || isExpanded) {
      return longText;
    }
    return (
      <>
        {truncateText(longText, charLimit)}
        <span>...</span>
        <Link
          href="#"
          onClick={toggleExpanded}
          className="text-blue-500 underline-offset-4 hover:underline font-semibold p-0 h-auto align-baseline ml-1"
        >
          Read More
        </Link>
      </>
    );
  };

  return (
    <div className="w-full">
      <p className={cn(className, "inline")}>{renderText()}</p>
      {isExpanded && longText.length > charLimit && (
        <Link
          href="#"
          onClick={toggleExpanded}
          className="text-blue-500 underline-offset-4 hover:underline font-semibold p-0 h-auto align-baseline ml-1"
        >
          Read Less
        </Link>
      )}
    </div>
  );
};

export { ExpandableText };
