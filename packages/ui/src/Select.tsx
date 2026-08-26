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
    }} className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        {options.map(option => <option key={option.key} value={option.key}>{option.value}</option>)}
  </select>
}