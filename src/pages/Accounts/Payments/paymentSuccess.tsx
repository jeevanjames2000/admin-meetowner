import { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody,TableCell,TableHeader,TableRow, } from "../../../components/ui/table";


// Define the type for the payment success data
interface PaymentSuccessUsers {
  slNo: number;
  name: string;
  mobile: string;
  email: string;
  state: "Telangana" | "Andhra Pradesh" | "Karnataka";
  city: "Bangalore" | "Hyderabad" | "Secunderabad";
  packageName: "Basic" | "Prime" | "Prime Plus";
  startingDate: string;
  endingDate: string;
  amount: number;
  totalAmount: number; // Amount + 15% GST
}

// Generate random data for 10 users
const generateRandomData = (): PaymentSuccessUsers[] => {
  const states: ("Telangana" | "Andhra Pradesh" | "Karnataka")[] = [
    "Telangana",
    "Andhra Pradesh",
    "Karnataka",
  ];
  const cities: ("Bangalore" | "Hyderabad" | "Secunderabad")[] = [
    "Bangalore",
    "Hyderabad",
    "Secunderabad",
  ];
  const packageNames: ("Basic" | "Prime" | "Prime Plus")[] = [
    "Basic",
    "Prime",
    "Prime Plus",
  ];
  const amounts: number[] = [6999, 24999, 49999];
  const names = [
    "Aarav Sharma",
    "Priya Reddy",
    "Vikram Singh",
    "Neha Patel",
    "Rohan Kumar",
    "Sneha Gupta",
    "Kiran Rao",
    "Anjali Nair",
    "Suresh Yadav",
    "Meera Desai",
  ];
  const mobiles = [
    "9123456789",
    "9234567890",
    "9345678901",
    "9456789012",
    "9567890123",
    "9678901234",
    "9789012345",
    "9890123456",
    "9901234567",
    "9012345678",
  ];
  const emails = names.map((name) =>
    `${name.toLowerCase().replace(" ", ".")}@example.com`
  );

  const data: PaymentSuccessUsers[] = [];
  for (let i = 1; i <= 10; i++) {
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const gst = amount * 0.15; // 15% GST
    const totalAmount = amount + gst;

    const startDate = new Date(
      Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)
    ).toLocaleDateString();
    const endDate = new Date(
      new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days later
    ).toLocaleDateString();

    data.push({
      slNo: i,
      name: names[i - 1],
      mobile: mobiles[i - 1],
      email: emails[i - 1],
      state: states[Math.floor(Math.random() * states.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      packageName: packageNames[Math.floor(Math.random() * packageNames.length)],
      startingDate: startDate,
      endingDate: endDate,
      amount,
      totalAmount: Math.round(totalAmount), // Round to avoid decimal precision issues
    });
  }
  return data;
};

const PaymentSuccessUsers: React.FC = () => {
  const [paymentList, setPaymentList] = useState<PaymentSuccessUsers[]>(generateRandomData());
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!paymentList || paymentList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Data Available
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <div>
        <PageMeta
          title="Meet Owner Payments "
          
        />
        <PageBreadcrumb pageTitle="Payment Success Users" pagePlacHolder="Filter payments" />
        <div className="space-y-6">
          <ComponentCard title="Payment Success Users">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Sl. No
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Mobile
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Email
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        State
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        City
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Package Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Starting Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Ending Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Amount
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Total Amount (with 15% GST)
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paymentList.map((payment) => (
                      <TableRow key={payment.slNo}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.slNo}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.mobile}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.email}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.state}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.city}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              payment.packageName === "Basic"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : payment.packageName === "Prime"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200"
                            }`}
                          >
                            {payment.packageName}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.startingDate}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.endingDate}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          ₹{payment.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessUsers;