import Footer from "@/components/Footer";
import Header from "@/components/navbar/Header";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
