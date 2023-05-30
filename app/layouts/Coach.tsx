import Header from "@/app/components/Header";

export default function CoachLayout({ children }: { children: any }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
