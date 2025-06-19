import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Better Auth Demo</h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            A modern authentication solution for Next.js applications using
            Better Auth, Prisma, and shadcn/ui.
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Choose an option to begin using the authentication system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/sign-up" className="block">
              <Button className="w-full" size="lg">
                Create Account
              </Button>
            </Link>
            <Link href="/sign-in" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-4 text-sm text-gray-500">
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Email & Password</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Session Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Secure & Modern</span>
            </div>
          </div>
          <p>
            Built with{" "}
            <a
              href="https://www.better-auth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              Better Auth
            </a>
            ,{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              Next.js
            </a>
            , and{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              shadcn/ui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
