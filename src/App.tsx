import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AboutUsPage from "./pages/Forms/AboutUs";
import ServicesPage from "./pages/Forms/Services";
import PropertyLeads from "./pages/LeadManagement/Leads";
import ResidentialBuyEdit from "./pages/Residential/Buy/ResidentialBuyEdit";
import ResidentialRentEdit from "./pages/Residential/Rent/ResidentialRentEdit";
import CareersPage from "./pages/Forms/Careers";
import TermsPage from "./pages/Forms/Terms";
import PrivacyPage from "./pages/Forms/privacy";
import CommercialBuyEdit from "./pages/Commercial/Buy/CommercialBuyEdit";
import CommercialRentEdit from "./pages/Commercial/Rent/CommercialRentEdit";
import CreateEmployee from "./pages/Employee/CreateEmployee";
import AllEmployees from "./pages/Employee/AllEmployees";
import PaymentStatusScreen from "./pages/Accounts/payments/paymentStatusScreen";
import BasicTables from "./pages/Tables/BasicTables";
import { ProtectedRouteProps } from "./types/auth";
import { AppDispatch, RootState } from "./store/store";
import { isTokenExpired, logout } from "./store/slices/authSlice";
import BasicTableOne from "./components/tables/BasicTables/BasicTableOne";
import LocationManager from "./pages/maps/locality";
import { lazy, Suspense, useEffect, useState } from "react";
import { TableLoader } from "./components/Loaders/LoadingLisings";
import ErrorBoundary from "./hooks/ErrorBoundary";
import EditEmployee from "./pages/Employee/EditEmployee";
import HomeFooter from "./pages/Forms/HomeFooter";
import CreateUser from "./pages/users/CreateUsers";
import AllAdsPage from "./pages/Ads/AllAds";
import CreateAds from "./pages/Ads/CreateAds";
import GeneratePayments from "./pages/Accounts/GeneratePayments";
import CitiesManager from "./pages/maps/cities";
import StatesManager from "./pages/maps/state";
import UserActivities from "./components/tables/userActivities";
import CreateProperty from "./pages/Project/AddProject";
import AllPlaces from "./pages/maps/allPlaces";
import Notify from "./pages/Notify/notify";
import AllProjects from "./pages/Project/AllProjects";
import PropertyDetailsByUserId from "./components/tables/BasicTables/PropertyDetailsByuserId";
import AllUsers from "./pages/users/AllUsers";
import EditUserDetails from "./components/tables/BasicTables/EditUserDetails";
import CreateNewUser from "./pages/Accounts/CreateNewUser";
import PackagesScren from "./pages/packages/PackagesScreen";
import AddCareer from "./pages/Forms/AddCareer";
import AllNotifications from "./pages/Notify/AllNotifications";
import AllShorts from "./pages/Shorts/AllShorts";
import CreateShorts from "./pages/Shorts/CreateShorts";
import { Invoice } from "./pages/Accounts/Invoice";
import ServerStatusCheck from "./hooks/ServerStatusCheck";
import ExpiryPayments from "./pages/Accounts/ExpiryPayments";
import CustomPackages from "./pages/packages/CreateCustomPackages";
import AllCustomPackages from "./pages/packages/AllCustomPackages";
import UserCustomPackage from "./pages/packages/UserCustomPackage";
import BuyersActivities from "./components/tables/buyersActivities";
import AssignEmployees from "./pages/Employee/AssignEmployees";
import BasicTableEmployees from "./components/tables/BasicTables/BasicTableEmployess";
import ContactedLeads from "./pages/LeadManagement/ContactedLeads";
import MostViewedLeads from "./pages/LeadManagement/MostViewedLeads";
import MostViewedDetailsPage from "./pages/LeadManagement/MostViewedLeadsDetails";
import MostSearchedLocations from "./pages/LeadManagement/MostSearchedLocations";
import MostSearchedDetail from "./pages/LeadManagement/MostSearchedDetails";
import ActiveUsersTable from "./components/ecommerce/ActiveUsersTable";
import { Toaster } from "react-hot-toast";
import UserHistory from "./components/tables/userHistory";

