import { columns } from "@/components/tooltable/Columns";
import { DataTable } from "@/components/tooltable/data-table";
import { db } from "@/lib/firebase";
import { Category, DevTool, DevToolsState } from "@/types";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

const DevTools: React.FC = () => {
  const [state, setState] = useState<DevToolsState>({
    tools: [],
    categories: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const toolsCollection = collection(db, "tools");
        const toolsSnapshot = await getDocs(toolsCollection);
        const toolsList = toolsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as DevTool)
        );

        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Category)
        );

        setState((prevState) => ({
          ...prevState,
          tools: toolsList,
          categories: categoriesList,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        setState((prevState) => ({
          ...prevState,
          error: "Failed to fetch tools",
          isLoading: false,
        }));
      }
    };

    fetchTools();
  }, []);

  if (state.isLoading) return <div>Loading...</div>;
  if (state.error) return <div>Error: {state.error}</div>;

  const updatedColumns = columns(state.categories);

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Discover the best tools for developers
          </h2>
          <p className="text-muted-foreground">
            Find your next package to help you build faster and smarter. Filter
            and click on a tool to learn more!
          </p>
        </div>
      </div>
      <DataTable
        data={state.tools}
        columns={updatedColumns}
        categories={state.categories}
      />
    </div>
  );
};

export default DevTools;
