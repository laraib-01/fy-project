import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Input,
  Button,
  Checkbox,
  Divider,
  RadioGroup,
  Radio,
  Spacer,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import axios from "axios";
import {addToast, ToastProvider} from "@heroui/toast";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Parent");
  const [schoolName, setSchoolName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (role === "School_Admin" && !schoolName)
      newErrors.schoolName = "School name is required";

    if (!agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name: `${firstName} ${lastName}`,
        email: email,
        password: password,
        role: role,
      });
      if (res?.data?.status === "success") {
        addToast({
          title: res?.data?.message,
          color: "success",
          hideIcon: true,
        });

        setTimeout(() => {
          navigate("/login");
          setIsLoading(false);
        }, 1500);
      } else {
        console.log(res?.data);
        addToast({
          title: res?.data?.message,
          color: "danger",
          hideIcon: true,
        });
      }
    } catch (error) {
      setIsLoading(false);
      addToast({
        title: error?.response?.data?.message,
        color: "danger",
      });
    }
  };

  return (
    <>
      <ToastProvider
        placement="bottom-center"
        toastOffset={0}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardBody className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Create Your Account</h1>
                <p className="text-foreground-600">
                  Join EduConnect to get started
                </p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Enter your first name"
                      value={firstName}
                      onValueChange={setFirstName}
                      isInvalid={!!errors.firstName}
                      errorMessage={errors.firstName}
                      isRequired
                    />

                    <Input
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={lastName}
                      onValueChange={setLastName}
                      isInvalid={!!errors.lastName}
                      errorMessage={errors.lastName}
                      isRequired
                    />
                  </div>

                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={email}
                    onValueChange={setEmail}
                    startContent={
                      <Icon
                        icon="lucide:mail"
                        className="text-foreground-400"
                      />
                    }
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    isRequired
                  />

                  <Input
                    type="password"
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onValueChange={setPassword}
                    startContent={
                      <Icon
                        icon="lucide:lock"
                        className="text-foreground-400"
                      />
                    }
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                    isRequired
                  />

                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    startContent={
                      <Icon
                        icon="lucide:lock"
                        className="text-foreground-400"
                      />
                    }
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                    isRequired
                  />

                  <div>
                    <p className="text-sm font-medium mb-2">
                      I am registering as:
                    </p>
                    <RadioGroup
                      orientation="horizontal"
                      value={role}
                      onValueChange={setRole}
                    >
                      <Radio value="Parent">Parent</Radio>
                      <Radio value="Teacher">Teacher</Radio>
                      <Radio value="School_Admin">School Admin</Radio>
                    </RadioGroup>
                  </div>

                  {role === "School_Admin" && (
                    <Input
                      label="School Name"
                      placeholder="Enter school name"
                      value={schoolName}
                      onValueChange={setSchoolName}
                      isInvalid={!!errors.schoolName}
                      errorMessage={errors.schoolName}
                      isRequired
                    />
                  )}

                  <Checkbox
                    isSelected={agreeTerms}
                    onValueChange={setAgreeTerms}
                    isInvalid={!!errors.agreeTerms}
                    size="sm"
                  >
                    <span className="text-sm">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </Checkbox>
                  {errors.agreeTerms && (
                    <p className="text-danger text-xs mt-1">
                      {errors.agreeTerms}
                    </p>
                  )}

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-foreground-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
};
