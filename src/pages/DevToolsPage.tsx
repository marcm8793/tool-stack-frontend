import DevToolsSkeleton from "@/components/skeletons/DevToolsSkeleton";
import { columns } from "@/components/tooltable/Columns";
import { DataTable } from "@/components/tooltable/data-table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  Category,
  DevTool,
  DevToolsState,
  EcoSystem,
  Like,
} from "@/types/index";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  increment,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";

const DevTools: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<DevToolsState>({
    tools: [],
    categories: [],
    ecosystem: [],
    isLoading: true,
    error: null,
  });
  const [likedTools, setLikedTools] = useState<string[]>([]);

  const fetchLikedTools = useCallback(async () => {
    if (user) {
      try {
        const likesRef = collection(db, "likes");
        const q = query(likesRef, where("user_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const likedToolIds = querySnapshot.docs.map(
          (doc) => doc.data().tool_id
        );
        setLikedTools(likedToolIds);
      } catch (error) {
        console.error("Error fetching liked tools:", error);
      }
    } else {
      setLikedTools([]); // Clear liked tools when user is not logged in
    }
  }, [user]);

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

        const ecosystemCollection = collection(db, "ecosystems");
        const ecosystemSnapshot = await getDocs(ecosystemCollection);
        const ecosystemList = ecosystemSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as EcoSystem)
        );

        setState((prevState) => ({
          ...prevState,
          tools: toolsList,
          categories: categoriesList,
          ecosystem: ecosystemList,
          isLoading: false,
        }));

        fetchLikedTools();
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
  }, [fetchLikedTools]);

  const handleLikeToggle = useCallback(
    async (toolId: string, toolName: string, isLiked: boolean) => {
      if (!user) return;

      try {
        const likeId = `${user.uid}_${toolId}`;
        const likeRef = doc(db, "likes", likeId);
        const toolRef = doc(db, "tools", toolId);

        if (isLiked) {
          const newLike: Like = {
            id: likeId,
            user_id: user.uid,
            tool_id: toolId,
            liked_at: Timestamp.now(),
          };
          await setDoc(likeRef, newLike);
          await setDoc(toolRef, { like_count: increment(1) }, { merge: true });
          setLikedTools((prev) => [...prev, toolId]);
          toast({
            title: "Tool Liked",
            description: `You have liked ${toolName}.`,
          });
        } else {
          await deleteDoc(likeRef);
          await setDoc(toolRef, { like_count: increment(-1) }, { merge: true });
          setLikedTools((prev) => prev.filter((id) => id !== toolId));
          toast({
            title: "Tool Unliked",
            description: `You have unliked ${toolName}.`,
          });
        }

        // Update the local state
        setState((prevState) => ({
          ...prevState,
          tools: prevState.tools.map((tool) =>
            tool.id === toolId
              ? {
                  ...tool,
                  like_count: (tool.like_count || 0) + (isLiked ? 1 : -1),
                }
              : tool
          ),
        }));
      } catch (error) {
        console.error("Error toggling like:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while updating your like. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, toast]
  );

  if (state.isLoading) return <DevToolsSkeleton />;
  if (state.error) return <div>Error: {state.error}</div>;

  const updatedColumns = columns({
    categories: state.categories,
    ecosystems: state.ecosystem,
    likedTools,
    onLikeToggle: handleLikeToggle,
    currentUser: user,
  });

  return (
    <div className="container h-full flex-1 flex-col space-y-8 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Discover the best tools for developers
          </h2>
          <p className="text-muted-foreground hidden md:flex">
            Find your next package to help you build faster and smarter. Filter
            and click on a tool to learn more!
          </p>
        </div>
      </div>
      <DataTable
        data={state.tools as DevTool[]}
        columns={updatedColumns}
        categories={state.categories}
        ecosystems={state.ecosystem}
        likedTools={likedTools}
      />
    </div>
  );
};

export default DevTools;
