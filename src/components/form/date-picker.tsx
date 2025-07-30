import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};
export default function DatePicker({
  id,
  mode = "single",
  onChange,
  defaultDate,
  label,
  placeholder,
}: PropsType) {
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!flatpickrRef.current) {
      flatpickrRef.current = flatpickr(inputRef.current!, {
        mode,
        static: true,
        monthSelectorType: "static",
        dateFormat: "Y-m-d",
        defaultDate,
        onChange,
      });
    }
    if (flatpickrRef.current) {
      if (defaultDate) {
        flatpickrRef.current.setDate(defaultDate, false);
      } else {
        flatpickrRef.current.clear(false);
      }
      flatpickrRef.current.config.onChange = Array.isArray(onChange)
        ? onChange
        : onChange
        ? [onChange]
        : [];
    }
    return () => {
      if (flatpickrRef.current) {
        flatpickrRef.current.destroy();
        flatpickrRef.current = null;
      }
    };
  }, [mode, id, defaultDate, onChange]);
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
