import React, { useCallback } from "react";
import DatePicker from "../form/date-picker";
import Button from "../ui/button/Button";
import { toast } from "react-hot-toast";
interface DateFilterProps {
  fromDate?: string | null;
  toDate?: string | null;
  onFromDateChange?: (date: string | null) => void;
  onToDateChange?: (date: string | null) => void;
  onClear?: () => void;
  className?: string;
}
const DateFilter: React.FC<DateFilterProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  className = "",
}) => {
  const handleFromDateChange = useCallback(
    (selectedDates: Date[]) => {
      const dateObj = selectedDates[0];
      let date = null;
      if (dateObj) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        date = `${year}-${month}-${day}`;
      }
      onFromDateChange?.(date);
    },
    [onFromDateChange]
  );
  const handleToDateChange = useCallback(
    (selectedDates: Date[]) => {
      const dateObj = selectedDates[0];
      let date = null;
      if (dateObj) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        date = `${year}-${month}-${day}`;
        if (fromDate && date < fromDate) {
          toast.error("End date cannot be before start date", {
            position: "top-right",
            duration: 3000,
          });
          return;
        }
      }
      onToDateChange?.(date);
    },
    [fromDate, onToDateChange]
  );
  const handleClear = () => {
    onClear?.();
  };
  return (
    <div className={`flex flex-col sm:flex-row gap-3 py-2 w-full ${className}`}>
      <DatePicker
        id="fromDate"
        placeholder="Select start date"
        onChange={handleFromDateChange}
        defaultDate={fromDate ? new Date(fromDate) : undefined}
      />
      <DatePicker
        id="toDate"
        placeholder="Select end date"
        onChange={handleToDateChange}
        defaultDate={toDate ? new Date(toDate) : undefined}
      />
      <Button
        variant="outline"
        onClick={handleClear}
        className="px-3 py-1 w-full sm:w-auto"
      >
        Clear
      </Button>
    </div>
  );
};
export default DateFilter;
