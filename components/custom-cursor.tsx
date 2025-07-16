"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [color, setColor] = useState("#ffffff")
    const mouseRef = useRef({ x: 0, y: 0 })
    const cursorRef = useRef({ x: 0, y: 0 })
    const animationFrame = useRef<number | null>(null)

    // Smooth follow effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }

            // Get the color of the element under the cursor
            const element = document.elementFromPoint(e.clientX, e.clientY)
            if (element) {
                // Check if the element is a button or has a button parent
                const isButton = element.tagName === 'BUTTON' || element.closest('button')

                // For buttons, always use white color
                if (isButton) {
                    setColor("#ffffff")
                    return
                }

                const computedStyle = window.getComputedStyle(element)
                const backgroundColor = computedStyle.backgroundColor

                // Convert RGB to HSL to determine if background is light or dark
                const rgb = backgroundColor.match(/\d+/g)
                if (rgb) {
                    const [r, g, b] = rgb.map(Number)
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000
                    setColor(brightness > 128 ? "#000000" : "#ffffff")
                }
            }
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // Animation loop for smoothing
    useEffect(() => {
        const lerp = (a: number, b: number, n: number) => a + (b - a) * n
        const animate = () => {
            cursorRef.current.x = lerp(cursorRef.current.x, mouseRef.current.x, 0.25)
            cursorRef.current.y = lerp(cursorRef.current.y, mouseRef.current.y, 0.25)
            setPosition({ x: cursorRef.current.x, y: cursorRef.current.y })
            animationFrame.current = requestAnimationFrame(animate)
        }
        animate()
        return () => {
            if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current)
        }
    }, [])

    return (
        <motion.div
            className="fixed pointer-events-none z-[9999] mix-blend-difference"
            animate={{
                x: position.x - 16,
                y: position.y - 16,
            }}
            transition={{
                type: "linear",
                duration: 0,
            }}
            style={{
                willChange: "transform",
            }}
        >
            <div
                className="w-8 h-8 rounded-full"
                style={{
                    backgroundColor: color,
                    pointerEvents: "none",
                }}
            />
        </motion.div>
    )
}