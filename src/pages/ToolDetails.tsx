import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { DevTool, Category } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, ExternalLink, Github, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tool, setTool] = useState<DevTool | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolAndCategory = async () => {
      try {
        const toolDoc = await getDoc(doc(db, "tools", id!));
        if (toolDoc.exists()) {
          const toolData = { id: toolDoc.id, ...toolDoc.data() } as DevTool;
          setTool(toolData);

          // Fetch category
          if (toolData.category) {
            const categoryDoc = await getDoc(toolData.category);
            if (categoryDoc.exists()) {
              setCategory((categoryDoc.data() as Category).name);
            } else {
              setCategory("Uncategorized");
            }
          } else {
            setCategory("Uncategorized");
          }
        } else {
          setError("Tool not found");
        }
      } catch (err) {
        console.error("Error fetching tool details:", err);
        setError("Failed to fetch tool details");
      } finally {
        setLoading(false);
      }
    };

    fetchToolAndCategory();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tool) return <div>Tool not found</div>;

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Button
        onClick={() => navigate("/tools")}
        className="mb-6"
        variant="outline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <img
              src={tool.logo_url}
              alt={`${tool.name} logo`}
              className="w-20 h-20 object-contain"
            />
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                {tool.name}
              </CardTitle>
              <p className="text-muted-foreground">{category}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="mt-2">{tool.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Features</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {tool.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                to={tool.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:underline"
              >
                <Github className="mr-2" size={20} />
                GitHub Repository
                <ExternalLink size={16} className="ml-1" />
              </Link>
              <div className="flex items-center">
                <Star className="mr-1 text-yellow-400" size={20} />
                <span>{tool.github_stars.toLocaleString()} stars</span>
              </div>
            </div>

            {tool.website_url && (
              <div>
                <h3 className="text-lg font-semibold">Website</h3>
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {tool.website_url}
                  <ExternalLink size={16} className="ml-1 inline" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolDetails;
