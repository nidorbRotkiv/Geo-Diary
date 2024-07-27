import Link from "next/link";
import PageHolder from "@/app/components/global/PageHolder";

interface ErrorPageProps {
  header: string;
  text: string;
  link: string;
  linkText: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ header, text, link, linkText }) => {
  return (
    <PageHolder>
      <h1 className="text-4xl my-4">{`${header}:`}</h1>
      <h2 className="text-2xl my-6">{`${text}`}</h2>
      <Link
        className="text-xl text-white font-bold py-2 px-4 rounded-full mt-1 bg-slate-700 hover:bg-slate-600"
        href={link}
      >
        {linkText}
      </Link>
    </PageHolder>
  );
};

export default ErrorPage;
