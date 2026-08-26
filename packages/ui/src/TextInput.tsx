"use client"

export const TextInput = ({
    placeholder,
    onChange,
    label,
    type,
    id,
    value,
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    type?: string;
    id?: string;
    value?: string | number;
}) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "_");
    return <div className="pt-2">
        <label htmlFor={inputId} className="block mb-2 text-sm font-mono text-text-dim">{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type || "text"} id={inputId} className="bg-bg-dark border border-border-dark text-text-light font-mono text-sm rounded-sm focus:ring-0 focus:border-accent block w-full p-2.5 placeholder-text-dim transition-colors" placeholder={placeholder} />
    </div>
}