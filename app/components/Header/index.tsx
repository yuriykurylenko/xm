import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "@/app/hooks/useAuth";

import styles from "@/app/components/Header/styles.module.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logOut } = useAuth();

  const router = useRouter();
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    if (node.current && !node.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const toggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const logout = async () => {
    const error = await logOut();
    if (error) {
      console.log("Error logging out:", error);
    } else {
      router.push("/login");
    }
  };

  return user ? (
    <div className={styles["sticky-header"]}>
      <header>
        <div className={styles["header-content"]}>
          <div className={styles["user-avatar"]} onClick={(e) => toggle(e)}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className={styles["popover"]} ref={node}>
              <p>{user.email}</p>
              <button onClick={logout}>Log Out</button>
            </div>
          )}
        </div>
      </header>
    </div>
  ) : (
    <></>
  );
};

export default Header;
