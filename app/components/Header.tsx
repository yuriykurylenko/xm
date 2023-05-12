import { useEffect, useRef, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import { useRouter } from "next/router";
import "@/app/globals.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    // Check if the click is outside the dropdown
    if (node.current && !node.current.contains(e.target as Node)) {
      // Cast e.target to Node
      setIsOpen(false);
    }
  };

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const toggle = (e: any) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error logging out:", error.message);
    } else {
      router.push("/login");
    }
  };

  return user ? (
    <header>
      <div className="header-content">
        <div className="user-avatar" onClick={(e) => toggle(e)}>
          {(user as any)?.email?.charAt(0).toUpperCase()}
        </div>
        {isOpen && (
          <div className="popover" ref={node}>
            <p>{(user as any)?.email}</p>
            <button onClick={logout}>Log Out</button>
          </div>
        )}
      </div>
    </header>
  ) : (
    <></>
  );
};

export default Header;
