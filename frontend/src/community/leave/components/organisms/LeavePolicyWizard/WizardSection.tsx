import { JSX, ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

const WizardSection = ({ title, children }: Props): JSX.Element => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <hr className="border-gray-200" />
      </div>
      {children}
    </section>
  );
};

export default WizardSection;
