import { Link } from "react-router-dom";
import MobileNavLinks from "./MobileNavLinks";
import MainNav from "./MainNav";

const Header = () => {
  return (
    <div className="border-b-2 border-neutral-200 py-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-5xl font-semibold bg-gradient-to-b from-blue-500 to-blue-900 text-transparent bg-clip-text"
        >
          ToolStack
        </Link>
        <div className="md:hidden">
          <MobileNavLinks />
        </div>
        <div className="hidden md:block">
          <MainNav />
        </div>
      </div>
    </div>
  );
};

export default Header;
