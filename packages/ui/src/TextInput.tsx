"use client"

export const TextInput = ({
    placeholder,
    onChange,
    label,
    type,
    id,
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    type?: string;
    id?: string;
}) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "_");
    return <div className="pt-2">
        <label htmlFor={inputId} className="block mb-2 text-sm font-medium text-slate-100">{label}</label>
        <input onChange={(e) => onChange(e.target.value)} type={type || "text"} id={inputId} className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-slate-400" placeholder={placeholder} />
    </div>
}