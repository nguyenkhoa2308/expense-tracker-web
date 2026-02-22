import { forwardRef, useImperativeHandle } from "react";
import { motion, useAnimate } from "motion/react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";

interface SidebarToggleIconProps extends AnimatedIconProps {
  collapsed?: boolean;
}

const SidebarToggleIcon = forwardRef<AnimatedIconHandle, SidebarToggleIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "", collapsed = false },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = async () => {
      animate(
        ".chevron",
        { x: [0, -2, 0], opacity: [1, 0.7, 1] },
        { duration: 1.5 },
      );
      animate(".sidebar-line", { x: [0, -2, 0] }, { duration: 2 });
    };

    const stop = () => {
      animate(".chevron", { x: 0, opacity: 1 }, { duration: 0.2 });
      animate(".sidebar-line", { x: 0 }, { duration: 0.2 });
    };

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
        onHoverStart={start}
        onHoverEnd={stop}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        <motion.path className="sidebar-line" d="M9 4v16" />
        <motion.path
          className="chevron"
          d={collapsed ? "M14 10l2 2l-2 2" : "M15 10l-2 2l2 2"}
        />
      </motion.svg>
    );
  },
);

SidebarToggleIcon.displayName = "SidebarToggleIcon";

export default SidebarToggleIcon;
