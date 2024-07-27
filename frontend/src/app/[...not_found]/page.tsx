import ErrorPage from "../components/global/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      header="404"
      text="Page not found..."
      link="/map"
      linkText="Go back to Map"
    />
  )
}
