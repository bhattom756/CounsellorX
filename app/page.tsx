'use client'
import  Sidebar  from "@/components/sidebar";
import InputBar from "@/components/inputbar";

const page = () => {
  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen w-full">
      <Sidebar />
      <InputBar/>
    </div>
  );
};

export default page;
