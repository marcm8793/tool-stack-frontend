import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DevTools from "./pages/DevToolsPage";
import ToolDetails from "./pages/ToolDetailsPage";
import Layout from "./layouts/Layout";
import { SignInForm } from "./components/auth/Sign-in";
import { SignUpForm } from "./components/auth/Sign-up";
import ProfilePage from "./pages/ProfilePage";
import AddToolPage from "./pages/AddToolPage";
import AdminRoute from "./components/admin/AdminRoute";
import AdminPage from "./pages/AdminPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />{" "}
          </Layout>
        }
      />
      <Route
        path="/tools"
        element={
          <Layout>
            <DevTools />{" "}
          </Layout>
        }
      />
      <Route
        path="/tools/:slug"
        element={
          <Layout>
            <ToolDetails />
          </Layout>
        }
      />
      <Route
        path="/signin"
        element={
          <Layout>
            <SignInForm />{" "}
          </Layout>
        }
      />
      <Route
        path="/signup"
        element={
          <Layout>
            <SignUpForm />{" "}
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <ProfilePage />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <AdminPage />
          </Layout>
        }
      />
      <Route
        path="/admin/add-tool"
        element={
          <AdminRoute>
            <Layout>
              <AddToolPage />
            </Layout>
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
