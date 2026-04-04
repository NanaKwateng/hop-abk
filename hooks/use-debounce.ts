// // src/hooks/use-debounce.ts
// // ============================================================
// // DEBOUNCE explained with a real-world analogy:
// //
// // Imagine you're in an elevator. The door stays open for 3 seconds
// // after the last person enters. If someone enters at second 2,
// // the timer RESETS to 3 seconds. The door only closes when
// // nobody has entered for a full 3 seconds.
// //
// // Debounce works the same way with typing:
// // - User types "J" → start 300ms timer
// // - User types "o" (100ms later) → RESET timer to 300ms
// // - User types "h" (50ms later) → RESET timer to 300ms
// // - User types "n" (80ms later) → RESET timer to 300ms
// // - User stops typing → 300ms passes → NOW we search for "John"
// //
// // Without debounce: 4 searches ("J", "Jo", "Joh", "John")
// // With debounce:    1 search ("John")
// // ============================================================

// import { useState, useEffect } from "react";

// /**
//  * Custom hook that debounces a value.
//  * 
//  * @param value - The value to debounce (usually from an input)
//  * @param delay - How many milliseconds to wait (default: 300)
//  * @returns The debounced value (updates only after the delay)
//  * 
//  * Usage:
//  *   const [search, setSearch] = useState("");
//  *   const debouncedSearch = useDebounce(search, 300);
//  *   // debouncedSearch only updates 300ms after the user stops typing
//  */
// export function useDebounce<T>(value: T, delay: number = 300): T {
//     // This state holds the "delayed" value
//     const [debouncedValue, setDebouncedValue] = useState<T>(value);

//     useEffect(() => {
//         // Start a timer. When it fires, update the debounced value.
//         const timer = setTimeout(() => {
//             setDebouncedValue(value);
//         }, delay);

//         // CLEANUP: If the value changes before the timer fires,
//         // cancel the old timer. This is the "reset" behavior.
//         // React calls this cleanup function before running the effect again.
//         return () => {
//             clearTimeout(timer);
//         };
//     }, [value, delay]); // Re-run when value or delay changes

//     return debouncedValue;
// }


// src/hooks/use-debounce.ts
import { useState, useEffect, useRef } from "react";

/**
 * ✅ PRODUCTION-READY: Debounces a value with proper cleanup
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // ✅ FIX: Store timeout ref

    useEffect(() => {
        // ✅ Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // ✅ Set new timeout
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // ✅ CRITICAL: Cleanup on unmount or value change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [value, delay]);

    // ✅ ADD: Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedValue;
}