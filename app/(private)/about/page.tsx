"use client";

import { motion } from "framer-motion";
import UnderDevelopment from "../components/UnderDevelopment";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors duration-500 px-6 py-12">
      {/* 🌈 Floating background orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 dark:bg-purple-500/10 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-400/30 dark:bg-indigo-500/10 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🌟 Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-10 text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl font-extrabold text-purple-700 dark:text-purple-400 drop-shadow-md"
        >
          About <span className="text-indigo-600 dark:text-indigo-400">Chatterly</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto"
        >
          Discover how <span className="font-semibold text-purple-600 dark:text-purple-400">Chatterly</span> is
          reshaping the way people communicate using intelligent automation, AI, and real-time analytics.
        </motion.p>

        {/* UnderDevelopment Component */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <UnderDevelopment message="This section of Chatterly is under development. You’ll soon be able to explore our story, team, and vision for the future here!" />
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 border-t border-gray-300 dark:border-gray-700"
        />

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-sm text-gray-600 dark:text-gray-400"
        >
          💬 Built with ❤️ by the{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">Chatterly</span> team to make
          messaging effortless and intelligent.
        </motion.p>
      </motion.div>
    </div>
  );
}
