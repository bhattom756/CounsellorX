'use client'

import * as React from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "./ui/button";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

const Sdebar = () => {
  const [collapsed, setCollapsed] = React.useState(true);
 
  return (
    <div style={{ display: 'flex', height: '100vh', minHeight: '100vh', width: '100%' }}>
      <div className="glass-sidebar" style={{ height: '100vh', display: 'flex' }}>
        <Sidebar
          collapsed={collapsed}
          rootStyles={{
            height: '100%',
          }}
          style={{
            height: '100%',
            background: 'transparent',
            border: 'none',
          }}
        >
          <Menu>
            <MenuItem> Documentation</MenuItem>
            <MenuItem> Calendar</MenuItem>
            <MenuItem> E-commerce</MenuItem>
            <MenuItem> Examples</MenuItem>
          </Menu>
        </Sidebar>
      </div>
      <main style={{ padding: 10, flex: 1 }}>
        <div>
          <Button variant="outline" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ArrowRightToLine size={20}/> : <ArrowLeftToLine size={20}/>}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Sdebar;
