export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
