import dynamic from "next/dynamic";
const Map = dynamic(() => import("../components/Map/Map"), {
  ssr: false,
});

interface SearchParams {
  id: string;
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <Map markerId={searchParams.id} />
    </main>
  );
}
