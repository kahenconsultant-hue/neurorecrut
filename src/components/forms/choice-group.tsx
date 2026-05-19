type ChoiceGroupProps = {
  name: string;
  label: string;
  options: readonly string[];
  hint?: string;
  defaultValue?: string | null;
  defaultFirst?: boolean;
  columns?: "one" | "two";
};

function selectedOption(defaultValue: string, option: string) {
  return defaultValue
    .split("\n")
    .map((line) => line.trim())
    .includes(option);
}

function customDefault(defaultValue: string, options: readonly string[]) {
  return defaultValue
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !options.includes(line))
    .join("\n");
}

export function ChoiceGroup({ name, label, options, hint, defaultValue, defaultFirst = false, columns = "two" }: ChoiceGroupProps) {
  const currentValue = String(defaultValue ?? "");
  const hasCurrentChoice = options.some((option) => selectedOption(currentValue, option));
  const customValue = customDefault(currentValue, options);

  return (
    <fieldset className="rounded-lg border border-line bg-white p-4 md:col-span-2">
      <legend className="px-1 text-sm font-semibold text-ink">{label}</legend>
      {hint ? <p className="mb-3 mt-1 text-sm text-gray-600">{hint}</p> : null}
      <div className={columns === "two" ? "grid gap-3 md:grid-cols-2" : "grid gap-3"}>
        {options.map((option, index) => (
          <label key={option} className="flex gap-3 rounded-md border border-line bg-gray-50 p-3 text-sm leading-6 text-gray-800">
            <input
              className="mt-1 h-4 w-4 shrink-0 accent-ink"
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selectedOption(currentValue, option) || (!currentValue && defaultFirst && index === 0) || (!!currentValue && !hasCurrentChoice && defaultFirst && index === 0)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <div className="mt-3">
        <label className="label" htmlFor={`${name}Other`}>
          Précision libre si nécessaire
        </label>
        <textarea
          className="field min-h-20"
          id={`${name}Other`}
          name={`${name}Other`}
          defaultValue={customValue}
          placeholder="Ajoutez un contexte spécifique, un exemple réel ou une nuance importante."
        />
      </div>
    </fieldset>
  );
}
