import { JSX, ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

const WizardSection = ({ title, children }: Props): JSX.Element => {
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
