"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Landmark, Smartphone } from "lucide-react";

export interface CountryNode {
  id: string;
  country: string;
  code: string;
  flag: string;
  chs: string[];
  region: string;
}

const DATA: CountryNode[] = [
  {
    id: "ng",
    country: "Nigeria",
    code: "NGN",
    flag: "🇳🇬",
    chs: ["Bank Transfer", "Mobile Money"],
    region: "Africa",
  },
  {
    id: "ke",
    country: "Kenya",
    code: "KES",
    flag: "🇰🇪",
    chs: ["Bank Transfer", "Mobile Money"],
    region: "Africa",
  },
  {
    id: "gh",
    country: "Ghana",
    code: "GHS",
    flag: "🇬🇭",
    chs: ["Bank Transfer", "Mobile Money"],
    region: "Africa",
  },
  {
    id: "ug",
    country: "Uganda",
    code: "UGX",
    flag: "🇺🇬",
    chs: ["Bank Transfer", "Mobile Money"],
    region: "Africa",
  },
  {
    id: "tz",
    country: "Tanzania",
    code: "TZS",
    flag: "🇹🇿",
    chs: ["Bank Transfer", "Mobile Money"],
    region: "Africa",
  },
  {
    id: "mw",
    country: "Malawi",
    code: "MWK",
    flag: "🇲🇼",
    chs: ["Bank Transfer", "Mobile Money"],
    region: "Africa",
  },
  {
    id: "bj",
    country: "Benin",
    code: "XOF",
    flag: "🇧🇯",
    chs: ["Mobile Money"],
    region: "Africa",
  },
  {
    id: "ci",
    country: "Côte d'Ivoire",
    code: "XOF",
    flag: "🇨🇮",
    chs: ["Mobile Money"],
    region: "Africa",
  },
  {
    id: "br",
    country: "Brazil",
    code: "BRL",
    flag: "🇧🇷",
    chs: ["Mobile (PIX)"],
    region: "Americas",
  },
  {
    id: "in",
    country: "India",
    code: "INR",
    flag: "🇮🇳",
    chs: ["Bank Transfer", "Mobile (UPI)"],
    region: "Asia",
  },
];

const REGION_ORDER = ["Africa", "Asia", "Americas"];

export default function CoverageByRegion() {
  const grouped = useMemo(() => {
    const m = new Map<string, CountryNode[]>();
    for (const r of REGION_ORDER) m.set(r, []);
    for (const n of DATA) {
      if (!m.has(n.region)) m.set(n.region, []);
      m.get(n.region)?.push(n);
    }
    // sort countries inside each region
    m.forEach((arr, k) => {
      arr.sort((a, b) => a.country.localeCompare(b.country));
      m.set(k, arr);
    });
    return m;
  }, []);

  const [openRegion, setOpenRegion] = useState(REGION_ORDER[0]);
  const [activeCountryId, setActiveCountryId] = useState<string>(
    DATA[0]?.id || "",
  );

  const activeCountry = useMemo(
    (): CountryNode | null =>
      DATA.find((x) => x.id === activeCountryId) || null,
    [activeCountryId],
  );

  const stats = useMemo(() => {
    const countries = DATA.length;
    const regions = new Set(DATA.map((n) => n.region)).size;
    const methods = new Set(DATA.flatMap((n) => n.chs)).size;
    return { countries, regions, methods };
  }, []);

  return (
    <section
      id="coverage"
      className="py-24 md:py-32 px-4 md:px-6 bg-[#050505] border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
              Coverage
            </div>
            <h2 className="mt-3 text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.95]">
              Corridors by region.
              <span className="text-emerald-500 italic">
                {" "}
                Clear and verifiable.
              </span>
            </h2>
            <p className="mt-4 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
              Browse corridor coverage by region. Select a country to view
              currency and payout methods.
            </p>

            <div className="mt-7 flex gap-8">
              <MiniStat label="Countries" value={stats.countries} />
              <MiniStat label="Regions" value={stats.regions} />
              <MiniStat label="Methods" value={stats.methods} />
            </div>
          </div>

          {/* Right-side note (optional but keeps you honest) */}
          <div className="lg:text-right text-white/45 text-sm max-w-md">
            Coverage expands corridor-by-corridor as partner rails come online.
          </div>
        </div>

        {/* Main */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Regions + country lists */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#070707] overflow-hidden">
            {Array.from(grouped.entries()).map(([region, countries]) => (
              <RegionAccordion
                key={region}
                region={region}
                countries={countries}
                open={openRegion === region}
                onToggle={() =>
                  setOpenRegion(openRegion === region ? "" : region)
                }
                activeCountryId={activeCountryId}
                onSelectCountry={(id) => setActiveCountryId(id)}
              />
            ))}
          </div>

          {/* Right: Details panel */}
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#070707] p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeCountry ? (
                <motion.div
                  key={activeCountry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center">
                        <span className="text-2xl">{activeCountry.flag}</span>
                      </div>
                      <div>
                        <div className="text-white font-black tracking-tight text-xl">
                          {activeCountry.country}
                        </div>
                        <div className="text-[11px] text-white/45 font-semibold uppercase tracking-widest">
                          {activeCountry.region} • {activeCountry.code}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                      Payout methods
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeCountry.chs.map((m) => (
                        <MethodChip key={m} label={m} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <DetailTile label="Currency" value={activeCountry.code} />
                    <DetailTile label="Region" value={activeCountry.region} />
                  </div>

                  <div className="mt-8 text-white/45 text-sm leading-relaxed">
                    This corridor is represented as a payout endpoint.
                    Availability depends on partner rails and local settlement
                    constraints.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/60"
                >
                  Select a country to view corridor details.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

interface RegionAccordionProps {
  region: string;
  countries: CountryNode[];
  open: boolean;
  onToggle: () => void;
  activeCountryId: string;
  onSelectCountry: (id: string) => void;
}

function RegionAccordion({
  region,
  countries,
  open,
  onToggle,
  activeCountryId,
  onSelectCountry,
}: RegionAccordionProps) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left hover:bg-white/2 transition-colors"
        type="button"
      >
        <div>
          <div className="text-white font-black tracking-tight text-xl">
            {region}
          </div>
          <div className="text-[11px] text-white/45 font-semibold uppercase tracking-widest mt-1">
            {countries.length} countries
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6">
              <div className="grid sm:grid-cols-2 gap-2">
                {countries.map((c) => {
                  const active = c.id === activeCountryId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelectCountry(c.id)}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                        active
                          ? "bg-white text-black border-white"
                          : "bg-black/20 border-white/10 text-white/75 hover:border-white/20 hover:bg-white/3"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.flag}</span>
                        <div className="text-sm font-bold tracking-tight">
                          {c.country}
                        </div>
                      </div>
                      <div
                        className={`text-[11px] font-black uppercase tracking-widest ${active ? "text-black/60" : "text-white/35"}`}
                      >
                        {c.code}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070707] px-4 py-3">
      <div className="text-white text-2xl font-black tracking-tight">
        {value}
      </div>
      <div className="text-[10px] text-white/45 font-bold uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <div className="text-[10px] text-white/45 font-bold uppercase tracking-widest">
        {label}
      </div>
      <div className="mt-1 text-white font-black tracking-tight">{value}</div>
    </div>
  );
}

function MethodChip({ label }: { label: string }) {
  const s = label.toLowerCase();
  const isMobile =
    s.includes("mobile") || s.includes("pix") || s.includes("upi");
  const Icon = isMobile ? Smartphone : Landmark;

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
      <Icon className="w-3.5 h-3.5 text-emerald-400/90" />
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
    </div>
  );
}
