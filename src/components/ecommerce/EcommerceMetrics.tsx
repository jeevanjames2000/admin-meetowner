import { useNavigate } from "react-router";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

// Define the type for a member with additional fields
interface Member {
  slNo: number;
  name: string;
  mobileNumber: string;
  email: string;
  since: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string; // Optional for Users
  reraNumber?: string; // Optional for Users and Owners
}

// Define the type for the category data
interface CategoryData {
  label: string;
  count: number;
  percentage: number;
  trend: "up" | "down";
  members: Member[];
}

// Sample data for each category (10 members each)
const users: Member[] = [
  { slNo: 1, name: "John Doe", mobileNumber: "9123456780", email: "john.doe@example.com", since: "2023-01-15", address: "123 Main St", city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { slNo: 2, name: "Jane Smith", mobileNumber: "9234567890", email: "jane.smith@example.com", since: "2023-02-20", address: "456 Oak Ave", city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { slNo: 3, name: "Alice Johnson", mobileNumber: "9345678901", email: "alice.j@example.com", since: "2023-03-10", address: "789 Pine Rd", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { slNo: 4, name: "Bob Brown", mobileNumber: "9456789012", email: "bob.brown@example.com", since: "2023-04-05", address: "101 Maple Dr", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { slNo: 5, name: "Emma Davis", mobileNumber: "9567890123", email: "emma.davis@example.com", since: "2023-05-12", address: "202 Birch Ln", city: "Delhi", state: "Delhi", pincode: "110001" },
  { slNo: 6, name: "Michael Wilson", mobileNumber: "9678901234", email: "michael.w@example.com", since: "2023-06-18", address: "303 Cedar St", city: "Pune", state: "Maharashtra", pincode: "411001" },
  { slNo: 7, name: "Sarah Taylor", mobileNumber: "9789012345", email: "sarah.t@example.com", since: "2023-07-22", address: "404 Elm Ave", city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { slNo: 8, name: "David Lee", mobileNumber: "9890123456", email: "david.lee@example.com", since: "2023-08-30", address: "505 Spruce Rd", city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { slNo: 9, name: "Laura Adams", mobileNumber: "9901234567", email: "laura.adams@example.com", since: "2023-09-15", address: "606 Willow Dr", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { slNo: 10, name: "Chris Evans", mobileNumber: "9012345678", email: "chris.evans@example.com", since: "2023-10-01", address: "707 Ash Ln", city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
];

const channelPartners: Member[] = [
  { slNo: 1, name: "Partner A", mobileNumber: "9123456781", email: "partner.a@example.com", since: "2022-11-10", address: "111 Partner St", city: "Hyderabad", state: "Telangana", pincode: "500002", gstNumber: "GSTIN1234567890", reraNumber: "RERA12345" },
  { slNo: 2, name: "Partner B", mobileNumber: "9234567891", email: "partner.b@example.com", since: "2022-12-15", address: "222 Partner Ave", city: "Bangalore", state: "Karnataka", pincode: "560002", gstNumber: "GSTIN2345678901", reraNumber: "RERA23456" },
  { slNo: 3, name: "Partner C", mobileNumber: "9345678902", email: "partner.c@example.com", since: "2023-01-20", address: "333 Partner Rd", city: "Chennai", state: "Tamil Nadu", pincode: "600002", gstNumber: "GSTIN3456789012", reraNumber: "RERA34567" },
  { slNo: 4, name: "Partner D", mobileNumber: "9456789013", email: "partner.d@example.com", since: "2023-02-25", address: "444 Partner Dr", city: "Mumbai", state: "Maharashtra", pincode: "400002", gstNumber: "GSTIN4567890123", reraNumber: "RERA45678" },
  { slNo: 5, name: "Partner E", mobileNumber: "9567890124", email: "partner.e@example.com", since: "2023-03-30", address: "555 Partner Ln", city: "Delhi", state: "Delhi", pincode: "110002", gstNumber: "GSTIN5678901234", reraNumber: "RERA56789" },
  { slNo: 6, name: "Partner F", mobileNumber: "9678901235", email: "partner.f@example.com", since: "2023-04-05", address: "666 Partner St", city: "Pune", state: "Maharashtra", pincode: "411002", gstNumber: "GSTIN6789012345", reraNumber: "RERA67890" },
  { slNo: 7, name: "Partner G", mobileNumber: "9789012346", email: "partner.g@example.com", since: "2023-05-10", address: "777 Partner Ave", city: "Kolkata", state: "West Bengal", pincode: "700002", gstNumber: "GSTIN7890123456", reraNumber: "RERA78901" },
  { slNo: 8, name: "Partner H", mobileNumber: "9890123457", email: "partner.h@example.com", since: "2023-06-15", address: "888 Partner Rd", city: "Ahmedabad", state: "Gujarat", pincode: "380002", gstNumber: "GSTIN8901234567", reraNumber: "RERA89012" },
  { slNo: 9, name: "Partner I", mobileNumber: "9901234568", email: "partner.i@example.com", since: "2023-07-20", address: "999 Partner Dr", city: "Jaipur", state: "Rajasthan", pincode: "302002", gstNumber: "GSTIN9012345678", reraNumber: "RERA90123" },
  { slNo: 10, name: "Partner J", mobileNumber: "9012345679", email: "partner.j@example.com", since: "2023-08-25", address: "1010 Partner Ln", city: "Lucknow", state: "Uttar Pradesh", pincode: "226002", gstNumber: "GSTIN0123456789", reraNumber: "RERA01234" },
];

const agents: Member[] = [
  { slNo: 1, name: "Agent A", mobileNumber: "9123456782", email: "agent.a@example.com", since: "2022-10-01", address: "111 Agent St", city: "Hyderabad", state: "Telangana", pincode: "500003", gstNumber: "GSTIN1234567891", reraNumber: "RERA12346" },
  { slNo: 2, name: "Agent B", mobileNumber: "9234567892", email: "agent.b@example.com", since: "2022-11-05", address: "222 Agent Ave", city: "Bangalore", state: "Karnataka", pincode: "560003", gstNumber: "GSTIN2345678902", reraNumber: "RERA23457" },
  { slNo: 3, name: "Agent C", mobileNumber: "9345678903", email: "agent.c@example.com", since: "2022-12-10", address: "333 Agent Rd", city: "Chennai", state: "Tamil Nadu", pincode: "600003", gstNumber: "GSTIN3456789013", reraNumber: "RERA34568" },
  { slNo: 4, name: "Agent D", mobileNumber: "9456789014", email: "agent.d@example.com", since: "2023-01-15", address: "444 Agent Dr", city: "Mumbai", state: "Maharashtra", pincode: "400003", gstNumber: "GSTIN4567890124", reraNumber: "RERA45679" },
  { slNo: 5, name: "Agent E", mobileNumber: "9567890125", email: "agent.e@example.com", since: "2023-02-20", address: "555 Agent Ln", city: "Delhi", state: "Delhi", pincode: "110003", gstNumber: "GSTIN5678901235", reraNumber: "RERA56790" },
  { slNo: 6, name: "Agent F", mobileNumber: "9678901236", email: "agent.f@example.com", since: "2023-03-25", address: "666 Agent St", city: "Pune", state: "Maharashtra", pincode: "411003", gstNumber: "GSTIN6789012346", reraNumber: "RERA67891" },
  { slNo: 7, name: "Agent G", mobileNumber: "9789012347", email: "agent.g@example.com", since: "2023-04-30", address: "777 Agent Ave", city: "Kolkata", state: "West Bengal", pincode: "700003", gstNumber: "GSTIN7890123457", reraNumber: "RERA78902" },
  { slNo: 8, name: "Agent H", mobileNumber: "9890123458", email: "agent.h@example.com", since: "2023-05-05", address: "888 Agent Rd", city: "Ahmedabad", state: "Gujarat", pincode: "380003", gstNumber: "GSTIN8901234568", reraNumber: "RERA89013" },
  { slNo: 9, name: "Agent I", mobileNumber: "9901234569", email: "agent.i@example.com", since: "2023-06-10", address: "999 Agent Dr", city: "Jaipur", state: "Rajasthan", pincode: "302003", gstNumber: "GSTIN9012345679", reraNumber: "RERA90124" },
  { slNo: 10, name: "Agent J", mobileNumber: "9012345680", email: "agent.j@example.com", since: "2023-07-15", address: "1010 Agent Ln", city: "Lucknow", state: "Uttar Pradesh", pincode: "226003", gstNumber: "GSTIN0123456790", reraNumber: "RERA01235" },
];

const owners: Member[] = [
  { slNo: 1, name: "Owner A", mobileNumber: "9123456783", email: "owner.a@example.com", since: "2022-09-01", address: "111 Owner St", city: "Hyderabad", state: "Telangana", pincode: "500004", gstNumber: "GSTIN1234567892" },
  { slNo: 2, name: "Owner B", mobileNumber: "9234567893", email: "owner.b@example.com", since: "2022-10-05", address: "222 Owner Ave", city: "Bangalore", state: "Karnataka", pincode: "560004", gstNumber: "GSTIN2345678903" },
  { slNo: 3, name: "Owner C", mobileNumber: "9345678904", email: "owner.c@example.com", since: "2022-11-10", address: "333 Owner Rd", city: "Chennai", state: "Tamil Nadu", pincode: "600004", gstNumber: "GSTIN3456789014" },
  { slNo: 4, name: "Owner D", mobileNumber: "9456789015", email: "owner.d@example.com", since: "2022-12-15", address: "444 Owner Dr", city: "Mumbai", state: "Maharashtra", pincode: "400004", gstNumber: "GSTIN4567890125" },
  { slNo: 5, name: "Owner E", mobileNumber: "9567890126", email: "owner.e@example.com", since: "2023-01-20", address: "555 Owner Ln", city: "Delhi", state: "Delhi", pincode: "110004", gstNumber: "GSTIN5678901236" },
  { slNo: 6, name: "Owner F", mobileNumber: "9678901237", email: "owner.f@example.com", since: "2023-02-25", address: "666 Owner St", city: "Pune", state: "Maharashtra", pincode: "411004", gstNumber: "GSTIN6789012347" },
  { slNo: 7, name: "Owner G", mobileNumber: "9789012348", email: "owner.g@example.com", since: "2023-03-30", address: "777 Owner Ave", city: "Kolkata", state: "West Bengal", pincode: "700004", gstNumber: "GSTIN7890123458" },
  { slNo: 8, name: "Owner H", mobileNumber: "9890123459", email: "owner.h@example.com", since: "2023-04-05", address: "888 Owner Rd", city: "Ahmedabad", state: "Gujarat", pincode: "380004", gstNumber: "GSTIN8901234569" },
  { slNo: 9, name: "Owner I", mobileNumber: "9901234570", email: "owner.i@example.com", since: "2023-05-10", address: "999 Owner Dr", city: "Jaipur", state: "Rajasthan", pincode: "302004", gstNumber: "GSTIN9012345680" },
  { slNo: 10, name: "Owner J", mobileNumber: "9012345681", email: "owner.j@example.com", since: "2023-06-15", address: "1010 Owner Ln", city: "Lucknow", state: "Uttar Pradesh", pincode: "226004", gstNumber: "GSTIN0123456791" },
];

const builders: Member[] = [
  { slNo: 1, name: "Builder A", mobileNumber: "9123456784", email: "builder.a@example.com", since: "2022-08-01", address: "111 Builder St", city: "Hyderabad", state: "Telangana", pincode: "500005", gstNumber: "GSTIN1234567893", reraNumber: "RERA12347" },
  { slNo: 2, name: "Builder B", mobileNumber: "9234567894", email: "builder.b@example.com", since: "2022-09-05", address: "222 Builder Ave", city: "Bangalore", state: "Karnataka", pincode: "560005", gstNumber: "GSTIN2345678904", reraNumber: "RERA23458" },
  { slNo: 3, name: "Builder C", mobileNumber: "9345678905", email: "builder.c@example.com", since: "2022-10-10", address: "333 Builder Rd", city: "Chennai", state: "Tamil Nadu", pincode: "600005", gstNumber: "GSTIN3456789015", reraNumber: "RERA34569" },
  { slNo: 4, name: "Builder D", mobileNumber: "9456789016", email: "builder.d@example.com", since: "2022-11-15", address: "444 Builder Dr", city: "Mumbai", state: "Maharashtra", pincode: "400005", gstNumber: "GSTIN4567890126", reraNumber: "RERA45680" },
  { slNo: 5, name: "Builder E", mobileNumber: "9567890127", email: "builder.e@example.com", since: "2022-12-20", address: "555 Builder Ln", city: "Delhi", state: "Delhi", pincode: "110005", gstNumber: "GSTIN5678901237", reraNumber: "RERA56791" },
  { slNo: 6, name: "Builder F", mobileNumber: "9678901238", email: "builder.f@example.com", since: "2023-01-25", address: "666 Builder St", city: "Pune", state: "Maharashtra", pincode: "411005", gstNumber: "GSTIN6789012348", reraNumber: "RERA67892" },
  { slNo: 7, name: "Builder G", mobileNumber: "9789012349", email: "builder.g@example.com", since: "2023-02-28", address: "777 Builder Ave", city: "Kolkata", state: "West Bengal", pincode: "700005", gstNumber: "GSTIN7890123459", reraNumber: "RERA78903" },
  { slNo: 8, name: "Builder H", mobileNumber: "9890123460", email: "builder.h@example.com", since: "2023-03-05", address: "888 Builder Rd", city: "Ahmedabad", state: "Gujarat", pincode: "380005", gstNumber: "GSTIN8901234570", reraNumber: "RERA89014" },
  { slNo: 9, name: "Builder I", mobileNumber: "9901234571", email: "builder.i@example.com", since: "2023-04-10", address: "999 Builder Dr", city: "Jaipur", state: "Rajasthan", pincode: "302005", gstNumber: "GSTIN9012345681", reraNumber: "RERA90125" },
  { slNo: 10, name: "Builder J", mobileNumber: "9012345682", email: "builder.j@example.com", since: "2023-05-15", address: "1010 Builder Ln", city: "Lucknow", state: "Uttar Pradesh", pincode: "226005", gstNumber: "GSTIN0123456792", reraNumber: "RERA01236" },
];

const leads: Member[] = [
  { slNo: 1, name: "Lead A", mobileNumber: "9123456785", email: "lead.a@example.com", since: "2023-01-01", address: "111 Lead St", city: "Hyderabad", state: "Telangana", pincode: "500006", gstNumber: "GSTIN1234567894", reraNumber: "RERA12348" },
  { slNo: 2, name: "Lead B", mobileNumber: "9234567895", email: "lead.b@example.com", since: "2023-02-05", address: "222 Lead Ave", city: "Bangalore", state: "Karnataka", pincode: "560006", gstNumber: "GSTIN2345678905", reraNumber: "RERA23459" },
  { slNo: 3, name: "Lead C", mobileNumber: "9345678906", email: "lead.c@example.com", since: "2023-03-10", address: "333 Lead Rd", city: "Chennai", state: "Tamil Nadu", pincode: "600006", gstNumber: "GSTIN3456789016", reraNumber: "RERA34570" },
  { slNo: 4, name: "Lead D", mobileNumber: "9456789017", email: "lead.d@example.com", since: "2023-04-15", address: "444 Lead Dr", city: "Mumbai", state: "Maharashtra", pincode: "400006", gstNumber: "GSTIN4567890127", reraNumber: "RERA45681" },
  { slNo: 5, name: "Lead E", mobileNumber: "9567890128", email: "lead.e@example.com", since: "2023-05-20", address: "555 Lead Ln", city: "Delhi", state: "Delhi", pincode: "110006", gstNumber: "GSTIN5678901238", reraNumber: "RERA56792" },
  { slNo: 6, name: "Lead F", mobileNumber: "9678901239", email: "lead.f@example.com", since: "2023-06-25", address: "666 Lead St", city: "Pune", state: "Maharashtra", pincode: "411006", gstNumber: "GSTIN6789012349", reraNumber: "RERA67893" },
  { slNo: 7, name: "Lead G", mobileNumber: "9789012350", email: "lead.g@example.com", since: "2023-07-30", address: "777 Lead Ave", city: "Kolkata", state: "West Bengal", pincode: "700006", gstNumber: "GSTIN7890123460", reraNumber: "RERA78904" },
  { slNo: 8, name: "Lead H", mobileNumber: "9890123461", email: "lead.h@example.com", since: "2023-08-05", address: "888 Lead Rd", city: "Ahmedabad", state: "Gujarat", pincode: "380006", gstNumber: "GSTIN8901234571", reraNumber: "RERA89015" },
  { slNo: 9, name: "Lead I", mobileNumber: "9901234572", email: "lead.i@example.com", since: "2023-09-10", address: "999 Lead Dr", city: "Jaipur", state: "Rajasthan", pincode: "302006", gstNumber: "GSTIN9012345682", reraNumber: "RERA90126" },
  { slNo: 10, name: "Lead J", mobileNumber: "9012345683", email: "lead.j@example.com", since: "2023-10-15", address: "1010 Lead Ln", city: "Lucknow", state: "Uttar Pradesh", pincode: "226006", gstNumber: "GSTIN0123456793", reraNumber: "RERA01237" },
];

// Define the categories with their data
const categories: CategoryData[] = [
  { label: "Users", count: 3782, percentage: 11.01, trend: "up", members: users },
  { label: "Channel Partners", count: 5359, percentage: 9.05, trend: "down", members: channelPartners },
  { label: "Agents", count: 45230, percentage: 5.25, trend: "up", members: agents },
  { label: "Owners", count: 124, percentage: 2.15, trend: "down", members: owners },
  { label: "Builders", count: 124, percentage: 2.15, trend: "down", members: builders },
  { label: "Leads", count: 124, percentage: 2.15, trend: "down", members: leads },
];

const EcommerceMetrics: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (category: CategoryData) => {
    navigate("/basic-tables", { state: { categoryLabel: category.label, members: category.members } });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category, index) => (
        <div
          key={category.label}
          onClick={() => handleCardClick(category)}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {index % 2 === 0 ? (
              <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
            ) : (
              <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
            )}
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {category.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {category.count.toLocaleString()}
              </h4>
            </div>
            <Badge color={category.trend === "up" ? "success" : "error"}>
              {category.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {category.percentage}%
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EcommerceMetrics;