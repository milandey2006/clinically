"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ///////////////////////////////////////////////////////////////////////////
// Custom hook for theme toggle functionality
export const useThemeToggle = ({
    variant = "circle-blur",
    start = "top-right",
    blur = false,
    gifUrl = "",
} = {}) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [isDark, setIsDark] = useState(false);

    // Sync isDark state with resolved theme after hydration
    useEffect(() => {
        setIsDark(resolvedTheme === "dark");
    }, [resolvedTheme]);

    const styleId = "theme-transition-styles";

    const updateStyles = useCallback((css, name) => {
        if (typeof window === "undefined") return;

        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = css;
    }, []);

    const toggleTheme = useCallback((e) => {
        // Get button position relative to viewport
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();

        // Calculate center of button for animation origin
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Calculate percentages for clip-path (still useful if we needed it, but we use pixels for mask)
        const xPercent = (x / window.innerWidth) * 100;
        const yPercent = (y / window.innerHeight) * 100;

        setIsDark(!isDark);

        // Pass the calculated position to createAnimation
        // We pass percentages for consistency, but we could pass pixels if needed.
        // For radial-gradient, percentages work well.
        const animation = createAnimation(variant, start, blur, gifUrl, { x: xPercent, y: yPercent });

        updateStyles(animation.css, animation.name);

        if (typeof window === "undefined") return;

        const switchTheme = () => {
            setTheme(theme === "light" ? "dark" : "light");
        };

        if (!document.startViewTransition) {
            switchTheme();
            return;
        }

        document.startViewTransition(switchTheme);
    }, [
        theme,
        setTheme,
        variant,
        start,
        blur,
        gifUrl,
        updateStyles,
        isDark,
        setIsDark,
    ]);

    return {
        isDark,
        toggleTheme,
    };
};

// ///////////////////////////////////////////////////////////////////////////

export const SkiperThemeToggle = ({
    className = "",
    variant = "circle-blur",
    start = "top-right",
    blur = false,
    gifUrl = "",
}) => {
    const { isDark, toggleTheme } = useThemeToggle({
        variant,
        start,
        blur,
        gifUrl,
    });

    return (
        <button
            type="button"
            className={cn(
                "size-10 cursor-pointer rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center",
                isDark ? "bg-black text-white" : "bg-white text-black",
                className,
            )}
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            <span className="sr-only">Toggle theme</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="currentColor"
                strokeLinecap="round"
                viewBox="0 0 32 32"
                className="size-6"
            >
                <clipPath id="skiper-btn-3">
                    <motion.path
                        animate={{ y: isDark ? 14 : 0, x: isDark ? -11 : 0 }}
                        transition={{ ease: "easeInOut", duration: 0.35 }}
                        d="M0-11h25a1 1 0 0017 13v30H0Z"
                    />
                </clipPath>
                <g clipPath="url(#skiper-btn-3)">
                    <motion.circle
                        animate={{ r: isDark ? 10 : 8 }}
                        transition={{ ease: "easeInOut", duration: 0.35 }}
                        cx="16"
                        cy="16"
                    />
                    <motion.g
                        animate={{
                            scale: isDark ? 0.5 : 1,
                            opacity: isDark ? 0 : 1,
                        }}
                        transition={{ ease: "easeInOut", duration: 0.35 }}
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
                    </motion.g>
                </g>
            </svg>
        </button>
    );
};

// ///////////////////////////////////////////////////////////////////////////

const getPositionCoords = (position) => {
    switch (position) {
        case "top-left":
            return { cx: "0", cy: "0" };
        case "top-right":
            return { cx: "40", cy: "0" };
        case "bottom-left":
            return { cx: "0", cy: "40" };
        case "bottom-right":
            return { cx: "40", cy: "40" };
        case "top-center":
            return { cx: "20", cy: "0" };
        case "bottom-center":
            return { cx: "20", cy: "40" };
        // For directional positions, default to center (these are used for rectangle variant)
        case "bottom-up":
        case "top-down":
        case "left-right":
        case "right-left":
            return { cx: "20", cy: "20" };
        default:
            return { cx: "20", cy: "20" };
    }
};

const generateSVG = (variant, start) => {
    // circle-blur variant handles center case differently, so check it first
    if (variant === "circle-blur") {
        if (start === "center") {
            return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>`;
        }
        const positionCoords = getPositionCoords(start);
        if (!positionCoords) {
            throw new Error(`Invalid start position: ${start}`);
        }
        const { cx, cy } = positionCoords;
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
    }

    if (start === "center") return;

    // Rectangle variant doesn't use SVG masks, so return early
    if (variant === "rectangle") return "";

    const positionCoords = getPositionCoords(start);
    if (!positionCoords) {
        throw new Error(`Invalid start position: ${start}`);
    }
    const { cx, cy } = positionCoords;

    if (variant === "circle") {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
    }

    return "";
};

const getTransformOrigin = (start) => {
    switch (start) {
        case "top-left":
            return "top left";
        case "top-right":
            return "top right";
        case "bottom-left":
            return "bottom left";
        case "bottom-right":
            return "bottom right";
        case "top-center":
            return "top center";
        case "bottom-center":
            return "bottom center";
        // For directional positions, default to center
        case "bottom-up":
        case "top-down":
        case "left-right":
        case "right-left":
            return "center";
        default:
            return "center";
    }
};

export const createAnimation = (
    variant,
    start = "center",
    blur = false,
    url,
    clickPosition
) => {
    const svg = generateSVG(variant, start);
    const transformOrigin = getTransformOrigin(start);

    if (variant === "circle-blur") {
        // If we have click position, use it for dynamic origin
        const origin = clickPosition
            ? `${clickPosition.x}% ${clickPosition.y}%`
            : transformOrigin;

        // For circle-blur with dynamic position, we use a radial-gradient mask
        // This creates a smooth, soft-edged circle transition without blurring the content
        if (clickPosition) {
            return {
                name: `${variant}-dynamic`,
                css: `
            ::view-transition-group(root) {
                animation-duration: 1.5s;
                animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
            }
            
            ::view-transition-new(root) {
                animation-name: reveal-light-dynamic;
                mix-blend-mode: normal;
            }

            ::view-transition-old(root),
            .dark::view-transition-old(root) {
                animation: none;
                z-index: -1;
            }
            .dark::view-transition-new(root) {
                animation-name: reveal-dark-dynamic;
                mix-blend-mode: normal;
            }

            @keyframes reveal-dark-dynamic {
                from {
                    clip-path: circle(0% at ${clickPosition.x}% ${clickPosition.y}%);
                }
                to {
                    clip-path: circle(150% at ${clickPosition.x}% ${clickPosition.y}%);
                }
            }

            @keyframes reveal-light-dynamic {
                from {
                    clip-path: circle(0% at ${clickPosition.x}% ${clickPosition.y}%);
                }
                to {
                    clip-path: circle(150% at ${clickPosition.x}% ${clickPosition.y}%);
                }
            }
            `
            };
        }

        if (start === "center") {
            return {
                name: `${variant}-${start}`,
                css: `
        ::view-transition-group(root) {
          animation-timing-function: var(--expo-out);
        }

        ::view-transition-new(root) {
          mask: url('${svg}') center / 0 no-repeat;
          mask-origin: content-box;
          animation: scale 1s;
          transform-origin: center;
        }

        ::view-transition-old(root),
        .dark::view-transition-old(root) {
          animation: scale 1s;
          transform-origin: center;
          z-index: -1;
        }

        @keyframes scale {
          to {
            mask-size: 350vmax;
          }
        }
        `,
            };
        }

        return {
            name: `${variant}-${start}`,
            css: `
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale 1s;
        transform-origin: ${transformOrigin};
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale 1s;
        transform-origin: ${transformOrigin};
        z-index: -1;
      }

      @keyframes scale {
        to {
          mask-size: 350vmax;
        }
      }
      `,
        };
    }

    // Fallback for other variants if needed (simplified for this task)
    return { name: "none", css: "" };
};
