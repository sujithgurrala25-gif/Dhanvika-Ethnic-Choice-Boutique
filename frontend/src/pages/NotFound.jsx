import EmptyState from "../components/EmptyState.jsx";

export default function NotFound() {
  return (
    <section className="page-shell">
      <EmptyState
        title="Page not found"
        message="This boutique page does not exist."
        actionLabel="Back to Home"
        actionTo="/"
      />
    </section>
  );
}
