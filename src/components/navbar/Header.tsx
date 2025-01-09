import { Link } from "react-router-dom";
import MainNav from "./MainNav";
import MobileNav from "./MobileNav";
import SearchBar from "../SearchBar";
// import { ChatBot } from "../ai-chat/ChatBot";

const Header = () => {
  return (
    <div className="border-b-2 border-neutral-200 py-6">
      <div className="container mx-auto flex justify-between items-center space-x-2">
        <Link
          to="/"
          className="hidden md:block text-2xl md:text-5xl font-semibold bg-gradient-to-b from-blue-500 to-blue-900 text-transparent bg-clip-text"
        >
          ToolStack
        </Link>
        {/* <ChatBot /> */}
        <Link to="/" className="block md:hidden">
          <img src="/ToolStack.png" alt="ToolStack" width={48} height={48} />
        </Link>
        <SearchBar />
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="hidden md:block">
          <MainNav />
        </div>
      </div>
    </div>
  );
};

export default Header;
