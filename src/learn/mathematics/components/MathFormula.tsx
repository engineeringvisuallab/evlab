import React, { useEffect, useRef } from "react";
import katex from "katex";

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  /** Alias for displayMode used by several callers in this lab. */
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode,
  block = false,
  className = "",
}) => {
  const isDisplayMode = displayMode ?? block;
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode: isDisplayMode,
          throwOnError: false,
          strict: false,
        });
      } catch (err) {
        console.warn("KaTeX render warning:", err);
        if (containerRef.current) {
          containerRef.current.textContent = formula;
        }
      }
    }
  }, [formula, isDisplayMode]);

  return (
    <span
      ref={containerRef}
      className={`inline-block select-text font-serif text-slate-100 ${
        isDisplayMode ? "my-2 overflow-x-auto py-1 max-w-full text-center" : "px-0.5"
      } ${className}`}
    />
  );
};
