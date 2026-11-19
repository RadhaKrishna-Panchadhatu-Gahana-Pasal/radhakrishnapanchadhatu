import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="font-heading text-2xl text-primary-text">Radha Krishna</p>
            <p className="text-xs text-[#B08A45] tracking-widest uppercase">Panchha Dhatu</p>
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-lg p-8">
          <h1 className="font-heading text-2xl text-primary-text mb-6 text-center">
            Create Account
          </h1>
          {/* TODO: Registration form */}
          <p className="text-secondary-text text-sm text-center">
            Registration form coming soon.
          </p>
          <p className="text-center text-xs text-secondary-text mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#B08A45] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
