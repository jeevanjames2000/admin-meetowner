import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useSelector } from "react-redux";
import { ReactNode } from "react";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";

import Calendar from "./pages/Calendar";

import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AboutUsPage from "./pages/Forms/AboutUs";
import ServicesPage from "./pages/Forms/Services";
import PropertyLeadsBuy from "./pages/LeadManagement/LeadBuy";
import ResidentialBuyReview from "./pages/Residential/Buy/ResidentialBuyReview";
import ResidentialRentReview from "./pages/Residential/Rent/ResidentialRentReview";
import ResidentialBuyEdit from "./pages/Residential/Buy/ResidentialBuyEdit";
import ResidentialRentEdit from "./pages/Residential/Rent/ResidentialRentEdit";
import CareersPage from "./pages/Forms/Careers";
import TermsPage from "./pages/Forms/Terms";
import PrivacyPage from "./pages/Forms/privacy";
import CommercialBuyReview from "./pages/Commercial/Buy/CommercialBuyReview";
import CommercialRentReview from "./pages/Commercial/Rent/CommercialRentReview";
import CommercialBuyEdit from "./pages/Commercial/Buy/CommercialBuyEdit";
import CommercialRentEdit from "./pages/Commercial/Rent/CommercialRentEdit";
import CreateEmployee from "./pages/Employee/CreateEmployee";
import AllEmployees from "./pages/Employee/AllEmployees";
import PaymentSuccessUsers from "./pages/Accounts/Users/paymentSuccess";
import PaymentSuccessAgents from "./pages/Accounts/Agents/PaymentSuccess";
import InvoiceDownload from "./pages/Employee/Invoice";
import ResidentialBuyApprove from "./pages/Residential/Buy/ResidentialBuyApprove";

// Define the shape of your Redux state
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

// Define props interface for ProtectedRoute
interface ProtectedRouteProps {
  children: ReactNode;
}

// Fix the ProtectedRoute component typing
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route
              index
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* listing pages */}
            {/* residential */}
            <Route
              path="/resendetial-buy"
              element={
                <ProtectedRoute>
                  <ResidentialBuyReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resendetial-rent"
              element={
                <ProtectedRoute>
                  <ResidentialRentReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="residential-buy-edit"
              element={
                <ProtectedRoute>
                  <ResidentialBuyEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="residential-buy-approve"
              element={
                <ProtectedRoute>
                  <ResidentialBuyApprove />
                </ProtectedRoute>
              }
            />

            <Route
              path="residential-rent-edit"
              element={
                <ProtectedRoute>
                  <ResidentialRentEdit />
                </ProtectedRoute>
              }
            />
            {/* commercial */}
            <Route
              path="/commercial-buy"
              element={
                <ProtectedRoute>
                  <CommercialBuyReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commercial-rent"
              element={
                <ProtectedRoute>
                  <CommercialRentReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commercial-buy-edit"
              element={
                <ProtectedRoute>
                  <CommercialBuyEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commercial-rent-edit"
              element={
                <ProtectedRoute>
                  <CommercialRentEdit />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blank"
              element={
                <ProtectedRoute>
                  <Blank />
                </ProtectedRoute>
              }
            />

            {/* Lead Management */}
            <Route
              path="/lead-buy"
              element={
                <ProtectedRoute>
                  <PropertyLeadsBuy />
                </ProtectedRoute>
              }
            />

            {/* Forms */}
            <Route
              path="/form-elements"
              element={
                <ProtectedRoute>
                  <FormElements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about-us"
              element={
                <ProtectedRoute>
                  <AboutUsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/careers"
              element={
                <ProtectedRoute>
                  <CareersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/terms"
              element={
                <ProtectedRoute>
                  <TermsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <ProtectedRoute>
                  <PrivacyPage />
                </ProtectedRoute>
              }
            />

            {/* users */}
            <Route
              path="/users/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessUsers />
                </ProtectedRoute>
              }
            />
            {/* agents */}
            <Route
              path="/agents/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessAgents />
                </ProtectedRoute>
              }
            />

            {/* Employee details */}
            <Route
              path="/create-employee"
              element={
                <ProtectedRoute>
                  <CreateEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-employees"
              element={
                <ProtectedRoute>
                  <AllEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice"
              element={
                <ProtectedRoute>
                  <InvoiceDownload />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Layout - Keep these public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route - Keep this public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}