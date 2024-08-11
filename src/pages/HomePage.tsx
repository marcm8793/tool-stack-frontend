import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Zap, Search } from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg backdrop-blur-sm"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-12 h-12 text-indigo-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

const HomePage = () => {
  return (
    <div className="container min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center p-4 rounded-3xl">
      <div className="w-full max-w-6xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Welcome to ToolStack
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8">
              Discover the perfect tools for your next project
            </p>
            <Link
              to="/tools"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition duration-300"
            >
              Explore Tools
              <ArrowRight className="ml-2" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <FeatureCard
              icon={Search}
              title="Discover"
              description="Find the best developer tools curated just for you"
            />
            <FeatureCard
              icon={Code}
              title="Compare"
              description="Compare features and choose the right tool for your needs"
            />
            <FeatureCard
              icon={Zap}
              title="Boost Productivity"
              description="Enhance your workflow with top-rated developer tools"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-3xl font-semibold mb-4">
              Ready to supercharge your development?
            </h2>
            <Link
              to="/tools"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-indigo-600 border-2 border-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition duration-300"
            >
              Get Started Now
              <ArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
