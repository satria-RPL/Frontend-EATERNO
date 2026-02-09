import { memo, ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
};

function CardComponent({ children, className }: Props) {
  return (
    <div className={`bg-slate-50 rounded-2xl p-4 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export default memo(CardComponent);
