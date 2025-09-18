'use client'
import  Sidebar  from "@/components/sidebar";
import InputBar from "@/components/inputbar";

const page = () => {
  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen w-full">
      <Sidebar />
      <div className="p-6">
        <InputBar/>
      </div>
    </div>
  );
};

export default page;
