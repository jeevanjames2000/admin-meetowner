

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A"; // Handle null or undefined
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates
    return date.toISOString().split("T")[0];
  } catch {
    return "Invalid Date"; // Handle parsing errors
  }
};