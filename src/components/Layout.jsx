import Sidebar from "./Sidebar";
import Header from "./Headers";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header /> 
      <div className="flex flex-1 pt-18">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
