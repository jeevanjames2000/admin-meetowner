import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router"; // Updated import
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
import PaymentSuccessUsers from "./pages/Accounts/payments/paymentSuccess";

import InvoiceDownload from "./pages/Employee/Invoice";
import BasicTables from "./pages/Tables/BasicTables";
import { ProtectedRouteProps } from "./types/auth";
import { AppDispatch, RootState } from "./store/store";
import { isTokenExpired, logout } from "./store/slices/authSlice";
import BasicTableOne from "./components/tables/BasicTables/BasicTableOne";
import LocationManager from "./pages/maps/locality";

import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { TableLoader } from "./components/Loaders/LoadingLisings";
import ErrorBoundary from "./hooks/ErrorBoundary";
import axiosInstance from "./utils/axiosInstance";
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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  console.log(token)

  const tokenExpired = isTokenExpired(token);

  if (!isAuthenticated || tokenExpired) {
    if (tokenExpired) {
      dispatch(logout());
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const ResidentialTypes = lazy(() => import("./pages/Residential/Buy/ResidentialTypes"));
const CommercialTypes = lazy(() => import("./pages/Commercial/Buy/CommercialType"));

// Simple server status check component
const ServerStatusCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverDown, setServerDown] = useState(false);
  const isMounted = useRef(false); // Track initial API call

  useEffect(() => {
    console.log("ServerStatusCheck useEffect triggered"); // Debug
    const checkServerStatus = async () => {
      try {
        await axiosInstance.get("/user/v1/getAllUsersCount");
        setServerDown(false);
      } catch (error) {
        setServerDown(true);
      }
    };

    if (!isMounted.current) {
      isMounted.current = true;
      console.log("ServerStatusCheck: Calling checkServerStatus"); // Debug
      checkServerStatus();
    }

    const interval = setInterval(checkServerStatus, 100000);
    return () => {
      clearInterval(interval);
      isMounted.current = false; // Reset on unmount
    };
  }, []);

  if (serverDown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Server Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our servers are currently down. Please try again later.
          </p>
          <button
            className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <ServerStatusCheck>
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
              {/* Residential Listings */}
              <Route
                path="/residential/:property_for/:status"
                element={
                  <Suspense
                    fallback={
                      <TableLoader title="Loading Residential Listings" hasActions={true} />
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
              {/* Commercial Listings */}
              <Route
                path="/commercial/:property_for/:status"
                element={
                  <Suspense
                    fallback={
                      <TableLoader title="Loading Commercial Listings" hasActions={true} />
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
              {/* Other Pages */}
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
                      <PaymentSuccessUsers />
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
                      <InvoiceDownload />
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
                path="/adds/all-ads"
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
                path="/packages/:status"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PackagesScren />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
            </Route>
            
        

            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ServerStatusCheck>
       
      </Router>
    </>
  );
}