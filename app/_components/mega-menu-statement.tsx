type MegaMenuStatementProps = {
  headingId: string;
  title: string;
  description: string;
};

export function MegaMenuStatement({
  headingId,
  title,
  description,
}: MegaMenuStatementProps) {
  return (
    <div className="mx-auto flex min-h-40 w-full max-w-7xl flex-col justify-center px-4 py-10 md:min-h-48 md:px-6 md:py-12">
      <h2
        id={headingId}
        className="text-lg leading-[36px] font-medium tracking-tight sm:text-xl sm:leading-[44px] md:text-3xl md:leading-[56px] md:tracking-tighter"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-base leading-[28px] text-white/75 md:text-lg md:leading-[36px]">
        {description}
      </p>
    </div>
  );
}
