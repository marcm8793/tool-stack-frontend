import { useState } from "react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const { isAdmin, loading } = useAdminAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null; // This will not be rendered due to redirection in the hook
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          {/* Add overview content here */}
        </TabsContent>
        <TabsContent value="tools">
          <h2 className="text-2xl font-semibold mb-4">Tools Management</h2>
          <Button onClick={() => navigate("/admin/add-tool")}>
            Add New Tool
          </Button>
          {/* Add tool management content here */}
        </TabsContent>
        <TabsContent value="users">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          {/* Add user management content here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
