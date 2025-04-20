import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Force re-render of sidebar on mount
  useEffect(() => {
    console.log("Layout mounted - sidebar should be visible");
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      {/* Main content area with sidebar offset */}
      <div className="lg:pl-64 flex flex-col flex-1 h-screen overflow-y-auto">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}