import { disconnectSocket, initSocket } from "./utils/socketService";
import PropertyLinks from "./pages/Forms/PropertyLinks";
import VerifyUserProfile from "./components/tables/BasicTables/VerifyUserProfile";
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );
  const userType = user?.user_type;
  const tokenExpired = isTokenExpired(token);
  if (!isAuthenticated || tokenExpired) {
    if (tokenExpired) {
      dispatch(logout());
    }
    return <Navigate to="/signin" replace />;
  }
  return children;
};
const ResidentialTypes = lazy(
  () => import("./pages/Residential/Buy/ResidentialTypes")
);
const CommercialTypes = lazy(
  () => import("./pages/Commercial/Buy/CommercialType")
);
export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    let socket: ReturnType<typeof initSocket> | null = null;
    if (isAuthenticated) {
      socket = initSocket(dispatch, isAuthenticated);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      disconnectSocket();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Router>
        <ScrollToTop />
        <ServerStatusCheck isOnline={isOnline}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                index
                path="/"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                index
                path="/activeusers"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ActiveUsersTable />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/basic-tables"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BasicTables />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/basic-tables-one"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BasicTableOne />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/basic-tables-employees"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BasicTableEmployees />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/edit-user-details"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <EditUserDetails />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/verify-user-profile"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <VerifyUserProfile />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/user/propertyDetails"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PropertyDetailsByUserId />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/user-activities"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <UserActivities />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/user-subscriptions"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <UserHistory />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/buyers-activities"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BuyersActivities />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              {}
              <Route
                path="/residential/:property_for/:status"
                element={
                  <Suspense
                    fallback={
                      <TableLoader
                        title="Loading Residential Listings"
                        hasActions={true}
                      />
                    }
                  >
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ResidentialTypes />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              {}
              <Route
                path="/commercial/:property_for/:status"
                element={
                  <Suspense
                    fallback={
                      <TableLoader
                        title="Loading Commercial Listings"
                        hasActions={true}
                      />
                    }
                  >
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <CommercialTypes />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/residential-buy-edit"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ResidentialBuyEdit />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/residential-rent-edit"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ResidentialRentEdit />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/commercial-buy-edit"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CommercialBuyEdit />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/commercial-rent-edit"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CommercialRentEdit />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              {}
              <Route
                path="/profile"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <UserProfiles />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/leads/:property_for/:status"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PropertyLeads />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/leads/contacted"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ContactedLeads />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/leads/mostviewed"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <MostViewedLeads />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/leads/mostsearched"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <MostSearchedLocations />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/leads/most-searched-details/:city"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <MostSearchedDetail />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/leads/most-viewed-details/:property_id"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <MostViewedDetailsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/form-elements"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <FormElements />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/about-us"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AboutUsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/propertylinks"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PropertyLinks />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/services"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ServicesPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/careers"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CareersPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/careers/create-career"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AddCareer />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/careers/edit/:id"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AddCareer />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/terms"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <TermsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/privacy"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PrivacyPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/home-footer"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <HomeFooter />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/accounts/generate-payment-links"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <GeneratePayments />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/accounts/expiry-payments"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ExpiryPayments />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/accounts/create-new-user"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CreateNewUser />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/payments/:status"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PaymentStatusScreen />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/create-employee"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CreateEmployee />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/create-user"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CreateUser />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/all-users"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllUsers />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/projects/add-projects"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CreateProperty />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/projects/all-projects"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllProjects />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/all-employees"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllEmployees />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/assignedemployees/:id"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AssignEmployees />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/all-employees/edit-employee"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <EditEmployee />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/invoice"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Invoice />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/maps/cities"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CitiesManager />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/maps/allPlaces"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllPlaces />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/maps/states"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <StatesManager />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/maps/locality"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <LocationManager />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/adds/:status"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllAdsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/adds/upload-ads"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CreateAds />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="notification/notify"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Notify />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="notifications/all"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllNotifications />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/packages/:status"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PackagesScren />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/custompackages"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CustomPackages />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/allcustompackages"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllCustomPackages />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/packages/custom/:userId"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <UserCustomPackage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="Shorts/all"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <AllShorts />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="Shorts/Create"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <CreateShorts />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
            </Route>

            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000, style: { zIndex: 9999 } }}
            containerStyle={{ top: "5rem" }}
          />
        </ServerStatusCheck>
      </Router>
    </>
  );
}
