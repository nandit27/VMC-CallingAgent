import React from "react";
import { cn } from "../../lib/utils";

export function BentoGrid({ items, className }) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6", className)}>
            {items.map((item, index) => (
                <BentoItem key={index} item={item} />
            ))}
        </div>
    );
}

export function BentoItem({ item, className }) {
    return (
        <div
            className={cn(
                "group relative p-6 rounded-2xl overflow-hidden transition-all duration-300",
                "border border-white/10 bg-surface backdrop-blur-md",
                "hover:shadow-[0_4px_24px_rgba(255,255,255,0.05)]",
                "hover:-translate-y-1 will-change-transform",
                item.colSpan || "col-span-1",
                item.colSpan === 2 ? "md:col-span-2" : "",
                item.colSpan === 3 ? "md:col-span-3" : "",
                item.hasPersistentHover ? "shadow-[0_4px_24px_rgba(255,255,255,0.05)] -translate-y-1" : "",
                className
            )}
        >
            <div
                className={cn(
                    "absolute inset-0",
                    item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
            </div>

            <div className="relative flex flex-col h-full space-y-4 z-10">
                {(item.icon || item.status) && (
                    <div className="flex items-start justify-between">
                        {item.icon && (
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300", item.iconWrapperClass)}>
                                {item.icon}
                            </div>
                        )}
                        {item.status && (
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-md",
                                    "bg-white/10 text-white",
                                    "transition-colors duration-300 group-hover:bg-white/20",
                                    item.statusClass
                                )}
                            >
                                {item.status}
                            </span>
                        )}
                    </div>
                )}

                {(item.title || item.description) && (
                    <div className="space-y-2">
                        {item.title && (
                            <h3 className="font-semibold text-white tracking-tight text-lg flex items-center">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-gray-400 font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                        )}
                        {item.description && (
                            <p className="text-sm text-gray-300 leading-snug font-medium">
                                {item.description}
                            </p>
                        )}
                    </div>
                )}

                {item.content && (
                    <div className="flex-1 mt-4">
                        {item.content}
                    </div>
                )}

                {(item.tags || item.cta) && (
                    <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            {item.tags?.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        {item.cta && (
                            <span className="text-xs font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {item.cta}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div
                className={cn(
                    "absolute inset-0 z-0 rounded-2xl p-px bg-gradient-to-br from-transparent via-white/10 to-transparent",
                    item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
            />
            <div
                className={cn(
                    "absolute -inset-px z-[-1] rounded-2xl bg-gradient-to-br from-transparent via-blue-500/5 to-transparent blur-md",
                    item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
            />
        </div>
    );
}