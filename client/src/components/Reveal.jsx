import { useReveal } from "../hooks/useReveal";

// Wrap anything in <Reveal> and it fades up when you scroll to it.
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ "--i": delay }}>
      {children}
    </div>
  );
}
