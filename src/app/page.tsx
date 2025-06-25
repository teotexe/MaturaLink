import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">MaturaLink</h1>
      <div className="flex space-x-4">
        <Link href="/dataPage" className="btn btn-primary">
          Data Page
        </Link>
        <Link href="/mapPage" className="btn btn-secondary">
          Map Page
        </Link>
      </div>
    </main>
  );
}
