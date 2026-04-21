import { useCallback, type CSSProperties, type ReactNode, type UIEvent } from "react";
import { useHeaderContext } from "../context/HeaderContext";
import "./ScrollContainer.css";

type ScrollContainerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const HEADER_HEIGHT = 76;

export function ScrollContainer({
  children,
  className = "",
  style,
}: ScrollContainerProps) {
  const { onScroll } = useHeaderContext();

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      onScroll(event.currentTarget.scrollTop);
    },
    [onScroll]
  );

  return (
    <div
      className={`scroll-container ${className}`}
      style={style}
      onScroll={handleScroll}
    >
      {children}
    </div>
  );
}
