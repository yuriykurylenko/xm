import Header from "../components/Header";

export default function ClientLayout({ children }: { children: any }) {
    return (
      <div>
        <Header />
        {children}
      </div>
    );
  }