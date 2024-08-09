import { columns } from "@/components/tooltable/Columns";
import { DataTable } from "@/components/tooltable/data-table";
import { db } from "@/lib/firebase";
import { DevToolDocument, DevToolsState } from "@/types";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { ExternalLink, Star } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Link } from "react-router-dom";

const DevTools: React.FC = () => {
  const [state, setState] = useState<DevToolsState>({
    tools: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const toolsCollection = collection(db, "tools");
        const toolsSnapshot = await getDocs(toolsCollection);
        const toolsList = toolsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as DevToolDocument)
        );
        setState((prevState) => ({
          ...prevState,
          tools: toolsList,
          isLoading: false,
        }));
      } catch {
        setState((prevState) => ({
          ...prevState,
          error: "Failed to fetch tools",
          isLoading: false,
        }));
      }
    };

    fetchTools();
  }, [setState]);

  if (state.isLoading) return <div>Loading...</div>;
  if (state.error) return <div>Error: {state.error}</div>;

  return (
    // <div className="container mx-auto py-10">
    //   <Table>
    //     <TableHeader>
    //       <TableRow>
    //         <TableHead className="w-[100px]">Logo</TableHead>
    //         <TableHead>Name</TableHead>
    //         <TableHead>Badges</TableHead>
    //         <TableHead>GitHub</TableHead>
    //         <TableHead>Stars</TableHead>
    //       </TableRow>
    //     </TableHeader>
    //     <TableBody>
    //       {state.tools.map((tool: DevTool) => (
    //         <TableRow key={tool.id}>
    //           <TableCell>
    //             <img
    //               src={tool.logo_url}
    //               alt={`${tool.name} logo`}
    //               className="w-10 h-10 object-contain"
    //             />
    //           </TableCell>
    //           <TableCell className="font-medium">
    //             <Link
    //               to={`/tool/${tool.id}`}
    //               className="text-blue-500 hover:underline"
    //             >
    //               {tool.name}
    //             </Link>
    //           </TableCell>
    //           <TableCell>
    //             {tool.badges.map((badge, index) => (
    //               <Badge key={index} variant="outline" className="mr-1">
    //                 {badge}
    //               </Badge>
    //             ))}
    //           </TableCell>
    //           <TableCell>
    //             <a
    //               href={tool.github_link}
    //               target="_blank"
    //               rel="noopener noreferrer"
    //               className="flex items-center text-blue-500 hover:underline"
    //             >
    //               GitHub <ExternalLink size={16} className="ml-1" />
    //             </a>
    //           </TableCell>
    //           <TableCell>
    //             <div className="flex items-center">
    //               <Star className="mr-1 text-yellow-400" size={16} />
    //               {tool.github_stars.toLocaleString()}
    //             </div>
    //           </TableCell>
    //         </TableRow>
    //       ))}
    //     </TableBody>
    //   </Table>
    // </div>
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks for this month!
          </p>
        </div>
      </div>
      <DataTable data={state.tools} columns={columns} />
    </div>
  );
};

export default DevTools;
