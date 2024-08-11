import { Button } from "@/components/ui/button";
import Feedback from "./Feedback";
import { Link } from "react-router-dom";
import { Icons } from "@/assets/Icons";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              ToolStack
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built by MM
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
            <Feedback />

            <Button variant="outline" className="" asChild>
              <Link
                to="https://github.com/marcm8793/tool-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Icons.GithubIcon />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Built with 💻</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
