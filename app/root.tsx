"use client"

import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, Link } from "@remix-run/react"
import type { LinksFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import stylesheet from "./tailwind.css?url"
import { Toaster } from "~/components/ui/toaster"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouteError, isRouteErrorResponse } from "@remix-run/react"
import { ArrowLeft } from "lucide-react"

interface LoaderData {
  ENV: {
    BASE_API_URL: string
  }
}

export const loader: LoaderFunction = async () => {
  return json({
    ENV: {
      BASE_API_URL: process.env.BASE_API_URL || "",
    },
  })
}

function Document({
  children,
  ENV,
}: {
  children: React.ReactNode
  ENV: LoaderData["ENV"]
}) {

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />

        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const data = useLoaderData<LoaderData>()
  return (
    <Document ENV={data.ENV}>
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([])

  // Create animated stars in the background
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 50; i++) {
        newStars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
        })
      }
      setStars(newStars)
    }

    generateStars()

    // Regenerate stars every 10 seconds for a subtle animation effect
    const interval = setInterval(() => {
      generateStars()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown Error"

  return (
    <html lang="en">
      <head>
        <title>Oops! Page Not Found</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen overflow-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#1a1448] via-[#272657] to-[#3a2b7d] animate-gradient-slow">
          {/* Animated stars */}
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          {/* Animated glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#6b46c1]/20 blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-[#4c1d95]/20 blur-3xl animate-float-delay"></div>
        </div>


        <main className="relative z-10 flex-grow flex items-center justify-center p-4 min-h-[80vh]">
          <div className="max-w-2xl w-full">
            {/* 404 Text with glow effect */}
            <div className="relative mb-8 flex items-center justify-center">
              <div className="text-[180px] font-bold text-white/10 text-center leading-none select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[180px] font-bold text-white/80 text-center leading-none blur-sm select-none">
                  404
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[180px] font-bold text-white text-center leading-none select-none">404</div>
              </div>
            </div>

            <div className="text-center relative z-10">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-glow">Oops! Page Not Found</h1>
              <p className="text-[#c4c3e2] text-xl mb-8">{message}</p>

              <div className="flex justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 font-medium rounded-full bg-gradient-to-r from-[#515093] to-[#6b46c1] hover:from-[#615ba3] hover:to-[#7c4dd1] transition-all px-8 py-3 text-white shadow-lg shadow-purple-900/30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>


        <Scripts />
      </body>
    </html>
  )
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }]
