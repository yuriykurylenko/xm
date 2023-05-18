import Header from "../components/Header";

export default function CoachLayout({ children }: { children: any }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
