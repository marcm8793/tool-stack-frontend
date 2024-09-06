import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalTools: number;
  totalCategories: number;
  totalEcosystems: number;
  totalLikes: number;
  toolsPerCategory: { name: string; count: number }[];
  toolsPerEcosystem: { name: string; count: number }[];
}

const OverviewDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const toolsSnapshot = await getDocs(collection(db, "tools"));
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const ecosystemsSnapshot = await getDocs(collection(db, "ecosystems"));
        const likesSnapshot = await getDocs(collection(db, "likes"));

        const toolsPerCategory: { [key: string]: number } = {};
        const toolsPerEcosystem: { [key: string]: number } = {};

        toolsSnapshot.docs.forEach((doc) => {
          const tool = doc.data();
          if (tool.category) {
            const categoryId = tool.category.id;
            toolsPerCategory[categoryId] =
              (toolsPerCategory[categoryId] || 0) + 1;
          }
          if (tool.ecosystem) {
            const ecosystemId = tool.ecosystem.id;
            toolsPerEcosystem[ecosystemId] =
              (toolsPerEcosystem[ecosystemId] || 0) + 1;
          }
        });

        const categoryNames = categoriesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {} as { [key: string]: string });

        const ecosystemNames = ecosystemsSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {} as { [key: string]: string });

        setStats({
          totalUsers: usersSnapshot.size,
          totalTools: toolsSnapshot.size,
          totalCategories: categoriesSnapshot.size,
          totalEcosystems: ecosystemsSnapshot.size,
          totalLikes: likesSnapshot.size,
          toolsPerCategory: Object.entries(toolsPerCategory).map(
            ([id, count]) => ({
              name: categoryNames[id] || "Unknown",
              count,
            })
          ),
          toolsPerEcosystem: Object.entries(toolsPerEcosystem).map(
            ([id, count]) => ({
              name: ecosystemNames[id] || "Unknown",
              count,
            })
          ),
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div>Error loading stats</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTools}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCategories}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Ecosystems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEcosystems}</div>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tools per Category</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.toolsPerCategory}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tools per Ecosystem</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.toolsPerEcosystem}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewDashboard;
