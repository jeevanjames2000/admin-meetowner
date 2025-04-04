import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router";
import { loginUser } from "../../store/slices/authSlice";
import { RootState, AppDispatch } from "../../store/store";

export default function SignInForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    mobile: "",
    password: "",
  });

  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
   
    if (errors[name as keyof typeof errors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    let newErrors = { mobile: "", password: "" };
    let hasError = false;

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      hasError = true;
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const resultAction = await dispatch(
        loginUser({
          mobile: formData.mobile,
          password: formData.password,
        })
      ).unwrap();

      navigate("/");
    } catch (err: any) {
      // Check if the error is due to server unavailability
      if (err.message === "Network Error" || err.code === "ECONNABORTED") {
        // Server is down, redirect to signup page
        navigate("/signup", {
          state: { message: "Server is unavailable. Please sign up or try again later." },
        });
      } else {
        // Handle other errors (e.g., invalid credentials)
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Invalid mobile number or password",
        }));
      }
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your mobile number and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Mobile Number <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="mobile"
                    placeholder="9703003098"
                    value={formData.mobile}
                    onChange={handleInputChange}
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-error-500">{errors.mobile}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error-500">{errors.password}</p>
                  )}
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
            {error && (
              <p className="mt-4 text-sm text-error-500 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}