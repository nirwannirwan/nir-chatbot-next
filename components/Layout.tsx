interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <main className="flex w-full h-screen items-center justify-center flex-1 flex-col overflow-hidden">
      {children}
    </main>
  );
};
