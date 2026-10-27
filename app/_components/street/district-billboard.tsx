import { memo, type ComponentType } from "react";
import { platformDetails, type ShowcasePlatformName } from "../platform-showcase-content";
import type { ArtProps, District } from "./street-districts";
import styles from "./street-section.module.css";

/**
 * A district's billboard by the road: its art, and over it why the district
 * is worth the stop. Its lamps come on as the car arrives. While you look at
 * one of its exits (or the car's just passed one, on a phone or a tablet) it
 * advertises that platform instead. It renders again only when one of those
 * changes, not every time the car passes something.
 */
export const DistrictBillboard = memo(function DistrictBillboard({
  district,
  firstExit,
  focus,
  lit,
  Art,
}: {
  district: District;
  /** The number of its first exit along the street. */
  firstExit: number;
  focus: ShowcasePlatformName | null;
  lit: boolean;
  Art: ComponentType<ArtProps>;
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
        <Art focus={focus} lit={lit} />
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
});
