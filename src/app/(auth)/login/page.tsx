import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="font-heading text-2xl text-primary-text">Radha Krishna</p>
            <p className="text-xs text-[#B08A45] tracking-widest uppercase">
              Panchha Dhatu
            </p>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-lg p-8">
          <h1 className="font-heading text-2xl text-primary-text mb-6 text-center">
            Sign In
          </h1>

          {/* TODO: Auth.js Google sign-in button */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-border rounded-md text-sm font-medium text-primary-text hover:bg-[#F7F5F0] transition-colors mb-4">
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-surface text-xs text-secondary-text">
                or
              </span>
            </div>
          </div>

          {/* TODO: Email form */}
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-text mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#B08A45] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#B08A45] text-white rounded-md font-medium hover:bg-[#80612F] transition-colors text-sm"
            >
              Continue with Email
            </button>
          </form>

          <p className="text-center text-xs text-secondary-text mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#B08A45] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
