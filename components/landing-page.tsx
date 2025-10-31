"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Lock, Users } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function LandingPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fadeInFromLeft = {
    initial: { opacity: 0, x: -100 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.7 }, 
    viewport: { once: true },
  };

  const fadeInFromBottom = {
    initial: { opacity: 0, y: 100 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7 },
    viewport: { once: true },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tighter">
          Club<span className="text-indigo-600">Sync</span>
        </h1>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Sign In
          </motion.button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]"
              >
                <Link href={'/login/m'}>
                  <button
                    className="block w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
                    onClick={() => {
                      console.log("Sign in as Member");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Member
                  </button>
                </Link>

                <Link href={'/login/c'}>
                  <button
                    className="block w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
                    onClick={() => {
                      console.log("Sign in as Club Admin");
                      setIsDropdownOpen(false);
                    }}
                  >
                      Club Admin
                  </button>
                </Link>

                <Link href={'/login/sa'}>
                  <button
                    className="block w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
                    onClick={() => {
                      console.log("Sign in as Club Admin");
                      setIsDropdownOpen(false);
                    }}
                  >
                      Super Admin
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="w-full">
        <section className="flex min-h-screen w-full items-center p-8 md:p-16 lg:p-24">
          <motion.h1
            className="text-left text-7xl font-extrabold leading-tight tracking-tighter md:text-8xl lg:text-9xl"
            {...fadeInFromLeft}
          >
            Track your club.
            <br />
            See your growth.
            <br />
            All in <span className="text-indigo-600">one</span> place.
          </motion.h1>
        </section>

        <section className="min-h-screen w-full bg-gray-50 p-8 md:p-16 lg:p-24">
          <motion.h2
            className="mb-12 text-center text-6xl font-extrabold tracking-tighter md:text-7xl"
            {...fadeInFromBottom}
          >
            Post. Track. Shine.
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }} 
          >
            <motion.div
              className="flex min-h-[300px] flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 lg:col-span-2"
              variants={fadeInFromBottom}
            >
              <div>
                <h3 className="text-2xl font-bold">New Project Update</h3>
                <p className="mt-2 text-lg text-gray-600">
                  &quot;Just pushed the v1.0 of the new Club Website. Huge props to
                  the design team!&quot;
                </p>
                <p className="mt-2 text-base text-gray-500">
                  Share updates, milestones, and achievements with your club members instantly. Keep everyone in the loop with real-time notifications and engaging posts.
                </p>
              </div>
              <div className="mt-8 flex gap-2">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                  #tech
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  #react
                </span>
              </div>
            </motion.div>

            <motion.div
              className="flex min-h-[300px] flex-col rounded-3xl bg-gray-900 p-8 text-white lg:row-span-2"
              variants={fadeInFromBottom}
            >
              <h3 className="text-2xl font-bold">Admin Dashboard</h3>
              <p className="mt-2 text-lg text-gray-300">
                See who&apos;s learning, who&apos;s building, and who&apos;s leading.
              </p>
              <p className="mt-2 text-base text-gray-400">
                Monitor team activities, track progress, and gain insights into your club&apos;s performance. Access detailed analytics and reports to make informed decisions.
              </p>
              <div className="mt-auto">
                <p className="text-sm text-gray-400">Tech Team Progress</p>
                <div className="mt-2 h-4 w-full rounded-full bg-gray-700">
                  <div className="h-4 w-3/4 rounded-full bg-indigo-500"></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex min-h-[300px] flex-col rounded-3xl border border-gray-200 bg-white p-8 lg:col-span-2"
              variants={fadeInFromBottom}
            >
              <h3 className="text-2xl font-bold">You&apos;re In Control</h3>
              <p className="mt-2 text-lg text-gray-600">
                Share your progress just with your team, or with the world.
              </p>
              <p className="mt-2 text-base text-gray-500">
                Choose your privacy settings to control who sees your posts and updates. From private team discussions to public showcases, tailor your visibility.
              </p>
              <div className="mt-auto flex justify-around gap-4">
                <div className="flex flex-col items-center">
                  <Lock size={24} className="text-gray-500" />
                  <span className="mt-2 text-sm font-medium">Private</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users size={24} className="text-indigo-600" />
                  <span className="mt-2 font-medium text-indigo-600">
                    Club-Only
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Globe size={24} className="text-gray-500" />
                  <span className="mt-2 text-sm font-medium">Public</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        
        <section className="flex min-h-[90vh] w-full flex-col items-center justify-center p-8 text-center">
          <motion.h2
            className="text-7xl font-extrabold tracking-tighter md:text-8xl lg:text-9xl"
            {...fadeInFromBottom}
          >
            Build better.
            <br />
            <span className="text-indigo-600">Together.</span>
          </motion.h2>
          <motion.button
            className="mt-12 flex items-center gap-3 rounded-full bg-gray-900 px-10 py-5 text-xl font-semibold text-white transition-all hover:bg-gray-700"
            variants={fadeInFromBottom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch Your Club Hub
            <ArrowRight size={24} />
          </motion.button>
        </section>
      </main>

    
      <footer className="w-full bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} ClubSync. All rights reserved.
        </p>
      </footer>
    </div>
  );
}