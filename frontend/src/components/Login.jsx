import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Input,
  Button,
  Checkbox,
  Divider,
  Spacer,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { addToast, ToastProvider } from "@heroui/toast";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      if (res?.data?.status === "success") {
        localStorage.setItem("educonnect_token", res.data.token);
        localStorage.setItem("educonnect_role", res.data.role);
        addToast({
          title: res?.data?.message,
          color: "success",
          hideIcon: true,
        });
        setTimeout(() => {
          if (res?.data?.role === "Parent") {
            navigate("/parent");
          } else if (res?.data?.role === "Teacher") {
            navigate("/teacher");
          } else if (res?.data?.role === "School_Admin") {
            navigate("/school");
          } else if (res?.data?.role === "EduConnect_Admin") {
            navigate("/admin");
          }
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Login failed:", error);
      addToast({
        title: error?.response?.data?.message,
        color: "danger",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardBody className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-foreground-600">
                  Sign in to your EduConnect account
                </p>
              </div>

              {error && (
                <div className="bg-danger-50 text-danger p-3 rounded-medium mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="space-y-4">
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
                    isRequired
                  />

                  <Input
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onValueChange={setPassword}
                    startContent={
                      <Icon
                        icon="lucide:lock"
                        className="text-foreground-400"
                      />
                    }
                    isRequired
                  />

                  <div className="flex justify-between items-center">
                    <Checkbox
                      isSelected={rememberMe}
                      onValueChange={setRememberMe}
                      size="sm"
                    >
                      Remember me
                    </Checkbox>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Login;
