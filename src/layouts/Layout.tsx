import Footer from "@/components/Footer";
import Header from "@/components/navbar/Header";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="container flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto flex-1 py-10">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
