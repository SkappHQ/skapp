import { FC, ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

const WizardSection: FC<Props> = ({ title, children }) => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h3 className="h2 text-black">{title}</h3>
        <hr className="border-secondary-accent" />
      </div>
      {children}
    </section>
  );
};

export default WizardSection;
