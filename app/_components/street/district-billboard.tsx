import type { ReactNode } from "react";
import { platformDetails, type ShowcasePlatformName } from "../platform-showcase-content";
import type { District } from "./street-districts";
import styles from "./street-section.module.css";

/**
 * A district's billboard by the road: its art, and over it why the district
 * is worth the stop. Its lamps come on as the car arrives. While you look at
 * one of its exits it advertises that platform instead.
 */
export function DistrictBillboard({
  district,
  firstExit,
  focus,
  lit,
  art,
}: {
  district: District;
  /** The number of its first exit along the street. */
  firstExit: number;
  focus: ShowcasePlatformName | null;
  lit: boolean;
  art: ReactNode;
}) {
  const index = district.exits.findIndex((exit) => exit.name === focus);
  const exit = district.exits[index];

  return (
    <article className={styles.billboard} data-lit={lit || undefined}>
      <span aria-hidden="true" className={styles.lamps}>
        <i />
        <i />
        <i />
      </span>
      <div className={styles.face} data-tone={exit?.light ? "light" : undefined}>
        {art}
        <div aria-hidden="true" className={styles.scrim} />
        <div key={exit?.name ?? district.id} className={styles.copy}>
          <p className={styles.kicker}>
            {exit ? `Exit ${firstExit + index} · ${exit.label}` : `${district.street} · ${district.exits.length} exits`}
          </p>
          <h3 className={styles.reason}>{exit ? exit.line : district.reason}</h3>
          <p className={styles.line}>{exit ? platformDetails[exit.name].description : district.line}</p>
          {!exit && (
            <ul className={styles.facts}>
              {district.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
