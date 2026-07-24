"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useT } from "@/lib/i18n/LanguageProvider";

import HeroNetworkBackground from "./HeroNetworkBackground";

const AmbientAurora = dynamic(() => import("@/components/three/AmbientAurora"), {
  ssr: false,
});

export default function FitmentSection() {
  const t = useT();
  const [year, setYear] = useState("2024");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("Avanza");
  const [trim, setTrim] = useState("1.5 G CVT");
  const [isScanning, setIsScanning] = useState(false);

  const [counter, setCounter] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [vin, setVin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const garage = mounted ? localStorage.getItem("mobeeli_garage") : null;

  const saveGarage = (val: string) => {
    localStorage.setItem("mobeeli_garage", val);
    setCounter((c) => c + 1);
  };

  const clearGarage = () => {
    localStorage.removeItem("mobeeli_garage");
    setCounter((c) => c + 1);
  };

  const handleYmmChange = (
    y: string,
    m: string,
    mod: string,
    tr: string,
  ) => {
    setYear(y);
    setMake(m);
    setModel(mod);
    setTrim(tr);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      saveGarage(`${m} ${mod} ${tr} ${y}`);
    }, 1800);
  };

  const handleVinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin) return;
    setIsScanning(true);
    setYear("2019");
    setMake("Toyota");
    setModel("Avanza");
    setTrim("1.5 G CVT");
    setTimeout(() => {
      setIsScanning(false);
      saveGarage("Toyota Avanza 1.5 G CVT 2019");
      setVin("");
    }, 1800);
  };

  const parts = [
    { key: "cat_part1_name", price: "Rp 85.000", img: "/assets/parts/spark-plug.jpg" },
    { key: "cat_part2_name", price: "Rp 1.450.000", img: "/assets/parts/clutch.jpg" },
    { key: "cat_part3_name", price: "Rp 850.000", img: "/assets/parts/shock.jpg" },
    { key: "cat_part4_name", price: "Rp 450.000", img: "/assets/parts/brake-pad.jpg" },
  ];

  return (
    <section id="how-it-works" className="mb-fit3d mb-section">
      <AmbientAurora intensity={0.3} />
      <HeroNetworkBackground />
      <div className="mb-fit3d-inner mb-section-inner">
        <div className="mb-fit3d-layout">
          
          {/* Left Column */}
          <div className="mb-fit3d-col mb-fit3d-col--left">
            <h2 data-rev="0" className="mb-h2 mb-h2--fit3d mb-cat-h2">
              {t("cat_unified_h2")}
            </h2>
            <div className="mb-cat-stats">
              <div className="mb-cat-stat">
                <span className="mb-cat-stat-v">{t("cat_unified_stat1_v")}</span>
                <span className="mb-cat-stat-l">{t("cat_unified_stat1_l")}</span>
              </div>
              <div className="mb-cat-stat">
                <span className="mb-cat-stat-v">{t("cat_unified_stat2_v")}</span>
                <span className="mb-cat-stat-l">{t("cat_unified_stat2_l")}</span>
              </div>
              <div className="mb-cat-stat">
                <span className="mb-cat-stat-v">{t("cat_unified_stat3_v")}</span>
                <span className="mb-cat-stat-l">{t("cat_unified_stat3_l")}</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="mb-fit3d-col mb-fit3d-col--right">
            
            <div className="mb-cat-top-row">
              <div key={counter} className="mb-ymm-container mb-cat-ymm" suppressHydrationWarning>
                <div className="mb-step-badge-row">
                  <label className="mb-ymm-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                    Filter Active
                  </label>
                </div>
                {garage && !isScanning ? (
                  <div className="mb-garage-active">
                    <span className="mb-garage-badge">{t("garage_chip_label")}</span>
                    <span className="mb-garage-val">{garage}</span>
                    <button onClick={clearGarage} className="mb-garage-clear">{t("garage_chip_clear")}</button>
                  </div>
                ) : (
                  <div className="mb-picker-forms">
                    <form onSubmit={handleVinSubmit} className="mb-vin-form">
                      <input
                        type="text"
                        value={vin}
                        onChange={e => setVin(e.target.value)}
                        placeholder={t("garage_plate_placeholder")}
                        className="mb-ymm-select mb-vin-input"
                      />
                      <button type="submit" className="mb-vin-btn">{t("garage_plate_btn")}</button>
                    </form>
                    <div className="mb-ymm-picker">
                      <select value={year} aria-label={t("ymm_year")} className="mb-ymm-select" onChange={(e) => handleYmmChange(e.target.value, make, model, trim)}>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                      <select value={make} aria-label={t("ymm_make")} className="mb-ymm-select" onChange={(e) => handleYmmChange(year, e.target.value, model, trim)}>
                        <option value="Toyota">Toyota</option>
                        <option value="Honda">Honda</option>
                        <option value="Mitsubishi">Mitsubishi</option>
                        <option value="Daihatsu">Daihatsu</option>
                        <option value="Hyundai">Hyundai</option>
                      </select>
                      <select value={model} aria-label={t("ymm_model")} className="mb-ymm-select" onChange={(e) => handleYmmChange(year, make, e.target.value, trim)}>
                        <option value="Avanza">Avanza</option>
                        <option value="Innova Zenix">Innova Zenix</option>
                        <option value="Xpander">Xpander</option>
                        <option value="Xenia">Xenia</option>
                        <option value="Stargazer">Stargazer</option>
                      </select>
                      <select value={trim} aria-label={t("ymm_trim")} className="mb-ymm-select" onChange={(e) => handleYmmChange(year, make, model, e.target.value)}>
                        <option value="1.5 G CVT">1.5 G CVT</option>
                        <option value="2.0 V HEV">2.0 V HEV</option>
                        <option value="1.5 Ultimate">1.5 Ultimate</option>
                        <option value="1.5 R CVT">1.5 R CVT</option>
                        <option value="1.5 Prime">1.5 Prime</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className={`mb-cat-car-wrapper ${isScanning ? "is-scanning" : ""}`}>
                <img src="/assets/fitment/catalog-car-poster.jpg" className="mb-cat-car-img" alt="Catalog Car Blueprint" />
                <div className="mb-cat-scan-line" />
              </div>
            </div>

            <div className="mb-cat-grid">
              {parts.map((part, i) => (
                <div key={i} className="mb-cat-card">
                  <div className="mb-cat-card-img-wrap">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <img src={part.img} alt={t(part.key as any)} className="mb-cat-card-img" />
                  </div>
                  <div className="mb-cat-card-info">
                    <div className="mb-cat-card-brand">{t("cat_part_brand")}</div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <div className="mb-cat-card-name">{t(part.key as any)}</div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <div className="mb-cat-card-price">{part.price} <span className="mb-sim-tag">{t("cat_sim_tag" as any)}</span></div>
                  </div>
                  {garage && !isScanning && (
                    <div className="mb-cat-verified">
                      <span className="mb-cat-check">✓</span> {t("cat_part_verified")}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
