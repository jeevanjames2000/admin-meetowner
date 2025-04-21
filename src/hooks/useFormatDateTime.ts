
const useFormatDateTime = () => {
    const formatDateTime = (date: string | undefined, time: string | undefined): string => {
      if (!date || !time) return "N/A";
  
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes, seconds] = time.split(":").map(Number);
      const dateTime = new Date(year, month - 1, day, hours, minutes, seconds);
  
      const formattedDay = String(dateTime.getDate()).padStart(2, "0");
      const formattedMonth = String(dateTime.getMonth() + 1).padStart(2, "0");
      const formattedYear = dateTime.getFullYear();
  
      let formattedHours = dateTime.getHours();
      const formattedMinutes = String(dateTime.getMinutes()).padStart(2, "0");
      const ampm = formattedHours >= 12 ? "PM" : "AM";
      formattedHours = formattedHours % 12 || 12;
  
      const formattedTime = `${String(formattedHours).padStart(2, "0")}:${formattedMinutes} ${ampm}`;
      return `${formattedDay}-${formattedMonth}-${formattedYear} ${formattedTime}`;
    };
  
    return { formatDateTime };
  };
  
  export default useFormatDateTime;