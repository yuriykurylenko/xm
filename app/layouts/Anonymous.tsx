import styles from "@/app/styles/anonymous.module.css";

export default function AnonymousLayout({ children }: { children: any }) {
  return <div className={styles["blue-background"]}>{children}</div>;
}
