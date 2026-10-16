import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  id,
  defer = false,
  placeholderClassName = "",
}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.clearTimeout(fallbackTimer);
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    const fallbackTimer = window.setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 1800);

    observer.observe(element);
    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={elementRef}
      id={id}
      className={`scroll-reveal${visible ? " is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {defer && !visible ? (
        <div className={placeholderClassName} aria-hidden="true" />
      ) : (
        children
      )}
    </div>
  );
}
