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
  return navItems
    .filter((item) => {
      if (userType === 1) return true;
      if (userType === 7) return !["Pages", "Packages", "Ads", "Push Notifications", "Maps", "Dynamic Screens"].includes(item.name); // Manager
      if (userType === 8) return !["Pages", "Packages", "Ads", "Maps", "Employees", "Lead Management", "Ads", "Packages", "Push Notifications", "Dynamic Screens"].includes(item.name); // Telecaller
      if (userType === 9) return !["Pages", "Maps", "Employees", "Ads", "Packages", "Push Notifications", "Dynamic Screens"].includes(item.name); // Marketing Executive
      if (userType === 10) return !["Accounts", "Employees", "Pages", "Maps", "Lead Management", "Users", "Ads", "Packages", "Push Notifications", "Dynamic Screens"].includes(item.name); // Customer Support
      return true; // Default: allow all for other user types (e.g., admin)
    })
    .map((item) => {
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