import Feedback from "../Feedback";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <div className="flex space-x-2">
      <Feedback />
      <ModeToggle />
    </div>
  );
};

export default Navbar;
