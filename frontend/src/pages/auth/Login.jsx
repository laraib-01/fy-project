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
import { addToast, ToastProvider } from "@heroui/toast";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import authService from "../../services/authService";

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);

      if (res?.status === "success") {
        addToast({
          title: res?.message,
          color: "success",
        });
        setTimeout(() => {
          authService.storeAuthData(
            res?.data?.token,
            res?.data?.hasActiveSubscription,
            res?.data?.user
          );
          if (res?.data?.user?.role === "Parent") {
            navigate("/parent");
          } else if (res?.data?.user?.role === "Teacher") {
            navigate("/teacher");
          } else if (
            res?.data?.user?.role === "School_Admin" &&
            res?.data?.hasActiveSubscription
          ) {
            navigate("/school");
          } else if (
            res?.data?.user?.role === "School_Admin" &&
            !res?.data?.hasActiveSubscription
          ) {
            navigate("/subscription");
          } else if (res?.data?.user?.role === "EduConnect_Admin") {
            navigate("/admin");
          }
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      setIsLoading(false);
      addToast({
        title: error?.message,
        color: "danger",
      });
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

              <form onSubmit={handleLogin} disabled={isLoading}>
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
