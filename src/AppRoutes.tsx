import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DevTools from "./pages/DevTools";
import ToolDetails from "./pages/ToolDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tools" element={<DevTools />} />
      <Route path="/tool/:id" element={<ToolDetails />} />
    </Routes>
  );
};

export default AppRoutes;
