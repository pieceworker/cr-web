import React from "react";
import { Chapter } from "@/lib/db";

interface DiffViewerProps {
    original: Record<string, unknown>;
    proposed: Record<string, unknown>;
    chapters?: Chapter[];
}

export default function DiffViewer({ original, proposed, chapters = [] }: DiffViewerProps) {
    const keys = Array.from(new Set([...Object.keys(original), ...Object.keys(proposed)]));
    
    // Ignore internal IDs and timestamps for diffing
    const ignoreKeys = ['id', 'user_id', 'target_id', 'created_at', 'updated_at', 'owner_id'];
    
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changes: { key: string, old: any, new: any }[] = [];

    keys.forEach(key => {
        if (ignoreKeys.includes(key)) return;
        
        let oldVal = original[key];
        let newVal = proposed[key];

        // Format values for display
        if (Array.isArray(oldVal)) oldVal = JSON.stringify(oldVal);
        if (Array.isArray(newVal)) newVal = JSON.stringify(newVal);

        // Safely parse JSON arrays for display 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatValue = (k: string, val: any) => {
            if (val === null || val === undefined) return <span className="text-zinc-400 italic">None</span>;
            
            if (k === 'chapters' || k === 'director_chapters') {
                try {
                    const ids = typeof val === 'string' ? JSON.parse(val) : val;
                    if (Array.isArray(ids)) {
                        if (ids.length === 0) return <span className="text-zinc-400 italic">Empty</span>;
                        return ids.map((id: string) => {
                            const c = chapters.find(c => c.id === id);
                            return <span key={id} className="inline-block bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px] mr-1">{c?.location || id}</span>;
                        });
                    }
                } catch { }
            }
            if (k === 'image' && typeof val === 'string' && val.startsWith('/')) {
                return (
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 relative rounded overflow-hidden bg-zinc-200 border border-zinc-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={val} alt="preview" className="object-cover w-full h-full" />
                     </div>
                     <span className="text-xs truncate max-w-[100px]">{val.split('/').pop()}</span>
                   </div>
                );
            }
            
            return String(val);
        };

        if (oldVal !== newVal) {
            changes.push({
                key,
                old: formatValue(key, oldVal),
                new: formatValue(key, newVal)
            });
        }
    });

    if (changes.length === 0) {
        return <p className="text-sm italic text-zinc-500">No properties changed.</p>;
    }

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 border-b border-red-200 dark:border-red-900 pb-1 mb-2">Changes Detected</h4>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase tracking-tighter text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                <span>Field</span>
                <span>Before</span>
                <span>After</span>
            </div>
            {changes.map(change => (
                <div key={change.key} className="grid grid-cols-3 gap-2 text-sm items-center py-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 capitalize">{change.key.replace(/_/g, ' ')}</span>
                    <span className="text-red-500 bg-red-50 dark:bg-red-900/10 px-2 py-1 line-through break-all">{change.old}</span>
                    <span className="text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-1 font-medium break-all">{change.new}</span>
                </div>
            ))}
        </div>
    );
}
