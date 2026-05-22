import { useEffect } from "react";
import Sidebar from "@/ui/components/Sidebar";
import EditorPage from "@/ui/views/EditorPage";
import SyncIndicator from "@/ui/components/SyncIndicator";
import { initDb } from "@/core/db/queries";

export default function App() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-[#F7F7F5] text-[#37352F]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <EditorPage />
        <SyncIndicator />
      </main>
    </div>
  );
}
