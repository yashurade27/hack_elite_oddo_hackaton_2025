"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp, signupUser } from "@/app/actions/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user", // 📌 Added role (default user)
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form validation
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!formData.role) {
      setError("Role is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("firstName", formData.firstName);
      formDataObj.append("lastName", formData.lastName);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("role", formData.role); // 📌 Added role
      formDataObj.append("password", formData.password);

      const result = await sendOtp(null, formDataObj);

      if (result.success) {
        setCurrentStep(2);
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("otp", formData.otp);

      const verifyResult = await verifyOtp(null, formDataObj);

      if (verifyResult.success) {
        // Now signup the user
        const signupFormData = new FormData();
        signupFormData.append("name", `${formData.firstName} ${formData.lastName}`);
        signupFormData.append("email", formData.email);
        signupFormData.append("phone", formData.phone);
        signupFormData.append("role", formData.role); // 📌 Added role
        signupFormData.append("password", formData.password);
        signupFormData.append("otp", formData.otp);

        const signupResult = await signupUser(null, signupFormData);

        if (signupResult.success) {
          setCurrentStep(3);
          setSuccess(signupResult.message);
        } else {
          setError(signupResult.message);
        }
      } else {
        setError(verifyResult.message);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center !space-y-0">
          <CardTitle className="text-2xl font-bold">
            {currentStep === 1
              ? "Create Account"
              : currentStep === 2
              ? "Verify Account"
              : "Success!"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter your details to create your account"}
            {currentStep === 2 &&
              `We've sent a verification code to ${formData.email} & ${formData.phone}`}
            {currentStep === 3 && "Your account has been created successfully"}
          </CardDescription>
        </CardHeader>

        {/* Step 1: Registration Form */}
        {currentStep === 1 && (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              {/* 📌 Role Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800"
                  required
                >
                  <option value="user">User</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send Verification Code"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check your email/phone for the verification code
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentStep(1);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Back to Form
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <CardContent className="space-y-6">
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm text-center">
                {success}
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Welcome to Globetrotter!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your account has been created successfully as{" "}
                  <b>{formData.role}</b>. You can now sign in with your
                  credentials.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => router.push("/login")} className="w-full">
                Sign In Now
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
