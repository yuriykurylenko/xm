import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "@/app/hooks/useAuth";

import styles from "@/app/components/Header/styles.module.css";
import Link from "next/link";
import BasicButton from "@/app/components/BasicButton";

interface HeaderProps {
  menu?: {
    label: string;
    link: string;
  }[];
}

const Header: React.FC<HeaderProps> = ({ menu }) => {
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
          <nav className={styles["menu"]}>
            {menu && (
              <ul>
                {menu.map((item) => (
                  <li
                    key={item.link}
                    className={`${
                      router.asPath === item.link ? styles["active"] : ""
                    }`}
                  >
                    <Link href={item.link}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
          <div className={styles["user-avatar"]} onClick={(e) => toggle(e)}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className={styles["popover"]} ref={node}>
              <p>{user.email}</p>
              <BasicButton onClick={logout}>Log Out</BasicButton>
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
