import DrawerMenu from "@/app/components/global/DrawerMenu";
import PageHolder from "@/app/components/global/PageHolder";
import { Chokokutai } from "next/font/google";
const chokokutai = Chokokutai({ subsets: ["latin"], weight: ["400"] });

export default function About() {
  return (
    <PageHolder>
      <DrawerMenu />
      <main>
        <h1 className={`pt-5 text-7xl mb-4 ${chokokutai.className}`}>GEO DIARY</h1>
        <p className="text-xl mb-4 italic">- A web app for saving your memories on the map</p>
        <p className="text-xl mb-4">
          - Created by <a href="https://github.com/nidorbRotkiv">@nidorbRotkiv</a>
        </p>
        <p className="text-lg">
          - Powered by <a href="https://nextjs.org/">Next.js</a>,{" "}
          <a href="https://www.typescriptlang.org/">TypeScript</a>,{" "}
          <a href="https://tailwindcss.com/">Tailwind CSS</a>,{" "}
          <a href="https://www.java.com/">Java</a>,{" "}
          <a href="https://spring.io/projects/spring-boot">Spring Boot</a>,{" "}
          <a href="https://maven.apache.org/">Maven</a>,{" "}
          <a href="https://www.maptiler.com/">Maptiler</a>, and{" "}
          <a href="https://www.postgresql.org/">PostgreSQL</a>.
        </p>
      </main>
    </PageHolder>
  );
}
