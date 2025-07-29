export type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path?: string;
    pro?: boolean;
    new?: boolean;
    data?: { property_in: string; property_for: string; status: number };
    nestedItems?: {
      name: string;
      path?: string;
      nestedItems?: {
        name: string;
        path: string;
        data?: { property_in: string; property_for: string; status: number };
      }[];
    }[];
  }[];
};

export const filterNavItemsByUserType = (navItems: NavItem[], userType: number | undefined): NavItem[] => {
  const filterAccountsSubItems = (subItems: NavItem["subItems"]) => {
    if (!subItems) return subItems;
    return subItems.filter(subItem => {
      if (subItem.name === "Payment Processing") {
        return userType === 1; 
      }
      return true;
    });
  };

  return navItems
    .filter((item) => {
      
      if (userType === 1) return true; 
      if (userType === 7) return !["Pages", "Packages", "Ads", "Push Notifications", "Maps", "Dynamic Screens","Employees"].includes(item.name); // Manager
      if (userType === 8) return !["Dashboard","Residential Buy","Residential Rent","Commercial Buy","Commercial Rent", "Ads", "Packages"].includes(item.name); // Telecaller
      if (userType === 9) return !["Dashboard","Residential Buy","Residential Rent","Commercial Buy","Commercial Rent","Pages", "Maps", "Employees", "Ads", "Packages", "Push Notifications", "Dynamic Screens"].includes(item.name); // Marketing Executive
      if (userType === 10) return !["Dashboard","Residential Buy","Residential Rent","Commercial Buy","Commercial Rent","Accounts", "Employees", "Pages", "Maps", "Lead Management", "Users", "Ads", "Packages", "Push Notifications", "Dynamic Screens"].includes(item.name); // Customer Support
      if (userType === 11) return !["Dashboard","Residential Buy","Residential Rent","Commercial Buy","Commercial Rent","Accounts", "Employees", "Pages", "Maps", "Lead Management", "Users", "Ads", "Packages", "Push Notifications", "Dynamic Screens"].includes(item.name); // Customer Service
      return true; 
    })
    .map((item) => {
      if (item.name === "Accounts") { 
        return {
          ...item,
          subItems: filterAccountsSubItems(item.subItems),
        };
      }
      if (userType === 8 && item.name === "Accounts") {
        return {
          ...item,
          subItems: item.subItems?.filter((subItem) =>
            ["Payment Failure", "Expiry Soon"].includes(subItem.name)
          ),
        };
      }
      return item;
    });
};