"use client"
export const Select = ({ options, onSelect, value }: {
    onSelect: (value: string) => void;
    options: {
        key: string;
        value: string;
    }[];
    value?: string;
}) => {
    return <select value={value} onChange={(e) => {
        onSelect(e.target.value)
    }} className="bg-bg-dark border border-border-dark text-text-light font-mono text-sm rounded-sm focus:ring-0 focus:border-accent block w-full p-2.5 transition-colors">
        {options.map(option => <option key={option.key} value={option.key}>{option.value}</option>)}
  </select>
}