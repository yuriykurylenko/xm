import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/app/styles/404.module.css";
import "@/app/globals.css";
import Button from "@/app/components/Form/Button";

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>404</h2>
      <p className={styles.paragraph}>
        Oops! The page you're looking for does not exist.
      </p>
      <button onClick={() => router.back()} className={styles.button}>
        Go Back
      </button>
      or
      <p className={styles.link}>
        <Link href="/">go home</Link>
      </p>
    </div>
  );
};

export default NotFoundPage;
