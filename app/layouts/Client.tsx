import Header from "@/app/components/Header";

export default function ClientLayout({ children }: { children: any }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
