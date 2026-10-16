import { useCallback, useEffect, useState } from "react";
import api from "./api";

const pendingGets = new Map();

function getOnce(url, params) {
  const key = `${url}?${JSON.stringify(params)}`;
  let request = pendingGets.get(key);
  if (!request) {
    request = api.get(url, { params }).finally(() => pendingGets.delete(key));
    pendingGets.set(key, request);
  }
  return request;
}

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});
export const money = (n) => peso.format(Number(n || 0));
export const compact = (n) =>
  "₱" +
  new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(n || 0));
export const fmtDate = (d) =>
  d
    ? new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString(
        "en-PH",
        { year: "numeric", month: "short", day: "numeric" }
      )
    : "—";
export const toInputDate = (d) => (d ? String(d).slice(0, 10) : "");

export const STATUSES = ["Planned", "Ongoing", "Completed", "Delayed"];
export const STATUS_STYLE = {
  Planned: "bg-slate-100 text-slate-700 ring-slate-300",
  Ongoing: "bg-malachite-50 text-malachite-800 ring-malachite-500/50",
  Completed: "bg-gov-forest text-white ring-gov-forest",
  Delayed:
    "bg-[var(--color-delayed-soft)] text-[var(--color-delayed)] ring-[var(--color-delayed)]",
};
export const STATUS_COLOR = {
  Planned: "rgb(var(--gray-400))",
  Ongoing: "rgb(var(--green-500))",
  Completed: "rgb(var(--gov-forest))",
  Delayed: "var(--color-delayed)",
};
export const CAT_STYLE = {
  Program: "bg-malachite-50 text-malachite-800 ring-malachite-500/50",
  Event: "bg-slate-100 text-slate-700 ring-slate-300",
  Relief: "bg-green-100 text-green-800 ring-green-300",
};

export function useFetch(url, params = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null)
  );
  const key = JSON.stringify(clean);

  const load = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    getOnce(url, JSON.parse(key))
      .then(
        (r) => alive && setState({ data: r.data, loading: false, error: null })
      )
      .catch(
        (e) =>
          alive &&
          setState({
            data: null,
            loading: false,
            error:
              e.response?.data?.message ||
              "Could not load data. Check that the API is running.",
          })
      );
    return () => {
      alive = false;
    };
  }, [url, key]);

  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}

export function useDebounce(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
