import { useState } from "react";

import {  EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";

import Button from "../ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router";
import { login } from "../../store/slices/authSlice";

export default function SignInForm() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData,setFormData] = useState({
    email:"",
    password:"",
    type:""
  });

  interface RootState {
    auth: {
      isAuthenticated: boolean;
    };
  }
  
  const isAuthenticated = useSelector((state :RootState)=> state.auth.isAuthenticated);


  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const {name,value} = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]:value
    }));
  }

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    dispatch(login());
    navigate("/");

  }
  
  if(isAuthenticated){
    return <Navigate to="/" />
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
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            
           
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                  name="email"
                   placeholder="info@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    
                   />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
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
                </div>
                <div>
                  <Label>
                    Type <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                  name="type"
                   placeholder="Ex :manager"
                    value={formData.type}
                    onChange={handleInputChange}
                    
                   />
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  );
}
