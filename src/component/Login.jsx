import React from 'react'
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";

function Login() {
  return (
          <div className="flex min-h-screen">
        {/* LEFT SIDE (Illustration) */}
        <div className="hidden md:flex w-1/2 bg-gray-50 items-center justify-center p-10">
          <img
            src="/public/Assets/images/Illustration.png"
            alt="Illustration"
            className="max-w-xs"
          />
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Masuk ke akunmu untuk melanjutkan
          </p>

          <form className="space-y-4">
            {/* Email */}
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full outline-none text-sm text-gray-700"
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Password"
                className="w-full outline-none text-sm text-gray-700"
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <a href="#" className="text-orange-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Button Login */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-2 text-gray-400 text-sm">Or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="flex gap-3">
            <button className="flex items-center justify-center w-1/2 border rounded-lg py-2 hover:bg-gray-50 transition">
              <FcGoogle className="text-xl mr-2" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center w-1/2 border rounded-lg py-2 hover:bg-gray-50 transition">
              <FaFacebookF className="text-blue-600 text-lg mr-2" />
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>

          {/* Sign Up */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-orange-500 font-medium hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
  )
}

export default Login