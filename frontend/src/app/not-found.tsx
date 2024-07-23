import Link from "next/link";
import PageHolder from "@/app/components/global/PageHolder";

export default function NotFound() {
  return (
    <PageHolder>
      <h1 className="text-4xl mb-2">404 - Page not found...</h1>
      <Link
        className="text-white font-bold py-1 px-4 rounded-full mt-1 bg-slate-700 hover:bg-slate-600"
        href="/"
      >
        Go back to Map
      </Link>
    </PageHolder>
  );
}
