import { useState } from "react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import AddEcosystemForm from "@/components/admin/AddEcosystemForm";
import ManageToolsForm from "@/components/admin/ManageToolsForm";
import OverviewDashboard from "@/components/admin/OverviewDashboard";

const AdminPage = () => {
  const { isAdmin, loading } = useAdminAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="ecosystems">Ecosystems</TabsTrigger>
        </TabsList>
        <TabsContent value="tools">
          <h2 className="text-2xl font-semibold mb-4">Tools Management</h2>
          <div className="space-y-6 pb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Add New Tool</h3>
              <Button onClick={() => navigate("/admin/add-tool")}>
                Add New Tool
              </Button>
            </div>
          </div>
          <ManageToolsForm />
        </TabsContent>
        <TabsContent value="overview">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <OverviewDashboard />
        </TabsContent>

        <TabsContent value="users">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          {/* Add user management content here */}
        </TabsContent>
        <TabsContent value="categories">
          <h2 className="text-2xl font-semibold mb-4">Categories Management</h2>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Add New Category</h3>
            <AddCategoryForm />
          </div>
        </TabsContent>
        <TabsContent value="ecosystems">
          <h2 className="text-2xl font-semibold mb-4">Ecosystems Management</h2>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Add New Ecosystem</h3>
            <AddEcosystemForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
