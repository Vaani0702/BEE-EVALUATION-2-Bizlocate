// One labelled input with an icon, used by the Business and Owner forms.
// It lives in its OWN file (not inside the page component) so React does not rebuild it
// on every keystroke - otherwise the input would lose focus after each letter.
export default function FormField({ label, icon, name, value, onChange, placeholder, unit, type = "text", color = "blue", required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-700 font-semibold" htmlFor={name}>{label}</label>
      <div className="form-input-focus rounded-lg border border-gray-300 bg-white flex items-center pr-4">
        <span className={`material-symbols-outlined ml-4 ${color === "orange" ? "text-orange-500" : "text-blue-600"}`}>{icon}</span>
        <input
          className="w-full bg-transparent border-none focus:ring-0 py-3 px-3"
          id={name} name={name} type={type} placeholder={placeholder} required={required}
          value={value} onChange={onChange} min={type === "number" ? 0 : undefined}
        />
        {unit && <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}
