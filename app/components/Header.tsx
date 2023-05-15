import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import "@/app/globals.css";
import useAuth from "@/app/utils/useAuth"; // Import the useAuth hook

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logOut } = useAuth(); // Use the user and logOut function from useAuth

  const router = useRouter();
  const node = useRef<HTMLDivElement>(null);

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

  const toggle = (e: any) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const logout = async () => {
    const error = await logOut(); // Use logOut function from useAuth
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
